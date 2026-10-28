package com.resumekit;

import java.util.Locale;
import org.springframework.stereotype.Service;

/** Produces a safe RTF download without exposing provider data or interpreting markup. */
@Service
class RtfDocumentService {
    String toRtf(String text, String template) {
        String font = switch (template == null ? "" : template.toLowerCase(Locale.ROOT)) {
            case "modern" -> "Aptos";
            case "minimal" -> "Calibri";
            case "executive" -> "Georgia";
            default -> "Arial";
        };
        StringBuilder result = new StringBuilder("{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 ").append(font).append(";}}\\f0\\fs22 ");
        for (String line : safe(text).split("\n", -1)) result.append(formatLine(line)).append("\\par ");
        return result.append("}").toString();
    }
    private String formatLine(String line) {
        String escaped = escape(line);
        if (line.matches("(?i)^\\s*(summary|profile|experience|education|skills|projects|certifications|selected impact|core skills)\\s*$"))
            return "\\b " + escaped.toUpperCase(Locale.ROOT) + "\\b0 ";
        if (line.matches("^\\s*[•●▪◦*-].*")) return "\\tab " + escaped;
        return escaped;
    }
    private String safe(String value) { return value == null ? "" : value.replace("\u0000", ""); }
    private String escape(String value) {
        StringBuilder out = new StringBuilder();
        for (char c : value.toCharArray()) {
            if (c == '\\' || c == '{' || c == '}') out.append('\\').append(c);
            else if (c == '\t') out.append("\\tab ");
            else if (c == '•') out.append(c);
            else if (c > 127) out.append("\\u").append((short)c).append('?');
            else out.append(c);
        }
        return out.toString();
    }
}
