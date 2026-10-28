package com.resumekit;

import java.util.*;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/** Shared factuality and quality rules. These rules are deliberately deterministic. */
@Component
class ResumeQualityRules {
    private static final Pattern CLAIM = Pattern.compile("(?i)\\b(always|never|best|guaranteed|expert|world[- ]class|unmatched)\\b");
    private static final Pattern PLACEHOLDER = Pattern.compile("\\[[^\\]]{2,80}\\]");
    private static final Set<String> SENSITIVE = Set.of("salary","social security","ssn","password","api key","secret");
    QualityReport review(ResumeSignals signals) {
        List<String> warnings = new ArrayList<>();
        if (signals.words() < 100) warnings.add("The resume is very short; verify that important experience was not omitted.");
        if (signals.words() > 1800) warnings.add("The resume is long; remove repetition before tailoring it.");
        if (signals.lines().stream().anyMatch(this::looksLikeSensitiveData)) warnings.add("Review the document for private data before sharing it.");
        if (signals.metrics().isEmpty()) warnings.add("No numeric impact evidence was found.");
        if (signals.bullets().size() < 3) warnings.add("Use at least three evidence-based bullets where applicable.");
        if (!signals.hasContact()) warnings.add("No email or professional URL was detected.");
        return new QualityReport(List.copyOf(warnings), claims(signals), placeholders(signals));
    }
    boolean safeForRewrite(String text) {
        if (text == null || text.isBlank()) return false;
        return Arrays.stream(text.split("\\R")).noneMatch(this::looksLikeSensitiveData);
    }
    String factualityInstruction() {
        return "Preserve source facts exactly. Never add a credential, employer, date, metric, title, award, " +
                "technology, or outcome unless it appears in the source. Use [verified detail] placeholders " +
                "when a helpful fact is missing. Do not turn an aspiration into an achievement.";
    }
    private List<String> claims(ResumeSignals s) {
        return s.lines().stream().filter(line -> CLAIM.matcher(line).find()).limit(10).toList();
    }
    private List<String> placeholders(ResumeSignals s) {
        var matcher = PLACEHOLDER.matcher(s.text());
        List<String> values = new ArrayList<>();
        while (matcher.find()) values.add(matcher.group());
        return values.stream().distinct().limit(20).toList();
    }
    private boolean looksLikeSensitiveData(String line) {
        String lower = line.toLowerCase(Locale.ROOT);
        return SENSITIVE.stream().anyMatch(lower::contains);
    }
}

record QualityReport(List<String> warnings, List<String> absoluteClaims, List<String> placeholders) {
    boolean hasWarnings() { return !warnings.isEmpty(); }
    String summary() { return warnings.isEmpty() ? "No deterministic quality warnings." : String.join(" ", warnings); }
}
