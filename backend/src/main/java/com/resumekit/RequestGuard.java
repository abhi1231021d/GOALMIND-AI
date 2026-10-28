package com.resumekit;

import java.util.*;
import org.springframework.stereotype.Component;

@Component
class RequestGuard {
    private static final int MAX_RESUME = 300_000;
    String resume(String value) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException("Resume text is required.");
        if (value.length() > MAX_RESUME) throw new IllegalArgumentException("Resume text is too large.");
        if (value.indexOf('\u0000') >= 0) throw new IllegalArgumentException("Resume contains an invalid character.");
        return value.trim();
    }
    String requireResume(String value) {
        String text = resume(value);
        if (!ResumeValidator.isResume(text)) {
            throw new IllegalArgumentException("The uploaded file does not appear to be a resume. Please upload a valid resume containing work experience, skills, education, or career history.");
        }
        return text;
    }
    String field(String value, String name, int max) {
        if (value != null && value.length() > max) throw new IllegalArgumentException(name + " is too long.");
        return value == null ? "" : value.trim();
    }
    String template(String value) {
        String result = field(value, "template", 40).toLowerCase(Locale.ROOT);
        return Set.of("classic","modern","minimal","executive").contains(result) ? result : "classic";
    }
    String tone(String value) {
        String result = field(value, "tone", 100);
        return result.isBlank() ? "Confident and concise" : result;
    }
    void enforceNoProviderSecrets(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        if (lower.contains("openai_api_key") || lower.contains("authorization: bearer")) {
            throw new IllegalArgumentException("Provider credentials are not accepted in request content.");
        }
    }
}
