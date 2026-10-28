package com.example.interview.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public final class InterviewDtos {
    private InterviewDtos() {}

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public record StartRequest(@NotBlank String role, @NotBlank String experienceLevel,
                                @NotBlank String interviewType, List<String> topics, int questionCount,
                                String mode, String projectTitle, @Size(max = 4000) String projectSummary,
                                String company,
                                String resumeContext, List<ProjectContext> projects) {
        public StartRequest(String role, String experienceLevel, String interviewType,
                            List<String> topics, int questionCount, String mode,
                            String projectTitle, String projectSummary, String company) {
            this(role, experienceLevel, interviewType, topics, questionCount, mode,
                 projectTitle, projectSummary, company, null, List.of());
        }
    }

    public record AnswerRequest(@NotBlank @Size(max = 10000) String answer,
                                Integer durationSeconds, Integer pauseCount) {
        public AnswerRequest(String answer) {
            this(answer, null, null);
        }
    }

    public record ClarifyRequest(@NotBlank @Size(max = 1000) String query) {}
    public record ClarificationDto(String candidateQuery, String interviewerAnswer) {}
    public record HintResponse(String hint, int hintsUsed, int remaining) {}
    public record StaffModelDto(String answer, String elevatorPitch,
                                List<String> conceptsCovered, List<String> conceptsMissed) {}

    public record TelemetryDto(int weCount, int iCount, String ownershipVerdict,
                                List<String> fluffDetected, int evidenceScore,
                                boolean hasSituation, boolean hasTask, boolean hasAction, boolean hasResult,
                                String starSummary,
                                int wpm, int fillerWordCount, List<String> fillerWordsDetected,
                                String pacingVerdict, int pauseCount) {
        public TelemetryDto(int weCount, int iCount, String ownershipVerdict,
                            List<String> fluffDetected, int evidenceScore,
                            boolean hasSituation, boolean hasTask, boolean hasAction, boolean hasResult,
                            String starSummary) {
            this(weCount, iCount, ownershipVerdict, fluffDetected, evidenceScore,
                 hasSituation, hasTask, hasAction, hasResult, starSummary,
                 0, 0, List.of(), "Normal pacing", 0);
        }
    }

    public record Rubric(int relevance, int evidence, int reasoning, int clarity, int reflection) {}
    public record QuestionView(Long id, int sequenceNumber, String category, String question, String answer,
                               Integer score, String feedback, boolean accepted, boolean followUp,
                               String learningConcept, String learningExample, String practiceQuestion,
                               String harderFollowUp,
                               StaffModelDto staffModel,
                               TelemetryDto telemetry,
                               List<ClarificationDto> clarifications,
                               int hintsUsed,
                               Rubric rubric) {}
    public record SessionView(Long id, String role, String experienceLevel, String interviewType,
                              List<String> topics, Instant createdAt, Integer score, List<QuestionView> questions,
                              String mode, String projectTitle, String projectSummary, String company) {}
    public record Evaluation(int score, String feedback, boolean accepted) {}
    public record UnifiedAiReview(Evaluation evaluation, String followUp, StaffModelDto staffModel) {}
    public record SkillView(String name, int score, int attempts, String trend, String color) {}
    public record DashboardView(List<SessionView> recentSessions, List<SkillView> skills,
                                int readiness, int totalSessions, int answeredQuestions,
                                int completedSessions) {}
    public record ReplayView(SessionView current, List<SessionView> comparisons) {}
    public record CompanyQuestionView(String id, String company, String category, String interviewRound,
                                      String question, String answerGuidance, String sourceLabel,
                                      String sourceUrl) {}
    public record CompanyLibraryView(String disclaimer, List<String> companies, List<String> categories,
                                     List<String> interviewRounds, List<CompanyQuestionView> questions) {}

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public record ProjectContext(@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max = 120) String title,
                                 @jakarta.validation.constraints.Size(max = 1600) String summary) {}
    public record ResumeContextView(@jakarta.validation.constraints.Size(max = 12000) String resumeContext,
                                    List<ProjectContext> projects, String note) {}
    public record DeletionResponse(int deletedSessions, String message) {}
}
