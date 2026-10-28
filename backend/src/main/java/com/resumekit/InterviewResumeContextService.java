package com.resumekit;

import com.example.interview.api.InterviewDtos;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
class InterviewResumeContextService {
    private static final int MAX_CONTEXT = 12_000;
    private static final int MAX_PROJECTS = 8;
    private static final Pattern BULLET = Pattern.compile("^[\\s•●▪◦*-]+\\s*|^\\d+[.)]\\s+");
    private static final Pattern PROJECT_LABEL = Pattern.compile(
            "(?i)^(?:project|initiative|system|product)(?:\\s+(?:name|title))?\\s*[:\\-–—]\\s*(.{2,120})$");
    private static final Pattern NAMED_PROJECT = Pattern.compile(
            "(?i)\\b(?:project|application|platform|tool|system|dashboard|website|mobile app)\\s+"
                    + "(?:called|named|titled)\\s+[\"']?([\\p{L}\\p{N}][\\p{L}\\p{N}&'’(). -]{1,90}?)"
                    + "(?=[\"']?(?:\\s+(?:that|which|to|for|using|built|designed|with)\\b|[.,;!?]|$))");
    private static final Pattern INITIATIVE_PATTERN = Pattern.compile(
            "(?i)(?:(?:led(?:\\s+the)?\\s+(?:redesign|architecture|development|launch|migration|overhaul|rollout|build)"
                    + "|architected|engineered|built|designed|developed|implemented|launched|created)"
                    + "(?:\\s+of)?\\s+(?:the\\s+|an?\\s+)?)"
                    + "([\\p{L}\\p{N}][\\p{L}\\p{N}&'’(). -]{2,55}?"
                    + "\\b(?:analytics platform|platform|system|application|microservice|pipeline|dashboard|engine|framework|portal|design system|infrastructure|mobile app|web app|tool|database))\\b");

    private static final List<String> SECTION_HEADINGS = List.of(
            "summary", "professional summary", "profile", "objective", "experience",
            "work experience", "employment", "professional experience", "education",
            "skills", "technical skills", "certifications", "awards", "publications",
            "volunteer experience", "interests", "references");

    private final ResumeExtractionService extraction;
    private final RequestGuard guard;

    InterviewResumeContextService(ResumeExtractionService extraction, RequestGuard guard) {
        this.extraction = extraction;
        this.guard = guard;
    }

    InterviewDtos.ResumeContextView extract(AnalyzeRequest request) {
        String resume = guard.requireResume(extraction.text(request));
        guard.enforceNoProviderSecrets(resume);
        List<InterviewDtos.ProjectContext> projects = projects(resume);
        String note = projects.isEmpty()
                ? "No clearly named projects were found. Project-defense practice will use resume-based role questions instead of inventing project details."
                : "Extracted " + projects.size() + " project(s) from the resume. Questions will use only the listed resume evidence.";
        return new InterviewDtos.ResumeContextView(resume.substring(0, Math.min(resume.length(), MAX_CONTEXT)),
                projects, note);
    }

