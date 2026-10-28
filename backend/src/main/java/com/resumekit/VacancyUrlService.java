package com.resumekit;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.stereotype.Service;

@Service
class VacancyUrlService {
    List<RoleMatch> suggestions(String targetRole, ResumeSignals signals) {
        LinkedHashMap<String, Integer> roles = new LinkedHashMap<>();
        if (targetRole != null && !targetRole.isBlank()) roles.put(targetRole.trim(), score(targetRole, signals));
        for (String term : signals.matchedTerms()) {
            String role = roleFor(term);
            if (role != null) roles.merge(role, Math.min(94, score(role, signals)), Math::max);
        }
        if (roles.isEmpty()) roles.put("Professional", score("Professional", signals));
        return roles.entrySet().stream().limit(4).map(e -> new RoleMatch(e.getKey(), e.getValue(), note(e.getKey(), signals))).toList();
    }
    String linkedin(String role, String location) { return "https://www.linkedin.com/jobs/search/?keywords=" + encode(role) + locationPart(location); }
    String indeed(String role, String location) { return "https://www.indeed.com/jobs?q=" + encode(role) + locationIndeed(location); }
    private int score(String role, ResumeSignals s) {
        String lower = role.toLowerCase(Locale.ROOT);
        int score = 58 + Math.min(18, s.actionBullets().size() * 3) + Math.min(12, s.metrics().size() * 2);
        for (String term : s.matchedTerms()) if (lower.contains(term) || term.contains(lower)) score += 3;
        return Math.min(98, Math.max(35, score));
    }
    private String roleFor(String term) {
        return switch (term) {
            case "figma", "design systems", "accessibility" -> "Product Designer";
            case "python", "sql", "analytics" -> "Data Analyst";
            case "aws", "java", "javascript" -> "Software Engineer";
            case "stakeholder", "roadmap", "strategy" -> "Product Manager";
            case "project management", "agile" -> "Project Manager";
            default -> null;
        };
    }
    private String note(String role, ResumeSignals s) {
        if (s.metrics().isEmpty()) return "Add a verifiable outcome to strengthen this match";
        if (s.missingTerms().isEmpty()) return "Relevant target vocabulary is evidenced in the resume";
        return "Consider adding only truthful evidence for the target requirements";
    }
    private String encode(String value) { return URLEncoder.encode(value == null ? "" : value.trim(), StandardCharsets.UTF_8); }
    private String locationPart(String value) { return value == null || value.isBlank() ? "" : "&location=" + encode(value); }
    private String locationIndeed(String value) { return value == null || value.isBlank() ? "" : "&l=" + encode(value); }
}
