package com.example.interview.service;

import com.example.interview.api.InterviewDtos;
import com.example.interview.model.*;
import com.example.interview.repository.*;
import com.goalmind.model.User;
import com.goalmind.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class InterviewService {
    private final InterviewSessionRepository sessions;
    private final InterviewQuestionRepository questions;
    private final AiService ai;
    private final AuthService authService;
    private final ObjectMapper mapper = new ObjectMapper();

    public InterviewService(InterviewSessionRepository sessions,
                            InterviewQuestionRepository questions,
                            @org.springframework.beans.factory.annotation.Qualifier("interviewAiService") AiService ai,
                            AuthService authService) {
        this.sessions = sessions;
        this.questions = questions;
        this.ai = ai;
        this.authService = authService;
    }

    private void validateSessionAccess(InterviewSession session) {
        if (session.getUserId() != null) {
            Optional<User> userOpt = authService.getAuthenticatedUserOptional();
            if (userOpt.isEmpty() || !session.getUserId().equals(userOpt.get().getId())) {
                throw new NoSuchElementException("Session not found: " + session.getId());
            }
        }
    }

    @Transactional
    public InterviewDtos.SessionView start(InterviewDtos.StartRequest request) {
        int count = request.questionCount() <= 0 ? 5 : Math.min(request.questionCount(), 10);
        if ("project-defense".equalsIgnoreCase(request.mode())) {
            if (request.projects() != null && request.projects().size() > count) {
                throw new IllegalArgumentException("Project defense requires no more than one project per question.");
            }
        }
        InterviewSession session = new InterviewSession(request.role(), request.experienceLevel(), request.interviewType(),
                String.join(", ", request.topics() == null ? List.of() : request.topics()), request.mode(),
                request.projectTitle(), request.projectSummary(), request.company());
        authService.getAuthenticatedUserOptional().ifPresent(u -> session.setUserId(u.getId()));
        int number = 1;

        if ("project-defense".equalsIgnoreCase(request.mode())) {
            if (request.projects() != null && !request.projects().isEmpty()) {
                int projectIndex = 0;
                for (InterviewDtos.ProjectContext project : request.projects()) {
                    if (session.getQuestions().size() >= count) break;
                    String desc = (project.summary() != null && !project.summary().isBlank())
                            ? project.summary()
                            : "technical architecture and delivery";
                    String qText;
                    if (projectIndex == 0) {
                        qText = "Tell me about your project " + project.title() + ": " + desc + ". What was your role and key technical decisions?";
                    } else if (projectIndex == 1) {
                        qText = "In your project " + project.title() + " (" + desc + "), what was the hardest trade-off or technical constraint you navigated?";
                    } else {
                        qText = "For " + project.title() + " (" + desc + "), how did you validate system reliability, handle failure modes, and measure the impact?";
                    }
                    session.addQuestion(new InterviewQuestion(number++, "Project: " + project.title(), qText));
                    projectIndex++;
                }
            } else if (request.resumeContext() != null && !request.resumeContext().isBlank()) {
                String excerpt = extractResumeExcerpt(request.resumeContext());
                session.addQuestion(new InterviewQuestion(number++, "Resume Evidence",
                        "Your resume says: \"" + excerpt + "\". What was your specific ownership and measurable outcome?"));
            }
        }

        int remaining = count - session.getQuestions().size();
        if (remaining > 0) {
            for (String question : ai.generateQuestions(request.role(), request.experienceLevel(), request.interviewType(),
                    request.topics(), remaining, request.mode(), request.projectTitle(), request.projectSummary(), request.company())) {
                if (session.getQuestions().size() >= count) break;
                String category = "General";
                if (question.startsWith("[")) {
                    int end = question.indexOf(']');
                    if (end > 1) {
                        category = question.substring(1, end);
                        question = question.substring(end + 1).trim();
                    }
                } else if (question.contains(":")) {
                    int end = question.indexOf(':');
                    category = question.substring(0, end);
                    question = question.substring(end + 1).trim();
                }
                session.addQuestion(new InterviewQuestion(number++, category, question));
            }
        }

        return view(sessions.save(session));
    }

    private String extractResumeExcerpt(String resumeContext) {
        for (String line : resumeContext.split("\\R")) {
            String trimmed = line.trim();
            if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
                trimmed = trimmed.replaceFirst("^[•\\-*\\s]+", "").trim();
            }
            if (trimmed.length() > 20 && !trimmed.toUpperCase().equals(trimmed)) {
                return trimmed.length() > 160 ? trimmed.substring(0, 157) + "..." : trimmed;
            }
        }
        return resumeContext.length() > 100 ? resumeContext.substring(0, 97) + "..." : resumeContext;
    }

    @Transactional
    public InterviewDtos.QuestionView answer(long sessionId, long questionId, InterviewDtos.AnswerRequest request) {
        InterviewSession session = sessions.findById(sessionId).orElseThrow();
        validateSessionAccess(session);
        InterviewQuestion question = questions.findById(questionId).orElseThrow();
        if (question.getSession() == null || !question.getSession().getId().equals(session.getId())) {
            throw new NoSuchElementException("Question does not belong to the specified session");
        }
        if (question.getAnswer() != null) throw new IllegalStateException("Question already answered");
        if (request.answer() == null || request.answer().trim().split("\\s+").length < 4 || request.answer().trim().length() < 15) {
            throw new IllegalArgumentException("Answer is too brief to evaluate; no answer or score was saved.");
        }

        String memory = memorySummary(session);
        List<String> askedQuestions = session.getQuestions().stream()
                .filter(q -> q.getAnswer() != null)
                .map(InterviewQuestion::getQuestion)
                .toList();

        // Single-shot unified evaluation, follow-up generation, and Staff model diff
        var review = ai.evaluateAndCoach(session.getRole(), question.getCategory(), session.getInterviewType(),
                question.getQuestion(), request.answer(), memory, askedQuestions);
        var evaluation = review.evaluation();
        String adaptiveFollowUp = review.followUp();
        var staffModel = review.staffModel();

        String contextNote = memory.isBlank() ? "No earlier answer context was available."
                : "Context used from earlier answers: " + memory;

        if (evaluation.accepted() && evaluation.score() < 7) {
            String harderPrompt = (adaptiveFollowUp != null && !adaptiveFollowUp.isBlank())
                    ? adaptiveFollowUp
                    : "How would you adapt this solution at 10x the scale?";
            question.addLearning("Strengthen the core concept and make your reasoning explicit.",
                    "Connect the principle to a concrete project decision and its trade-offs.",
                    "Explain the same solution using one measurable result.",
                    harderPrompt);
        } else if (!evaluation.accepted()) {
            String harderPrompt = (adaptiveFollowUp != null && !adaptiveFollowUp.isBlank())
                    ? adaptiveFollowUp
                    : "Adaptive follow-up: what would you change if the constraints doubled?";
            question.addLearning("Answer structure and technical evidence",
                    "Use context, your specific action, and the measurable result; name the relevant concept.",
                    "Retry this question with a concrete example and one trade-off.",
                    harderPrompt);
        }

        question.setStaffModel(
                staffModel.answer(),
                staffModel.elevatorPitch(),
                serializeStringList(staffModel.conceptsCovered()),
                serializeStringList(staffModel.conceptsMissed())
        );

        var telemetry = ai.analyzeTelemetry(request.answer(), question.getCategory(), request.durationSeconds(), request.pauseCount());
        question.setTelemetryJson(serializeTelemetry(telemetry));

        int score = evaluation.accepted() ? evaluation.score() : 0;
        if (evaluation.accepted() && question.getHintsUsed() > 0) {
            score = Math.max(1, score - question.getHintsUsed());
        }
        question.submit(request.answer(), score, evaluation.feedback() + " " + contextNote);
        questions.save(question);
        updateSessionScore(session);
        return questionView(question);
    }

    @Transactional
    public InterviewDtos.QuestionView defendFollowUp(long sessionId, long questionId, InterviewDtos.AnswerRequest request) {
        InterviewSession session = sessions.findById(sessionId).orElseThrow();
        validateSessionAccess(session);
        InterviewQuestion question = questions.findById(questionId).orElseThrow();
        if (question.getSession() == null || !question.getSession().getId().equals(session.getId())) {
            throw new NoSuchElementException("Question does not belong to the specified session");
        }
        if (question.getAnswer() == null || "Skipped".equals(question.getAnswer())) {
            throw new IllegalStateException("Answer the primary question first before defending the follow-up");
        }
        if (question.isFollowUp()) {
            throw new IllegalStateException("Adaptive follow-up already defended for this question");
        }

        String followUpPrompt = question.getHarderFollowUp() != null && !question.getHarderFollowUp().isBlank()
                ? question.getHarderFollowUp()
                : "What measurable result or trade-off followed from that decision?";
        var followUpEval = ai.evaluate(session.getRole(), question.getCategory(), session.getInterviewType(),
                followUpPrompt, request.answer());

        String combinedAnswer = question.getAnswer() + "\n\n[Follow-Up Defense]: " + request.answer().trim();
        int currentScore = question.getScore() == null ? 0 : question.getScore();
        int bonus = followUpEval.accepted() ? Math.min(2, Math.max(1, followUpEval.score() / 4)) : 0;
        int updatedScore = Math.min(10, currentScore + bonus);

        String updatedFeedback = question.getFeedback() + " | Follow-Up Defense ("
                + (followUpEval.accepted() ? "+" + bonus + " recovery pt(s)" : "0 bonus") + "): " + followUpEval.feedback();

        var staffModel = ai.generateStaffAnswerAndDiff(session.getRole(), question.getCategory(), session.getInterviewType(),
                question.getQuestion(), combinedAnswer);
        question.setStaffModel(
                staffModel.answer(),
                staffModel.elevatorPitch(),
                serializeStringList(staffModel.conceptsCovered()),
                serializeStringList(staffModel.conceptsMissed())
        );

        var telemetry = ai.analyzeTelemetry(combinedAnswer, question.getCategory(), request.durationSeconds(), request.pauseCount());
        question.setTelemetryJson(serializeTelemetry(telemetry));
        question.markFollowUp();
        question.submit(combinedAnswer, updatedScore, updatedFeedback);
        questions.save(question);
        updateSessionScore(session);
        return questionView(question);
    }

    @Transactional
    public InterviewDtos.ClarificationDto clarify(long sessionId, long questionId, InterviewDtos.ClarifyRequest request) {
        InterviewSession session = sessions.findById(sessionId).orElseThrow();
        validateSessionAccess(session);
        InterviewQuestion question = questions.findById(questionId).orElseThrow();
        if (question.getSession() == null || !question.getSession().getId().equals(session.getId())) {
            throw new NoSuchElementException("Question does not belong to the specified session");
        }
        if (question.getAnswer() != null) throw new IllegalStateException("Question already answered");
        var clarification = ai.provideClarification(session.getRole(), session.getInterviewType(), question.getQuestion(), request.query());
        List<InterviewDtos.ClarificationDto> list = new ArrayList<>(parseClarifications(question.getClarificationsJson()));
        list.add(clarification);
        question.setClarificationsJson(serializeClarifications(list));
        questions.save(question);
        return clarification;
    }

    @Transactional
    public InterviewDtos.HintResponse hint(long sessionId, long questionId) {
        InterviewSession session = sessions.findById(sessionId).orElseThrow();
        validateSessionAccess(session);
        InterviewQuestion question = questions.findById(questionId).orElseThrow();
        if (question.getSession() == null || !question.getSession().getId().equals(session.getId())) {
            throw new NoSuchElementException("Question does not belong to the specified session");
        }
        if (question.getAnswer() != null) throw new IllegalStateException("Question already answered");
        if (question.getHintsUsed() >= 3) throw new IllegalStateException("Maximum of 3 hints already used for this question");
        question.incrementHints();
        var hint = ai.provideHint(session.getRole(), session.getInterviewType(), question.getQuestion(), question.getHintsUsed());
        questions.save(question);
        return hint;
    }

    @Transactional
    public InterviewDtos.QuestionView skip(long sessionId, long questionId) {
        InterviewSession session = sessions.findById(sessionId).orElseThrow();
        validateSessionAccess(session);
        InterviewQuestion question = questions.findById(questionId).orElseThrow();
        if (question.getSession() == null || !question.getSession().getId().equals(session.getId())) {
            throw new NoSuchElementException("Question does not belong to the specified session");
        }
        if (question.getAnswer() != null) throw new IllegalStateException("Question already answered");
        question.submit("Skipped", 0, "Question skipped. No marks awarded.");
        questions.save(question);
        updateSessionScore(session);
        return questionView(question);
    }

    private void updateSessionScore(InterviewSession session) {
        int answered = (int) session.getQuestions().stream().filter(q -> q.getScore() != null).count();
        if (answered == session.getQuestions().size()) {
            session.setScore((int) Math.round(session.getQuestions().stream()
                    .mapToInt(InterviewQuestion::getScore).average().orElse(0) * 10));
        }
        sessions.save(session);
    }

    private String memorySummary(InterviewSession session) {
        StringBuilder memory = new StringBuilder();
        for (InterviewQuestion q : session.getQuestions()) {
            if (q.getAnswer() == null || "Skipped".equals(q.getAnswer())) continue;
            String answer = q.getAnswer().replaceAll("\\s+", " ").trim();
            if (answer.length() > 260) answer = answer.substring(0, 260) + "...";
            if (memory.length() > 0) memory.append(" | ");
            memory.append(q.getCategory()).append(": ").append(answer);
        }
        return memory.length() > 2400 ? memory.substring(memory.length() - 2400) : memory.toString();
    }

    @Transactional(readOnly = true)
    public InterviewDtos.SessionView get(long id) {
        InterviewSession session = sessions.findById(id).orElseThrow();
        validateSessionAccess(session);
        return view(session);
    }

    @Transactional(readOnly = true)
    public List<InterviewDtos.SessionView> history() {
        Optional<User> userOpt = authService.getAuthenticatedUserOptional();
        List<InterviewSession> list = userOpt
                .map(u -> sessions.findTop20ByUserIdOrderByCreatedAtDesc(u.getId()))
                .orElseGet(sessions::findTop20ByUserIdIsNullOrderByCreatedAtDesc);
        return list.stream().map(this::view).toList();
    }

    @Transactional
    public void delete(long id) {
        InterviewSession session = sessions.findById(id).orElseThrow(() -> new NoSuchElementException("Session not found: " + id));
        validateSessionAccess(session);
        sessions.delete(session);
    }

    @Transactional
    public int reset() {
        Optional<User> userOpt = authService.getAuthenticatedUserOptional();
        if (userOpt.isPresent()) {
            Long userId = userOpt.get().getId();
            List<InterviewSession> userSessions = sessions.findTop20ByUserIdOrderByCreatedAtDesc(userId);
            int count = userSessions.size();
            sessions.deleteByUserId(userId);
            return count;
        } else {
            List<InterviewSession> guestSessions = sessions.findTop20ByUserIdIsNullOrderByCreatedAtDesc();
            int count = guestSessions.size();
            sessions.deleteByUserIdIsNull();
            return count;
        }
    }

    @Transactional(readOnly = true)
    public InterviewDtos.DashboardView dashboard() {
        List<InterviewDtos.SessionView> recent = history();
        int answered = recent.stream().flatMap(s -> s.questions().stream())
                .mapToInt(q -> q.answer() == null || "Skipped".equals(q.answer()) ? 0 : 1).sum();
        List<InterviewDtos.SessionView> scoredSessions = recent.stream().filter(s -> s.score() != null).toList();
        int readiness = scoredSessions.isEmpty() ? 0
                : (int) Math.round(scoredSessions.stream().mapToInt(InterviewDtos.SessionView::score).average().orElse(0));
        List<InterviewDtos.SkillView> skills = List.of(
                skill("Technical depth", recent, List.of("technical", "project", "general", "payment", "api"), "#6c5ce7"),
                skill("Problem solving", recent, List.of("coding", "problem", "algorithm"), "#3182ce"),
                skill("Communication", recent, List.of("communication", "situational", "hr", "motivation"), "#0f9d91"),
                skill("Behavioral", recent, List.of("behavior", "culture", "collaboration"), "#35a875"),
                skill("System design", recent, List.of("system", "architecture", "scale"), "#e47d2e"));
        int completedSessions = scoredSessions.size();
        return new InterviewDtos.DashboardView(recent, skills, readiness, recent.size(), answered, completedSessions);
    }

    @Transactional(readOnly = true)
    public InterviewDtos.ReplayView replay(long id) {
        InterviewSession target = sessions.findById(id).orElseThrow();
        validateSessionAccess(target);
        List<InterviewDtos.SessionView> comparisons;
        if (target.getUserId() != null) {
            comparisons = sessions
                    .findTop5ByRoleIgnoreCaseAndUserIdAndIdNotOrderByCreatedAtDesc(target.getRole(), target.getUserId(), id)
                    .stream().map(this::view).toList();
        } else {
            comparisons = sessions
                    .findTop5ByRoleIgnoreCaseAndIdNotOrderByCreatedAtDesc(target.getRole(), id)
                    .stream().map(this::view).toList();
        }
        return new InterviewDtos.ReplayView(view(target), comparisons);
    }

    private InterviewDtos.SkillView skill(String name, List<InterviewDtos.SessionView> all, List<String> keywords, String color) {
        List<InterviewDtos.QuestionView> matchedQuestions = all.stream()
                .flatMap(s -> s.questions().stream())
                .filter(q -> keywords.stream().anyMatch(key -> q.category().toLowerCase().contains(key)))
                .toList();
        List<InterviewDtos.QuestionView> answeredQuestions = matchedQuestions.stream()
                .filter(q -> q.answer() != null && !"Skipped".equals(q.answer()) && q.score() != null)
                .toList();
        int score = answeredQuestions.isEmpty() ? 0
                : (int) Math.round(answeredQuestions.stream().mapToInt(q -> q.score() * 10).average().orElse(0));
        return new InterviewDtos.SkillView(name, score, answeredQuestions.size(),
                score >= 70 ? "Building momentum" : "Focus next", color);
    }

    private InterviewDtos.Rubric calculateRubric(int score) {
        int s = Math.max(0, Math.min(10, score));
        int base = s / 5;
        int rem = s % 5;
        return new InterviewDtos.Rubric(
                base + (rem > 0 ? 1 : 0),
                base + (rem > 1 ? 1 : 0),
                base + (rem > 2 ? 1 : 0),
                base + (rem > 3 ? 1 : 0),
                base
        );
    }

    private InterviewDtos.QuestionView questionView(InterviewQuestion q) {
        InterviewDtos.StaffModelDto staffModel = null;
        if (q.getStaffAnswer() != null) {
            List<String> covered = parseStringList(q.getConceptsCovered());
            List<String> missed = parseStringList(q.getConceptsMissed());
            staffModel = new InterviewDtos.StaffModelDto(q.getStaffAnswer(), q.getElevatorPitch(), covered, missed);
        }

        InterviewDtos.TelemetryDto telemetry = null;
        if (q.getAnswer() != null && !"Skipped".equals(q.getAnswer())) {
            telemetry = parseTelemetry(q.getTelemetryJson());
            if (telemetry == null) {
                telemetry = ai.analyzeTelemetry(q.getAnswer(), q.getCategory());
            }
        }

        List<InterviewDtos.ClarificationDto> clarifications = parseClarifications(q.getClarificationsJson());

        InterviewDtos.Rubric rubric = (q.getAnswer() != null && q.getScore() != null)
                ? calculateRubric(q.getScore())
                : null;

        return new InterviewDtos.QuestionView(q.getId(), q.getSequenceNumber(), q.getCategory(), q.getQuestion(),
                q.getAnswer(), q.getScore(), q.getFeedback(), q.getAnswer() != null && q.getScore() != null && q.getScore() > 0,
                q.isFollowUp(), q.getLearningConcept(), q.getLearningExample(), q.getPracticeQuestion(), q.getHarderFollowUp(),
                staffModel, telemetry, clarifications, q.getHintsUsed(),
                rubric);
    }

    private List<String> parseStringList(String raw) {
        if (raw == null || raw.isBlank()) return List.of();
        if (raw.trim().startsWith("[")) {
            try {
                return mapper.readValue(raw, mapper.getTypeFactory().constructCollectionType(List.class, String.class));
            } catch (Exception ignored) {}
        }
        return List.of(raw.split("\\|\\|"));
    }

    private String serializeStringList(List<String> list) {
        if (list == null || list.isEmpty()) return "[]";
        try {
            return mapper.writeValueAsString(list);
        } catch (Exception e) {
            return String.join("||", list);
        }
    }

    private InterviewDtos.TelemetryDto parseTelemetry(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return mapper.readValue(json, InterviewDtos.TelemetryDto.class);
        } catch (Exception e) {
            return null;
        }
    }

    private String serializeTelemetry(InterviewDtos.TelemetryDto telemetry) {
        if (telemetry == null) return null;
        try {
            return mapper.writeValueAsString(telemetry);
        } catch (Exception e) {
            return null;
        }
    }

    private List<InterviewDtos.ClarificationDto> parseClarifications(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return mapper.readValue(json, mapper.getTypeFactory().constructCollectionType(List.class, InterviewDtos.ClarificationDto.class));
        } catch (Exception e) {
            return List.of();
        }
    }

    private String serializeClarifications(List<InterviewDtos.ClarificationDto> list) {
        try {
            return mapper.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }

    private InterviewDtos.SessionView view(InterviewSession s) {
        List<String> topicsList = (s.getTopics() == null || s.getTopics().isBlank())
                ? List.of()
                : List.of(s.getTopics().split(", "));
        return new InterviewDtos.SessionView(s.getId(), s.getRole(), s.getExperienceLevel(), s.getInterviewType(),
                topicsList, s.getCreatedAt(), s.getScore(),
                s.getQuestions().stream().map(this::questionView).toList(), s.getMode(), s.getProjectTitle(), s.getProjectSummary(), s.getCompany());
    }
}
