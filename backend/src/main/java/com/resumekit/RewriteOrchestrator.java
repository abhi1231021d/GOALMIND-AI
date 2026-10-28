package com.resumekit;

import java.util.*;
import org.springframework.stereotype.Service;

/** Coordinates normalization, factuality instructions, and deterministic fallback rewriting. */
@Service
class RewriteOrchestrator {
    private final ResumeTextAnalyzer analyzer;
    private final ResumeQualityRules rules;
    private final RtfDocumentService rtf;
    RewriteOrchestrator(ResumeTextAnalyzer analyzer, ResumeQualityRules rules, RtfDocumentService rtf) {
        this.analyzer = analyzer; this.rules = rules; this.rtf = rtf;
    }
    String offlineRewrite(RewriteRequest request) {
        String source = analyzer.normalize(request.resume());
        ResumeSignals signals = analyzer.inspect(source);
        QualityReport report = rules.review(signals);
        StringBuilder out = new StringBuilder();
        List<String> lines = signals.lines();
        if (!lines.isEmpty()) out.append(lines.get(0)).append('\n');
        out.append("PROFESSIONAL SUMMARY\n");
        out.append("Professional with experience grounded in the source resume. ");
        out.append("Grounded in the evidence supplied. ");
        out.append("Use [brackets] only for facts you can verify. ");
        out.append("Add verified outcomes in [brackets], such as [verified metric], where evidence is missing.\n\n");
        appendBrief(out, request);
        appendSection(out, "SELECTED EXPERIENCE", signals.bullets());
        appendSection(out, "CORE SKILLS", skills(signals));
        if (report.hasWarnings()) out.append("\nREVIEW NOTE\n").append(report.summary()).append('\n');
        return out.toString().trim();
    }
    String toRtf(String rewritten, String template) { return rtf.toRtf(rewritten, template); }
    String factualityInstruction() { return rules.factualityInstruction(); }
    private void appendBrief(StringBuilder out, RewriteRequest request) {
        List<String> details = new ArrayList<>();
        addDetail(details, "Target role", request.targetRole());
        addDetail(details, "Candidate-provided experience, skills, or details", request.experienceDetails());
        addDetail(details, "Job description for emphasis only", request.jobDescription());
        if (details.isEmpty()) return;
        out.append("USER-PROVIDED REWRITE BRIEF\n");
        details.forEach(detail -> out.append(detail).append('\n'));
        out.append("Use candidate-provided details only when explicitly stated; the job description is not evidence about the candidate. Do not invent facts.\n\n");
    }
    private void addDetail(List<String> details, String label, String value) {
        if (value != null && !value.isBlank()) details.add(label + ": " + value.trim());
    }
    private List<String> skills(ResumeSignals s) {
        LinkedHashSet<String> values = new LinkedHashSet<>(s.matchedTerms());
        values.addAll(s.missingTerms().stream().limit(4).toList());
        return values.stream().map(this::title).toList();
    }
    private void appendSection(StringBuilder out, String heading, List<String> values) {
        out.append(heading).append('\n');
        if (values.isEmpty()) out.append("[Add verified evidence here]\n");
        else values.stream().limit(8).forEach(value -> out.append("• ").append(value).append('\n'));
        out.append('\n');
    }
    private String value(String value, String fallback) { return value == null || value.isBlank() ? fallback : value.trim(); }
    private String title(String value) { return value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1); }
}
