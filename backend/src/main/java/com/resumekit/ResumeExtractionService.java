package com.resumekit;

import java.io.ByteArrayInputStream;
import java.util.Base64;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import org.apache.tika.config.TikaConfig;
import org.apache.tika.exception.EncryptedDocumentException;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.metadata.TikaCoreProperties;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;

@Service
class ResumeExtractionService {
    static final int MAX_DECODED_BYTES = 9 * 1024 * 1024;
    private static final Set<String> BLOCKED_BINARY_EXTENSIONS = Set.of(
            "exe", "dll", "so", "bin", "sys", "com", "iso", "dmg");
    private static final Pattern UNSAFE_CONTROL = Pattern.compile("[\\p{Cntrl}&&[^\\r\\n\\t]]");
    private final TikaConfig tika = TikaConfig.getDefaultConfig();

    String text(AnalyzeRequest request) {
        if (request == null) throw new IllegalArgumentException("Analyze request is required.");
        if (request.fileContentBase64() == null || request.fileContentBase64().isBlank())
            return request.resume() == null ? "" : request.resume();
        try {
            byte[] bytes = Base64.getMimeDecoder().decode(request.fileContentBase64());
            if (bytes.length == 0) throw new IllegalArgumentException("Resume file is empty.");
            if (bytes.length > MAX_DECODED_BYTES) throw new IllegalArgumentException("Resume file is too large (maximum 9 MB).");

            Metadata metadata = new Metadata();
            metadata.set(TikaCoreProperties.RESOURCE_NAME_KEY, request.fileName() == null ? "" : request.fileName());
            String type = tika.getDetector().detect(new ByteArrayInputStream(bytes), metadata)
                    .toString().toLowerCase(Locale.ROOT);
            type = type.split(";", 2)[0].trim();
            if (isBlocked(type, request.fileName()))
                throw new IllegalArgumentException("Unsupported resume file type. Executable files are not supported.");

            if ("application/pdf".equals(type) || "pdf".equalsIgnoreCase(extension(request.fileName()))) {
                try {
                    String pdfText = ColumnAwarePdfStripper.extractText(bytes);
                    String result = clean(pdfText);
                    if (result.isBlank()) {
                        throw new IllegalArgumentException("This PDF contains no selectable text. Scanned or image-only PDFs need OCR before upload.");
                    }
                    return result;
                } catch (org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException e) {
                    throw new IllegalArgumentException("This resume file is encrypted or password-protected. Remove the password and try again.");
                } catch (IllegalArgumentException e) {
                    throw e;
                } catch (Exception e) {
                    // Fall back to Tika parser if PDFBox layout stripper encounters an unusual stream
                }
            }

            BodyContentHandler handler = new BodyContentHandler(-1);
            AutoDetectParser parser = new AutoDetectParser(tika);
            parser.parse(new ByteArrayInputStream(bytes), handler, metadata, new ParseContext());
            String result = clean(handler.toString());
            if (result.isBlank()) {
                if ("application/pdf".equals(type))
                    throw new IllegalArgumentException("This PDF contains no selectable text. Scanned or image-only PDFs need OCR before upload.");
                throw new IllegalArgumentException("The file contains no readable text.");
            }
            return result;
        } catch (EncryptedDocumentException e) {
            throw new IllegalArgumentException("This resume file is encrypted or password-protected. Remove the password and try again.");
        } catch (IllegalArgumentException e) { throw e; }
        catch (Exception e) { throw new IllegalArgumentException("Could not extract readable resume text from that file."); }
    }

    private boolean isBlocked(String type, String name) {
        String ext = extension(name);
        return BLOCKED_BINARY_EXTENSIONS.contains(ext) || type.equals("application/x-msdownload")
                || type.equals("application/x-executable") || type.equals("application/x-sharedlib");
    }

    private String extension(String name) {
        if (name == null) return "";
        int dot = name.lastIndexOf('.');
        return dot < 0 ? "" : name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private String clean(String value) {
        return UNSAFE_CONTROL.matcher(value.replace("\r\n", "\n").replace('\r', '\n').replace('\f', '\n'))
                .replaceAll("")
                .lines()
                .map(line -> line.stripTrailing())
                .reduce((left, right) -> left + "\n" + right)
                .orElse("")
                .replaceAll("\n{3,}", "\n\n")
                .trim();
    }
}
