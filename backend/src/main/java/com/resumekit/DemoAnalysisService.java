package com.resumekit;

import java.util.*;
import org.springframework.stereotype.Service;

/** Builds useful offline results from observable resume evidence, not canned candidate claims. */
@Service
class DemoAnalysisService {
    private final ResumeTextAnalyzer analyzer;
    private final VacancyUrlService vacancies;
    private final RecruiterInsightsService recruiterInsights = new RecruiterInsightsService();
    DemoAnalysisService(ResumeTextAnalyzer analyzer, VacancyUrlService vacancies) {
        this.analyzer = analyzer; this.vacancies = vacancies;
    }
    Analysis analyze(AnalyzeRequest request) {
        ResumeSignals s = analyzer.inspect(request.resume());
        int ats = bounded(48 + s.sections().size() * 5 + (s.hasContact() ? 8 : 0) + s.matchedTerms().size() * 3);
        int recruiter = bounded(46 + s.actionBullets().size() * 4 + s.metrics().size() * 4 + (s.words() > 250 && s.words() < 1_200 ? 10 : 0));
        int readability = bounded(52 + (s.hasUsefulStructure() ? 18 : 0) + (s.chronological() ? 8 : -8) - (s.words() > 1_500 ? 12 : 0));
        int target = bounded(52 + s.matchedTerms().size() * 6 - s.missingTerms().size() * 2);
        RecruiterInsights insights = recruiterInsights.build(s);
        List<String> strengths = strengths(s);
        List<String> weaknesses = weaknesses(s);
        List<String> improvements = improvements(s);
        ScoreEvidence scoreEvidence = new ScoreEvidence(s.sections(), s.matchedTerms(), s.hasContact(),
                s.actionBullets().size(), matchingLines(s.text(), s.actionBullets()),
                s.metrics().size(), matchingLines(s.text(), s.metrics()), s.words(),
                s.chronological(), s.hasUsefulStructure());
        List<String> gaps = insights.roles().isEmpty() ? List.of()
                : insights.roles().get(0).proofMap().stream()
                        .filter(item -> item.status().equals("Not evidenced in resume"))
                        .limit(4).map(ProofItem::skill).toList();
        return new Analysis(bounded((ats + recruiter + readability) / 3), ats, recruiter, readability, target,
                fit(s, target), strengths, weaknesses, improvements,
                keywords(s), gaps.isEmpty() ? skillGaps(s) : gaps, bullets(s), checks(s), insights.roles(),
                insights.careerBridges(), insights.blindSpots(), insights.claimStrength(),
                insights.consistencyChecks(), insights.versionPreviews(), scoreEvidence);
    }
    private List<String> strengths(ResumeSignals s) {
        List<String> result = new ArrayList<>();
        if (s.hasUsefulStructure()) result.add("Clear sections and scannable bullet structure");
        if (s.hasImpact()) result.add("Resume includes observable impact evidence: " + join(s.metrics(), 3));
        if (!s.actionBullets().isEmpty()) result.add("Action-oriented language appears in " + s.actionBullets().size() + " bullet(s)");
        if (s.hasContact()) result.add("Contact or professional links are detectable");
        if (result.isEmpty()) result.add("A factual baseline is available for targeted editing");
        return result;
    }
    private List<String> weaknesses(ResumeSignals s) {
        List<String> result = new ArrayList<>();
        if (s.sections().size() < 3) result.add("Add clear Summary, Experience, Education, or Skills headings");
        if (s.metrics().isEmpty()) result.add("No measurable outcomes were detected; add only verifiable metrics");
        if (s.actionBullets().size() < Math.max(2, s.bullets().size() / 3)) result.add("Use action verbs to clarify ownership without changing facts");
        if (!s.hasContact()) result.add("Add an email or professional link if appropriate");
        if (!s.chronological()) result.add("Check experience dates and reverse chronology");
        return result.isEmpty() ? List.of("Keep transferable, verifiable evidence close to the experience it supports") : result;
    }
    private List<String> improvements(ResumeSignals s) {
        List<String> result = new ArrayList<>();
        if (s.missingTerms().isEmpty()) result.add("Keep the strongest role-relevant terms close to the evidence that supports them");
        else result.add("Use these missing terms only where truthful: " + join(s.missingTerms(), 4));
        if (s.metrics().isEmpty()) result.add("Add [verified metric], [scope], or [outcome] placeholders for later fact checking");
        else result.add("Explain the context and method behind each measurable outcome");
        result.add(s.words() > 1_200 ? "Reduce repetition and keep the most relevant recent evidence" : "Preserve the concise length while adding context to short bullets");
        return result;
    }
    private List<String> keywords(ResumeSignals s) {
        return s.missingTerms().isEmpty() ? s.matchedTerms().stream().limit(6).toList() : s.missingTerms().stream().limit(8).toList();
    }
    private List<String> skillGaps(ResumeSignals s) {
        if (!s.missingTerms().isEmpty()) return s.missingTerms().stream().limit(5).map(this::title).toList();
        return List.of("Add role-specific evidence", "Document measurable outcomes");
    }
    private List<QuantifiedBullet> bullets(ResumeSignals s) {
        return s.bullets().stream().filter(b -> !b.matches("(?s).*(\\d|%|\\$).*")).limit(4)
                .map(b -> new QuantifiedBullet(b, b + " [add verified scope, audience, or outcome]")).toList();
    }
    private List<ScreeningCheck> checks(ResumeSignals s) {
        return List.of(
                check("Profile skill signals", s.matchedTerms().isEmpty(), s.matchedTerms().isEmpty()
                        ? "No role-profile skill terms were detected in extracted text."
                        : s.matchedTerms().size() + " role-profile skill term(s) detected; mentions alone do not prove proficiency."),
                check("Impact evidence", !s.hasImpact(), s.hasImpact() ? s.metrics().size() + " measurable signal(s) detected." : "Add verifiable outcomes, not estimates."),
                check("Clarity & grammar", s.lines().size() < 3, s.hasUsefulStructure() ? "Sections and bullets are easy to scan." : "Use headings and consistent bullets."),
                check("Dates & chronology", !s.chronological(), s.chronological() ? "Dates appear in a consistent order." : "Review date ordering."),
                check("Contact & links", !s.hasContact(), s.hasContact() ? "Contact signal detected." : "No email or URL detected."),
                check("Length & density", s.words() < 180 || s.words() > 1_500, "Detected " + s.words() + " words; keep only relevant evidence."));
    }
    private ScreeningCheck check(String label, boolean warn, String detail) { return new ScreeningCheck(label, warn ? "Needs work" : "Good", detail); }
    private List<String> matchingLines(String text, List<String> evidence) {
        return text.lines().filter(line -> evidence.stream().anyMatch(line::contains))
                .map(line -> line.length() > 500 ? line.substring(0, 500) : line).distinct().limit(5).toList();
    }
    private String fit(ResumeSignals s, int target) {
        String role = s.matchedTerms().isEmpty() ? "broad professional directions" : "inferred role directions";
        return target >= 75 ? "Resume text contains several signals for " + role + "; these are exploratory, not a hiring prediction."
                : "Resume text provides limited signals for " + role + "; treat them as starting points, not promises.";
    }
    private int bounded(int value) { return Math.max(0, Math.min(100, value)); }
    private String join(List<String> values, int max) { return String.join(", ", values.stream().limit(max).toList()); }
    private String title(String value) { return value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1); }
}
