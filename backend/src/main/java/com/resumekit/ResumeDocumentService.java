package com.resumekit;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

/** Source-backed document preparation used by the document endpoint. */
@Service
class ResumeDocumentService {
    private static final Pattern CONTROL = Pattern.compile("[\\p{Cntrl}&&[^\\r\\n\\t]]");
    private static final Set<String> TEMPLATES = Set.of("classic", "modern", "minimal", "executive");
    private final RtfDocumentService rtf;
    private final RequestGuard guard;

    ResumeDocumentService(RtfDocumentService rtf, RequestGuard guard) {
        this.rtf = rtf;
        this.guard = guard;
    }

    String render(DocumentRequest request) {
        DocumentInput input = normalize(request);
        if (input.text().isBlank()) throw new IllegalArgumentException("Document text is required.");
        if (input.lines() > 10_000) throw new IllegalArgumentException("Document contains too many lines.");
        return rtf.toRtf(input.text(), input.template());
    }

    DocumentInput normalize(DocumentRequest request) {
        if (request == null) throw new IllegalArgumentException("Document request is required.");
        String text = guard.resume(request.text());
        String template = normalizeTemplate(request.template());
        String normalized = normalizeText(text);
        return new DocumentInput(normalized, template, lineCount(normalized), wordCount(normalized),
                characterCount(normalized), hasHeading(normalized), hasBullets(normalized));
    }

    String filename(String template, String role) {
        String safeTemplate = normalizeTemplate(template);
        String safeRole = safeFilename(role);
        if (safeRole.isBlank()) safeRole = "resume";
        return "rewritten-resume-" + safeRole + "-" + safeTemplate + ".rtf";
    }

    String contentDisposition(String template, String role) {
        return "attachment; filename=\"" + filename(template, role) + "\"";
    }

    DocumentMetadata metadata(DocumentRequest request) {
        DocumentInput input = normalize(request);
        return new DocumentMetadata(input.template(), input.lines(), input.words(), input.characters(),
                input.hasHeading(), input.hasBullets(), estimateParagraphs(input.text()));
    }

    boolean isRenderable(DocumentRequest request) {
        try {
            DocumentInput input = normalize(request);
            return !input.text().isBlank() && input.characters() <= 300_000;
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    String plainTextPreview(DocumentRequest request, int maximumCharacters) {
            if (maximumCharacters < 20 || maximumCharacters > 10_000)
                throw new IllegalArgumentException("maximumCharacters must be between 20 and 10000.");
            String text = normalize(request).text();
            if (text.length() <= maximumCharacters) return text;
            return text.substring(0, maximumCharacters).trim() + "…";
        }

    List<String> headings(DocumentRequest request) {
            String text = normalize(request).text();
            return Arrays.stream(text.split("\n"))
                    .map(String::trim)
                    .filter(line -> line.matches("(?i)(summary|profile|experience|education|skills|projects|certifications|work experience)"))
                    .map(String::toUpperCase)
                    .distinct()
                    .toList();
        }

    List<String> bulletLines(DocumentRequest request) {
            return Arrays.stream(normalize(request).text().split("\n"))
                    .map(String::trim)
                    .filter(line -> line.matches("^[•●▪◦*-]\\s+.+"))
                    .map(line -> line.substring(1).trim())
                    .limit(100)
                    .toList();
        }

    String canonicalTemplate(String template) {
            return normalizeTemplate(template);
        }

    boolean hasOnlySupportedTemplate(String template) {
        return template != null && TEMPLATES.contains(template.trim().toLowerCase(Locale.ROOT));
    }

    private String normalizeText(String text) {
        return CONTROL.matcher(text.replace("\r\n", "\n").replace('\r', '\n')
                .replace('\u0000', ' ')).replaceAll("").trim();
    }

    private String normalizeTemplate(String template) {
        String candidate = template == null ? "classic" : template.trim().toLowerCase(Locale.ROOT);
        return TEMPLATES.contains(candidate) ? candidate : "classic";
    }

    private String safeFilename(String value) {
        if (value == null) return "";
        String plain = Normalizer.normalize(value, Normalizer.Form.NFKD)
                .replaceAll("\\p{M}", "").replaceAll("[^A-Za-z0-9]+", "-");
        return plain.replaceAll("^-+|-+$", "").toLowerCase(Locale.ROOT).substring(0,
                Math.min(48, plain.replaceAll("^-+|-+$", "").length()));
    }

    private int lineCount(String text) { return text.isBlank() ? 0 : text.split("\n", -1).length; }
    private int wordCount(String text) { return text.isBlank() ? 0 : text.split("\\s+").length; }
    private int characterCount(String text) { return text.length(); }
    private boolean hasHeading(String text) {
        return Arrays.stream(text.split("\n")).anyMatch(line ->
                line.trim().matches("(?i)(summary|profile|experience|education|skills|projects|certifications|work experience)"));
    }
    private boolean hasBullets(String text) {
        return Arrays.stream(text.split("\n")).anyMatch(line -> line.trim().matches("^[•●▪◦*-]\\s+.+"));
    }
    private int estimateParagraphs(String text) {
        return (int) Arrays.stream(text.split("\\n\\s*\\n")).filter(part -> !part.isBlank()).count();
    }
}

record DocumentInput(String text, String template, int lines, int words, int characters,
                     boolean hasHeading, boolean hasBullets) {}
record DocumentMetadata(String template, int lines, int words, int characters,
                        boolean hasHeading, boolean hasBullets, int paragraphs) {}
