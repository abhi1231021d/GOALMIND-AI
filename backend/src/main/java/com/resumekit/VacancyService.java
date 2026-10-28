package com.resumekit;

import java.util.*;
import org.springframework.stereotype.Service;

/** Orchestrates source-backed vacancy suggestions for the public vacancies endpoint. */
@Service
class VacancyService {
    private final ResumeTextAnalyzer analyzer;
    private final VacancyUrlService urls;
    private final RequestGuard guard;
    private final ResumeExtractionService extraction;

    VacancyService(ResumeTextAnalyzer analyzer, VacancyUrlService urls, RequestGuard guard,
                   ResumeExtractionService extraction) {
        this.analyzer = analyzer; this.urls = urls; this.guard = guard; this.extraction = extraction;
    }

    List<VacancyResponse> find(VacancyRequest request) {
        String resume = guard.resume(extraction.text(new AnalyzeRequest(request.resume(), request.fileName(), request.fileContentBase64())));
        guard.enforceNoProviderSecrets(resume);
        ResumeSignals signals = analyzer.inspect(resume);
        return urls.suggestions("", signals).stream()
                .map(match -> new VacancyResponse(match.title(),
                        urls.linkedin(match.title(), ""), urls.indeed(match.title(), "")))
                .toList();
    }

    VacancySummary summarize(VacancyRequest request) {
        String resume = guard.resume(extraction.text(new AnalyzeRequest(request.resume(), request.fileName(), request.fileContentBase64())));
        guard.enforceNoProviderSecrets(resume);
        ResumeSignals signals = analyzer.inspect(resume);
        List<RoleMatch> matches = urls.suggestions("", signals);
        return new VacancySummary("Recommended roles", "", signals.matchedTerms(), signals.missingTerms(),
                signals.words(), matches.size(), matches);
    }

    String searchUrl(String provider, String role, String location) {
        String normalized = provider == null ? "" : provider.trim().toLowerCase(Locale.ROOT);
        String safeRole = guard.field(role, "role", 300);
        String safeLocation = guard.field(location, "location", 200);
        if (safeRole.isBlank()) throw new IllegalArgumentException("role is required.");
        return switch (normalized) {
            case "linkedin" -> urls.linkedin(safeRole, safeLocation);
            case "indeed" -> urls.indeed(safeRole, safeLocation);
            default -> throw new IllegalArgumentException("Unsupported vacancy provider: " + provider);
        };
    }

    List<VacancyResponse> limit(List<VacancyResponse> results, int maximum) {
        if (maximum < 1 || maximum > 20) throw new IllegalArgumentException("maximum must be between 1 and 20.");
        return results.stream().limit(maximum).toList();
    }
}

record VacancySummary(String role, String location, List<String> matchedTerms,
                      List<String> missingTerms, int resumeWords, int suggestionCount,
                      List<RoleMatch> suggestions) {}
