package com.resumekit;

import java.util.*;
import org.springframework.stereotype.Component;

/** Validates and normalizes model output before it reaches the React contract. */
@Component
class AnalysisContractValidator {
    private static final int MAX_TEXT = 4_000;
    Analysis validate(Analysis value) {
        if (value == null) throw invalid("analysis is null");
        checkScore("overall", value.overall());
        checkScore("ats", value.ats());
        checkScore("recruiter", value.recruiter());
        checkScore("readability", value.readability());
        checkScore("targetMatch", value.targetMatch());
        requireText("roleFit", value.roleFit());
        requireStringList("strengths", value.strengths());
        requireStringList("weaknesses", value.weaknesses());
        requireStringList("improvements", value.improvements());
        requireStringList("keywords", value.keywords());
        requireStringList("skillGaps", value.skillGaps());
        requireList("quantifiedBullets", value.quantifiedBullets());
        requireList("screeningChecks", value.screeningChecks());
        requireList("roles", value.roles());
        requireList("careerBridges", value.careerBridges());
        requireList("blindSpots", value.blindSpots());
        requireList("claimStrength", value.claimStrength());
        requireList("consistencyChecks", value.consistencyChecks());
        requireList("versionPreviews", value.versionPreviews());
        validateScoreEvidence(value.scoreEvidence());
        value.quantifiedBullets().forEach(this::bullet);
        value.screeningChecks().forEach(this::check);
        value.roles().forEach(this::role);
        return value;
    }
    Analysis validate(Analysis value, String resume) {
        validate(value);
        value.roles().forEach(role -> role.proofMap().forEach(item -> proof(item, resume)));
        value.scoreEvidence().actionExamples().forEach(evidence -> requireEvidence(resume, evidence, "score action evidence"));
        value.scoreEvidence().measurableExamples().forEach(evidence -> requireEvidence(resume, evidence, "score measurable evidence"));
        value.careerBridges().forEach(bridge -> {
            requireText("career bridge title", bridge.title());
            requireStringList("career bridge skills", bridge.transferableSkills());
            bridge.transferableSkills().forEach(skill -> requirePresentSkill(resume, skill));
            requireText("career bridge explanation", bridge.explanation());
            requireDistance(bridge.distance());
        });
        value.blindSpots().forEach(item -> {
            requireEvidence(resume, item.evidence(), "blind spot evidence");
            requireText("blind spot inference", item.possibleSignal());
            requireText("blind spot verification question", item.verificationQuestion());
        });
        value.claimStrength().forEach(item -> {
            requireEvidence(resume, item.original(), "claim source");
            requireText("claim strength", item.strength());
            requireText("claim reason", item.reason());
            requireText("claim evidence prompt", item.evidenceToAdd());
        });
        value.consistencyChecks().forEach(item -> {
            requireText("consistency area", item.area());
            requireText("consistency status", item.status());
            requireStringList("consistency evidence", item.evidence());
            item.evidence().forEach(evidence -> requireEvidence(resume, evidence, "consistency evidence"));
            requireText("consistency detail", item.detail());
        });
        value.versionPreviews().forEach(item -> {
            requireText("version role family", item.roleFamily());
            requireStringList("version sections", item.emphasizedSections());
            requireStringList("version evidence", item.evidence());
            item.evidence().forEach(evidence -> requireEvidence(resume, evidence, "version evidence"));
            requireText("version note", item.note());
        });
        value.quantifiedBullets().forEach(item -> requireEvidence(resume, item.original(), "bullet source"));
        return value;
    }
    private void checkScore(String name, int value) {
        if (value < 0 || value > 100) throw invalid(name + " must be between 0 and 100");
    }
    private void requireText(String name, String value) {
        if (value == null || value.isBlank()) throw invalid(name + " must not be blank");
        if (value.length() > MAX_TEXT) throw invalid(name + " is too long");
        if (value.indexOf('\u0000') >= 0) throw invalid(name + " contains an invalid character");
    }
    private void requireList(String name, List<?> value) {
        if (value == null) throw invalid(name + " must be an array");
        if (value.size() > 100) throw invalid(name + " contains too many items");
    }
    private void requireStringList(String name, List<String> values) {
        requireList(name, values);
        if (values == null) return;
        for (String value : values) requireText(name + " item", value);
    }
    private void bullet(QuantifiedBullet value) {
        if (value == null) throw invalid("quantified bullet is null");
        requireText("bullet original", value.original());
        requireText("bullet suggestion", value.suggestion());
    }
    private void validateScoreEvidence(ScoreEvidence value) {
        if (value == null) throw invalid("score evidence is missing");
        requireStringList("score sections", value.sections());
        requireStringList("score role terms", value.roleTerms());
        requireStringList("score action examples", value.actionExamples());
        requireStringList("score measurable examples", value.measurableExamples());
        if (value.sections().size() > 30 || value.roleTerms().size() > 100
                || value.actionExamples().size() > 5 || value.measurableExamples().size() > 5)
            throw invalid("score evidence contains too many examples");
        if (value.actionBulletCount() < 0 || value.measurableDetailCount() < 0 || value.wordCount() < 0)
            throw invalid("score evidence counts must be non-negative");
    }
    private void check(ScreeningCheck value) {
        if (value == null) throw invalid("screening check is null");
        requireText("check label", value.label());
        requireText("check status", value.status());
        requireText("check detail", value.detail());
    }
    private void role(RoleMatch value) {
        if (value == null) throw invalid("role is null");
        requireText("role title", value.title());
        requireText("role note", value.note());
        checkScore("role match", value.match());
        requireDistance(value.distance());
        requireText("role distance explanation", value.distanceNote());
        requireList("role proof map", value.proofMap());
        requireStringList("role skill path", value.skillPath());
        requireStringList("role transferable skills", value.transferableSkills());
        value.proofMap().forEach(item -> {
            if (item == null) throw invalid("proof item is null");
            requireText("proof skill", item.skill());
            requireText("proof status", item.status());
            if (!item.status().equals("Supported by resume text") && !item.status().equals("Not evidenced in resume"))
                throw invalid("proof status is not recognized");
            if (item.status().equals("Supported by resume text")) requireText("proof evidence", item.evidence());
            else if (item.evidence() != null && !item.evidence().isBlank()) throw invalid("unsupported proof cannot include evidence");
        });
    }
    private void proof(ProofItem item, String resume) {
        if (item.status().equals("Supported by resume text")) requireEvidence(resume, item.evidence(), "proof evidence");
    }
    private void requireEvidence(String resume, String evidence, String name) {
        requireText(name, evidence);
        if (!containsEvidence(resume, evidence)) throw invalid(name + " is not an exact resume excerpt");
    }
    private void requirePresentSkill(String resume, String skill) {
        requireText("career bridge skill", skill);
        String lowerSkill = normalizeForMatch(skill);
        String lowerResume = normalizeForMatch(resume == null ? "" : resume);
        boolean present = lowerResume.contains(lowerSkill)
                || (lowerSkill.endsWith("s") && lowerResume.contains(lowerSkill.substring(0, lowerSkill.length() - 1)));
        if (!present)
            throw invalid("career bridge skill is not present in resume text");
    }
    private boolean containsEvidence(String resume, String evidence) {
        if (resume == null || evidence == null || evidence.isBlank()) return false;
        if (resume.contains(evidence)) return true;
        String normResume = normalizeForMatch(resume);
        String normEvidence = normalizeForMatch(evidence);
        return normResume.contains(normEvidence);
    }
    private String normalizeForMatch(String s) {
        return s.replace('\u00A0', ' ')
                .replace('\u2013', '-')
                .replace('\u2014', '-')
                .replace('\u2018', '\'')
                .replace('\u2019', '\'')
                .replace('\u201C', '"')
                .replace('\u201D', '"')
                .replaceAll("\\r\\n|\\r|\\n", " ")
                .replaceAll("\\s+", " ")
                .trim()
                .toLowerCase(Locale.ROOT);
    }
    private void requireDistance(String distance) {
        if (!Set.of("Ready now", "Small gap", "Larger step").contains(distance))
            throw invalid("role distance is not recognized");
    }
    boolean isSafe(Analysis value) {
        try {
            validate(value);
            return true;
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }
    Analysis orFallback(Analysis value, Analysis fallback) {
        return isSafe(value) ? value : fallback;
    }
    String explain(Analysis value) {
        if (isSafe(value)) return "Analysis satisfies the public response contract.";
        if (value == null) return "Analysis is missing.";
        List<String> missing = new ArrayList<>();
        if (value.roleFit() == null || value.roleFit().isBlank()) missing.add("roleFit");
        if (value.strengths() == null) missing.add("strengths");
        if (value.weaknesses() == null) missing.add("weaknesses");
        if (value.improvements() == null) missing.add("improvements");
        if (value.keywords() == null) missing.add("keywords");
        if (value.skillGaps() == null) missing.add("skillGaps");
        if (value.roles() == null) missing.add("roles");
        return missing.isEmpty() ? "Analysis contains invalid values." : "Missing fields: " + String.join(", ", missing);
    }
    private IllegalArgumentException invalid(String detail) {
        return new IllegalArgumentException("Invalid analysis response: " + detail);
    }
}
