package com.resumekit;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
record AnalyzeRequest(@Size(max = 300_000) String resume, @Size(max = 180) String fileName,
                      @Size(max = 12_000_000) String fileContentBase64) {}

record RewriteRequest(@Size(max = 300_000) String resume, @Size(max = 40) String template,
                      @Size(max = 180) String fileName, @Size(max = 12_000_000) String fileContentBase64,
                      @Size(max = 160) String targetRole, @Size(max = 3_000) String experienceDetails,
                      @Size(max = 6_000) String jobDescription) {
    RewriteRequest(String resume, String template, String fileName, String fileContentBase64) {
        this(resume, template, fileName, fileContentBase64, null, null, null);
    }
}

record HealthResponse(boolean ok, String service, boolean providerConfigured) {}
record ConfigResponse(boolean providerConfigured, String model) {}
record RewriteResponse(String rewritten) {}
record DocumentRequest(@NotBlank @Size(max = 300_000) String text, @Size(max = 40) String template) {}
record DocumentResponse(String filename, String contentType, String content) {}
record ResumeDocumentRequest(@Size(max = 300_000) String resume, @Size(max = 180) String fileName,
                             @Size(max = 12_000_000) String fileContentBase64,
                             @Size(max = 160) String targetRole, @Size(max = 3_000) String experienceDetails,
                             @Size(max = 6_000) String jobDescription, @Size(max = 40) String template,
                             boolean includePlaceholders, @Size(max = 20) String accentColor) {
    ResumeDocumentRequest(String resume, String fileName, String fileContentBase64,
                         String targetRole, String experienceDetails, String jobDescription,
                         String template, boolean includePlaceholders) {
        this(resume, fileName, fileContentBase64, targetRole, experienceDetails, jobDescription,
                template, includePlaceholders, null);
    }
}
record ResumeDocumentBlock(String type, String text, String column) {
    ResumeDocumentBlock(String type, String text) { this(type, text, "main"); }
}
record ResumeDocumentPreview(String template, String filename, String targetRole,
                             List<ResumeDocumentBlock> blocks, List<String> checklist,
                             boolean includesPlaceholders, String accentColor) {}
record GeneratedResumeDocument(String filename, byte[] content) {}
record VacancyResponse(String role, String linkedin, String indeed) {}
record VacancyRequest(@Size(max = 300_000) String resume, @Size(max = 180) String fileName,
                      @Size(max = 12_000_000) String fileContentBase64) {}
record VacancySummaryResponse(String role, List<String> matchedTerms,
                              List<String> missingTerms, int resumeWords, int suggestionCount) {}
record DocumentMetadataResponse(String template, int lines, int words, int characters,
                                boolean hasHeading, boolean hasBullets, int paragraphs) {}
record ErrorResponse(String error) {}

@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
record AnalysisScores(int overall, int ats, int recruiter, int readability) {}
record Analysis(int overall, int ats, int recruiter, int readability, int targetMatch,
                String roleFit, List<String> strengths, List<String> weaknesses,
                List<String> improvements, List<String> keywords, List<String> skillGaps,
                List<QuantifiedBullet> quantifiedBullets, List<ScreeningCheck> screeningChecks,
                List<RoleMatch> roles, List<CareerBridge> careerBridges, List<BlindSpot> blindSpots,
                List<ClaimStrength> claimStrength, List<ConsistencyCheck> consistencyChecks,
                List<VersionPreview> versionPreviews, ScoreEvidence scoreEvidence) {}
record ScoreEvidence(List<String> sections, List<String> roleTerms, boolean contactDetected,
                     int actionBulletCount, List<String> actionExamples, int measurableDetailCount,
                     List<String> measurableExamples, int wordCount, boolean chronologyConsistent,
                     boolean hasUsefulStructure) {}
record QuantifiedBullet(String original, String suggestion) {}
record ScreeningCheck(String label, String status, String detail) {}
record RoleMatch(String title, int match, String note, String distance, String distanceNote,
                 List<ProofItem> proofMap, List<String> skillPath, List<String> transferableSkills) {
    RoleMatch(String title, int match, String note) {
        this(title, match, note, "Larger step", "Evidence coverage is limited; this is an exploratory direction, not a prediction.",
                List.of(), List.of(), List.of());
    }
}
record ProofItem(String skill, String status, String evidence) {}
record BlindSpot(String evidence, String possibleSignal, String verificationQuestion) {}
record ClaimStrength(String original, String strength, String reason, String evidenceToAdd) {}
record ConsistencyCheck(String area, String status, List<String> evidence, String detail) {}
record VersionPreview(String roleFamily, List<String> emphasizedSections, List<String> evidence,
                      String note) {}
record CareerBridge(String title, List<String> transferableSkills, String explanation, String distance) {}
