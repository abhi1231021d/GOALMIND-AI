package com.resumekit;

import java.util.*;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

/** Builds role and resume insights only from text that can be located in the source. */
@Service
class RecruiterInsightsService {
    private static final List<RoleProfile> PROFILES = List.of(
            profile("Product Designer", "figma", "research", "design systems", "accessibility", "prototyping", "strategy"),
            profile("UX Researcher", "research", "usability testing", "analytics", "communication", "stakeholder"),
            profile("Product Manager", "strategy", "stakeholder", "roadmap", "analytics", "project management"),
            profile("Data Analyst", "analytics", "sql", "python", "excel", "tableau"),
            profile("Software Engineer", "java", "javascript", "python", "aws", "testing", "sql"),
            profile("Project Manager", "project management", "agile", "jira", "stakeholder", "communication"),
            profile("Business Analyst", "analytics", "sql", "stakeholder", "communication", "project management"),
            profile("Marketing Analyst", "analytics", "marketing", "research", "strategy", "communication"),
            profile("Customer Success Manager", "customer support", "communication", "crm", "analytics", "leadership"),
            profile("Technical Writer", "writing", "documentation", "communication", "java", "javascript"),
            profile("Operations Coordinator", "operations", "project management", "communication", "excel", "collaboration"));

    RecruiterInsights build(ResumeSignals signals) {
        List<RoleProfile> ranked = rankedProfiles(signals);
        List<RoleMatch> roles = ranked.stream().limit(3).map(profile -> role(profile, signals)).toList();
        List<CareerBridge> bridges = ranked.stream().skip(Math.min(1, ranked.size())).limit(4)
                .map(profile -> bridge(profile, signals)).toList();
        return new RecruiterInsights(roles, bridges, blindSpots(signals), claimStrength(signals),
                consistency(signals), versionPreviews(ranked, signals));
    }

    private List<RoleProfile> rankedProfiles(ResumeSignals signals) {
        String detectedTitle = detectedExperienceTitle(signals);
        List<RoleProfile> profiles = PROFILES.stream()
                .filter(profile -> overlap(profile, signals) >= 2 || titleMatches(profile, detectedTitle))
                .sorted(Comparator
                        .comparing((RoleProfile profile) -> titleMatches(profile, detectedTitle)).reversed()
                        .thenComparingDouble((RoleProfile profile) -> weightedScore(profile, signals)).reversed()
                        .thenComparingInt((RoleProfile profile) -> overlap(profile, signals)).reversed())
                .toList();

        List<RoleProfile> diverse = new ArrayList<>();
        for (RoleProfile profile : profiles) {
            if (diverse.isEmpty() || isDifferent(profile, diverse, signals)) {
                diverse.add(profile);
            }
        }
        return diverse;
    }

    private double weightedScore(RoleProfile profile, ResumeSignals signals) {
        List<String> supported = supported(profile, signals);
        if (supported.isEmpty()) return 0;
        double baseScore = (double) supported.size() / Math.max(1, profile.skills().size());
        int coverage = profile.skills().isEmpty() ? 0 : supported.size() * 100 / profile.skills().size();
        double coverageBoost = coverage >= 65 ? 1.5 : coverage >= 35 ? 1.2 : 1.0;
        return baseScore * coverageBoost;
    }

    private boolean isDifferent(RoleProfile candidate, List<RoleProfile> existing, ResumeSignals signals) {
        Set<String> candidateSkills = new HashSet<>(supported(candidate, signals));
        for (RoleProfile profile : existing) {
            Set<String> existingSkills = new HashSet<>(supported(profile, signals));
            Set<String> intersection = new HashSet<>(candidateSkills);
            intersection.retainAll(existingSkills);
            Set<String> union = new HashSet<>(candidateSkills);
            union.addAll(existingSkills);
            double similarity = union.isEmpty() ? 0 : (double) intersection.size() / union.size();
            if (similarity > 0.75) return false;
        }
        return true;
    }