    List<InterviewDtos.ProjectContext> projects(String resume) {
        List<MutableProject> found = new ArrayList<>();
        boolean inProjects = false;
        MutableProject current = null;
        for (String sourceLine : resume.split("\\R")) {
            String line = sourceLine.trim();
            if (line.isBlank()) continue;
            String heading = normalizedHeading(line);
            if (isProjectSection(heading)) {
                inProjects = true;
                current = null;
                continue;
            }
            if (isOtherSection(heading)) {
                inProjects = false;
                current = null;
                continue;
            }
            String content = BULLET.matcher(line).replaceFirst("").trim();
            if (inProjects) {
                String[] parts = content.split("\\s+[—–|]\\s+|\\s+-\\s+|:\\s*", 2);
                if (parts.length == 2 && looksLikeTitle(parts[0])) {
                    current = add(found, parts[0]);
                    append(current, parts[1]);
                } else if (looksLikeTitle(content)) {
                    current = add(found, content);
                } else if (current != null) {
                    append(current, content);
                }
            } else {
                Matcher explicit = PROJECT_LABEL.matcher(content);
                if (explicit.matches()) {
                    String[] parts = explicit.group(1).split("\\s+[—–|]\\s+|\\s+-\\s+|:\\s*", 2);
                    MutableProject project = add(found, parts[0]);
                    if (parts.length == 2) append(project, parts[1]);
                } else {
                    Matcher named = NAMED_PROJECT.matcher(content);
                    if (named.find()) {
                        String title = named.group(1).replaceAll("[.,;:]+$", "").trim();
                        MutableProject project = add(found, title);
                        append(project, content);
                    }
                }
            }
        }
        if (found.isEmpty()) {
            for (String sourceLine : resume.split("\\R")) {
                String line = sourceLine.trim();
                if (line.isBlank()) continue;
                String heading = normalizedHeading(line);
                if (isOtherSection(heading) && !heading.contains("experience") && !heading.contains("employment")) {
                    continue;
                }
                String content = BULLET.matcher(line).replaceFirst("").trim();
                Matcher initiative = INITIATIVE_PATTERN.matcher(content);
                if (initiative.find()) {
                    String matched = initiative.group(1).trim().replaceFirst("(?i)^(?:of|the|a|an)\\s+", "").trim();
                    if (matched.length() >= 5 && matched.split("\\s+").length >= 2) {
                        String title = toTitleCase(matched);
                        MutableProject project = add(found, title);
                        append(project, content);
                        if (found.size() >= 4) break;
                    }
                }
            }
        }
        return found.stream().limit(MAX_PROJECTS)
                .map(project -> new InterviewDtos.ProjectContext(project.title, project.summary.toString()))
                .toList();
    }

    private String toTitleCase(String text) {
        if (text == null || text.isBlank()) return text;
        String[] words = text.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (word.isEmpty()) continue;
            if (!sb.isEmpty()) sb.append(' ');
            sb.append(Character.toUpperCase(word.charAt(0)));
            if (word.length() > 1) {
                sb.append(word.substring(1).toLowerCase(Locale.ROOT));
            }
        }
        return sb.toString();
    }

    private MutableProject add(List<MutableProject> projects, String rawTitle) {
        String title = rawTitle.replaceAll("^[\\s•●▪◦*\\-]+|[.!,;:]+$", "").trim();
        if (title.length() > 120) title = title.substring(0, 120).trim();
        String key = title.toLowerCase(Locale.ROOT);
        for (MutableProject project : projects) {
            if (project.title.toLowerCase(Locale.ROOT).equals(key)) return project;
        }
        MutableProject project = new MutableProject(title);
        projects.add(project);
        return project;
    }

    private void append(MutableProject project, String line) {
        if (project == null || line.isBlank() || project.summary.length() >= 1600) return;
        if (!project.summary.isEmpty()) project.summary.append(' ');
        int remaining = 1600 - project.summary.length();
        project.summary.append(line, 0, Math.min(line.length(), remaining));
    }

    private String normalizedHeading(String line) {
        return line.toLowerCase(Locale.ROOT).replaceAll("[:\\s]+$", "")
                .replaceAll("\\s+", " ").trim();
    }

    private boolean isProjectSection(String heading) {
        return heading.matches("(?i)(?:(?:selected|personal|academic|course|key|side|technical|relevant|featured|notable|significant)\\s+)?(?:projects?|initiatives|deliverables|portfolio)(?:\\s+(?:experience|work|portfolio))?")
                || heading.matches("(?i)(?:projects?|initiatives)\\s*(?:&|and|\\+)\\s*.*")
                || heading.matches("(?i)(?:project experience|portfolio projects|project work)");
    }

    private boolean isOtherSection(String heading) {
        return SECTION_HEADINGS.contains(heading);
    }

    private boolean looksLikeTitle(String value) {
        String title = value.trim();
        if (title.length() < 3 || title.length() > 120 || title.split("\\s+").length > 9) return false;
        if (title.matches("(?i)(?:technologies|tech stack|tools|responsibilities|description)")) return false;
        if (title.matches(".*[.!?].*")) return false;
        if (title.matches("(?i)^(?:built|developed|created|designed|implemented|led|used|integrated|deployed|collaborated|responsible)\\b.*")) return false;
        return Character.isUpperCase(title.charAt(0)) || title.matches("(?i).*(?:project|capstone|portfolio).*");
    }

    private static final class MutableProject {
        private final String title;
        private final StringBuilder summary = new StringBuilder();

        private MutableProject(String title) { this.title = title; }
    }
}
