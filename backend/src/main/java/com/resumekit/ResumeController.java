package com.resumekit;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
class ResumeController {
    private final ResumeService service; private final ProviderClient provider; private final VacancyService vacancyService;
    ResumeController(ResumeService service, ProviderClient provider, VacancyService vacancyService) {
        this.service=service; this.provider=provider; this.vacancyService=vacancyService;
    }
    @GetMapping("/health") HealthResponse health() { return new HealthResponse(true,"ai-resume-analyzer-api",provider.configured()); }
    @GetMapping("/config") ConfigResponse config() { return new ConfigResponse(provider.configured(), provider.model()); }
    @PostMapping("/analyze") Analysis analyze(@Valid @RequestBody AnalyzeRequest request) { return service.analyze(request); }
    @PostMapping("/rewrite") RewriteResponse rewrite(@Valid @RequestBody RewriteRequest request) { return service.rewrite(request); }
    @PostMapping("/document") DocumentResponse document(@Valid @RequestBody DocumentRequest request) {
        return new DocumentResponse("rewritten-resume-" + (request.template() == null ? "classic" : request.template()) + ".rtf", "application/rtf", service.document(request));
    }
    @PostMapping("/vacancies") java.util.List<VacancyResponse> vacancies(@Valid @RequestBody VacancyRequest request) {
        return vacancyService.find(request);
    }
    @PostMapping("/vacancies/summary") VacancySummaryResponse vacancySummary(@Valid @RequestBody VacancyRequest request) {
        VacancySummary summary = vacancyService.summarize(request);
        return new VacancySummaryResponse(summary.role(), summary.matchedTerms(),
                summary.missingTerms(), summary.resumeWords(), summary.suggestionCount());
    }
    @PostMapping("/document/metadata") DocumentMetadataResponse documentMetadata(@Valid @RequestBody DocumentRequest request) {
        var metadata = service.documentMetadata(request);
        return new DocumentMetadataResponse(metadata.template(), metadata.lines(), metadata.words(),
                metadata.characters(), metadata.hasHeading(), metadata.hasBullets(), metadata.paragraphs());
    }
    @PostMapping("/resume-document/preview")
    ResumeDocumentPreview resumeDocumentPreview(@Valid @RequestBody ResumeDocumentRequest request) {
        return service.resumeDocumentPreview(request);
    }
    @PostMapping("/resume-document/export/{format}")
    ResponseEntity<byte[]> resumeDocument(@Valid @RequestBody ResumeDocumentRequest request,
                                          @PathVariable String format) {
        String normalized = format.toLowerCase(java.util.Locale.ROOT);
        MediaType mediaType = switch (normalized) {
            case "pdf" -> MediaType.APPLICATION_PDF;
            case "docx" -> MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            default -> throw new IllegalArgumentException("Choose PDF or DOCX export.");
        };
        GeneratedResumeDocument document = service.resumeDocumentExport(request, normalized);
        return ResponseEntity.ok().contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.filename() + "\"")
                .body(document.content());
    }
}