    private String detectedExperienceTitle(ResumeSignals signals) {
        boolean inExperience = false;
        Pattern dateRange = Pattern.compile("(?i)\\b(?:19|20)\\d{2}\\s*(?:-|–|—|to)\\s*(?:present|current|(?:19|20)\\d{2})\\b");
        for (String line : sourceLines(signals)) {
            String heading = line.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z ]", "").trim();
            if (Set.of("experience", "employment", "work experience").contains(heading)) {
                inExperience = true;
                continue;
            }
            if (isSection(line)) {
                inExperience = false;
                continue;
            }
            if (!inExperience || !dateRange.matcher(line).find()) continue;
            String title = line.split("\\s+[·|,@]\\s+|\\s+[–—-]\\s+(?=(?:19|20)\\d{2})", 2)[0]
                    .replaceFirst("^[\\s•●▪◦*-]+", "").trim();
            if (!title.isBlank()) return title;
        }
        return "";
    }

    private boolean titleMatches(RoleProfile profile, String detectedTitle) {
        return !detectedTitle.isBlank()
                && detectedTitle.toLowerCase(Locale.ROOT).contains(profile.title().toLowerCase(Locale.ROOT));
    }

    private RoleMatch role(RoleProfile profile, ResumeSignals signals) {
        List<String> supported = supported(profile, signals);
        List<ProofItem> proof = profile.skills().stream()
                .map(skill -> new ProofItem(title(skill), signals.matchedTerms().contains(skill)
                        ? "Supported by resume text" : "Not evidenced in resume",
                        signals.matchedTerms().contains(skill) ? evidence(signals, skill) : ""))
                .toList();
        int coverage = profile.skills().isEmpty() ? 0 : supported.size() * 100 / profile.skills().size();
        String distance = coverage >= 65 ? "Ready now" : coverage >= 35 ? "Small gap" : "Larger step";
        String distanceNote = switch (distance) {
            case "Ready now" -> "Several role-related skills are evidenced; this is not a hiring prediction.";
            case "Small gap" -> "Some role-related skills are evidenced; review the unsupported skills before deciding.";
            default -> "Evidence is limited for this role; explore it as a longer-term possibility, not a promise.";
        };
        List<String> path = profile.skills().stream().filter(skill -> !signals.matchedTerms().contains(skill))
                .limit(3).map(skill -> "Optional next skill: " + title(skill) + " — learn, practice, then add only when you have real evidence.")
                .toList();
        boolean titleDetected = titleMatches(profile, detectedExperienceTitle(signals));
        int match = Math.min(90, Math.max(25, 35 + coverage / 2));
        if (titleDetected) match = Math.max(match, 70);
        String note = supported.isEmpty()
                ? "No matching skills were found in the extracted text; this is a broad exploration suggestion."
                : "Evidence found for " + String.join(", ", supported.stream().limit(3).map(this::title).toList())
                + ". Role fit is an estimate, not a guarantee.";
        return new RoleMatch(profile.title(), match, note,
                distance, distanceNote, proof, path, supported.stream().map(this::title).toList());
    }

    private CareerBridge bridge(RoleProfile profile, ResumeSignals signals) {
        List<String> shared = supported(profile, signals).stream().limit(4).map(this::title).toList();
        int coverage = shared.size() * 100 / Math.max(1, profile.skills().size());
        String distance = coverage >= 65 ? "Ready now" : coverage >= 35 ? "Small gap" : "Larger step";
        return new CareerBridge(profile.title(), shared,
                "Adjacent-role idea based on transferable skills present in the resume: "
                        + String.join(", ", shared) + ". Verify the role requirements before pursuing it.",
                distance);
    }

    private List<BlindSpot> blindSpots(ResumeSignals signals) {
        Pattern vague = Pattern.compile("(?i)\\b(helped|supported|worked on|responsible for|assisted|contributed to|participated in)\\b");
        return sourceLines(signals).stream().filter(line -> vague.matcher(line).find()).limit(6)
                .map(line -> new BlindSpot(line,
                        "This wording may hide your specific contribution or outcome; the text alone does not establish either.",
                        "What did you personally do, and is there a result or scope you can verify?"))
                .toList();
    }

    private List<ClaimStrength> claimStrength(ResumeSignals signals) {
        Pattern strongAction = Pattern.compile("(?i)\\b(led|built|created|improved|managed|delivered|designed|launched|reduced|increased|developed|owned|analyzed|implemented|shipped|coordinated)\\b");
        Pattern vague = Pattern.compile("(?i)\\b(helped|supported|worked on|responsible for|assisted|contributed to|participated in|various|multiple)\\b");
        Pattern absolute = Pattern.compile("(?i)\\b(always|never|best|guaranteed|expert|world[- ]class|unmatched)\\b");
        LinkedHashSet<String> candidates = new LinkedHashSet<>();
        for (String bullet : signals.bullets()) {
            candidates.add(sourceLines(signals).stream().filter(line -> stripBullet(line).equals(bullet))
                    .findFirst().orElse(bullet));
        }
        sourceLines(signals).stream().filter(line -> vague.matcher(line).find() || absolute.matcher(line).find())
                .forEach(candidates::add);
        return candidates.stream().limit(10).map(original -> {
            boolean isVague = vague.matcher(original).find();
            boolean isAbsolute = absolute.matcher(original).find();
            boolean hasMetric = Pattern.compile("[0-9]").matcher(original).find();
            String strength = isAbsolute || isVague ? "Needs review" :
                    strongAction.matcher(original).find() && hasMetric ? "Specific detail present" : "Could be clearer";
            String reason = isAbsolute ? "An absolute claim may be difficult to verify from this line."
                    : isVague ? "Broad wording does not show an attributable action or outcome."
                    : hasMetric ? "The line includes a numeric detail; confirm its context and source."
                    : "The line may benefit from a clearer action, scope, or verifiable outcome.";
            String prompt = hasMetric ? "[verified context or source for this detail]"
                    : "[verified scope] or [verified outcome] — fill in only if you can confirm it";
            return new ClaimStrength(original, strength, reason, prompt);
        }).toList();
    }

    private List<ConsistencyCheck> consistency(ResumeSignals signals) {
        List<ConsistencyCheck> checks = new ArrayList<>();
        List<String> dateEvidence = signals.dates();
        String dateStatus = dateEvidence.isEmpty() ? "Not enough evidence"
                : signals.chronological() ? "No ordering issue detected" : "Review suggested";
        String dateDetail = dateEvidence.isEmpty()
                ? "No clear date ranges were extracted, so the timeline could not be assessed."
                : signals.chronological() ? "Extracted date ranges appear in reverse chronological order; verify against the original."
                : "The extracted date sequence may not be reverse chronological; extraction can misread formats, so verify the source.";
        checks.add(new ConsistencyCheck("Dates", dateStatus, dateEvidence, dateDetail));

        List<String> titleEvidence = sourceLines(signals).stream()
                .filter(line -> line.matches(".*(?i)(\\s[·|,@]\\s|\\b(19|20)\\d{2}\\b).*"))
                .limit(6).toList();
        checks.add(new ConsistencyCheck("Role titles", titleEvidence.isEmpty() ? "Not enough evidence" : "Review suggested",
                titleEvidence, titleEvidence.isEmpty()
                ? "No clearly structured role-title lines were extracted; no title consistency conclusion is possible."
                : "Check that each title matches the original role and dates. The extracted text alone does not establish a mismatch."));

        List<String> skillEvidence = sectionEvidence(signals, "skills");
        List<String> achievementEvidence = signals.bullets().stream()
                .filter(bullet -> signals.matchedTerms().stream().anyMatch(skill -> contains(bullet, skill)))
                .limit(6).toList();
        String skillsStatus = skillEvidence.isEmpty() || achievementEvidence.isEmpty()
                ? "Not enough evidence" : "Review suggested";
        checks.add(new ConsistencyCheck("Skills & achievements",
                skillsStatus, concat(skillEvidence, achievementEvidence),
                skillEvidence.isEmpty() || achievementEvidence.isEmpty()
                        ? "A skills section or skill-linked achievement text was not clearly extracted; this is not evidence of an inconsistency."
                        : "Compare listed skills with the achievement lines below. A missing example is not proof that a skill is inaccurate."));
        return List.copyOf(checks);
    }

    private List<VersionPreview> versionPreviews(List<RoleProfile> ranked, ResumeSignals signals) {
        return ranked.stream().limit(3).map(profile -> {
            List<String> emphasized = orderedSections(signals.sections(), profile);
            List<String> evidence = profile.skills().stream().filter(signals.matchedTerms()::contains)
                    .map(skill -> evidence(signals, skill)).filter(value -> !value.isBlank()).distinct().limit(4).toList();
            return new VersionPreview(profile.title(), emphasized, evidence,
                    "Preview only: these existing sections and exact lines would be emphasized. The source resume remains unchanged.");
        }).toList();
    }

    private List<String> orderedSections(List<String> existing, RoleProfile profile) {
        List<String> preference = profile.title().contains("Designer") || profile.title().contains("Research")
                ? List.of("experience", "projects", "skills", "summary", "education")
                : profile.title().contains("Engineer") || profile.title().contains("Analyst")
                ? List.of("experience", "projects", "skills", "education", "summary")
                : List.of("experience", "summary", "skills", "projects", "education");
        return preference.stream().filter(existing::contains).toList();
    }

    private int overlap(RoleProfile profile, ResumeSignals signals) {
        return (int) profile.skills().stream().filter(signals.matchedTerms()::contains).count();
    }
    private List<String> supported(RoleProfile profile, ResumeSignals signals) {
        return profile.skills().stream().filter(signals.matchedTerms()::contains).toList();
    }
    private String evidence(ResumeSignals signals, String skill) {
        return sourceLines(signals).stream().filter(line -> contains(line, skill)).findFirst().orElse("");
    }
    private List<String> sourceLines(ResumeSignals signals) {
        return Arrays.stream(signals.text().split("\\R", -1)).filter(line -> !line.isBlank()).toList();
    }
    private List<String> sectionEvidence(ResumeSignals signals, String section) {
        List<String> lines = sourceLines(signals);
        for (int i = 0; i < lines.size(); i++) {
            if (!lines.get(i).trim().equalsIgnoreCase(section)) continue;
            List<String> result = new ArrayList<>();
            for (int j = i + 1; j < lines.size() && result.size() < 3; j++) {
                if (isSection(lines.get(j))) break;
                result.add(lines.get(j));
            }
            return result;
        }
        return List.of();
    }
    private boolean isSection(String value) {
        return Set.of("summary", "profile", "experience", "employment", "work experience",
                "education", "skills", "projects", "certifications", "awards")
                .contains(value.trim().toLowerCase(Locale.ROOT));
    }
    private boolean contains(String line, String term) {
        String expression = "(?i)(?<![\\p{Alnum}])"
                + String.join("\\s+", Arrays.stream(term.split(" ")).map(Pattern::quote).toList())
                + "(?![\\p{Alnum}])";
        return Pattern.compile(expression).matcher(line).find();
    }
    private String stripBullet(String line) {
        return line.replaceFirst("^[\\s•●▪◦*-]+\\s*|^\\d+[.)]\\s+", "").trim();
    }
    private List<String> concat(List<String> first, List<String> second) {
        List<String> result = new ArrayList<>(first);
        result.addAll(second);
        return List.copyOf(result);
    }
    private String title(String value) {
        return Arrays.stream(value.split(" ")).map(part -> part.isEmpty() ? part
                : part.substring(0, 1).toUpperCase(Locale.ROOT) + part.substring(1)).reduce((a, b) -> a + " " + b).orElse(value);
    }
    private static RoleProfile profile(String title, String... skills) {
        return new RoleProfile(title, List.of(skills));
    }
}

record RoleProfile(String title, List<String> skills) {}
record RecruiterInsights(List<RoleMatch> roles, List<CareerBridge> careerBridges,
                         List<BlindSpot> blindSpots, List<ClaimStrength> claimStrength,
                         List<ConsistencyCheck> consistencyChecks, List<VersionPreview> versionPreviews) {}
