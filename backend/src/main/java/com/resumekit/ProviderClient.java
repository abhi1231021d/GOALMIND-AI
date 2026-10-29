package com.resumekit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
class ProviderClient {
    private final ObjectMapper mapper;
    private volatile HttpClient client;
    private final String key, model, baseUrl;

    private HttpClient getClient() {
        if (client == null) {
            synchronized (this) {
                if (client == null) {
                    client = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(2500)).build();
                }
            }
        }
        return client;
    }

    ProviderClient(ObjectMapper mapper, @Value("${resume.provider.api-key:}") String key,
                   @Value("${resume.provider.model:gpt-4o-mini}") String model,
                   @Value("${resume.provider.base-url:https://api.openai.com/v1}") String baseUrl) {
        this.mapper = mapper; this.key = key == null ? "" : key.trim(); this.model = model;
        this.baseUrl = baseUrl.replaceAll("/+$", "");
    }
    boolean configured() { return !key.isBlank(); }
    String model() { return configured() ? model : null; }
    String complete(List<String[]> messages, boolean jsonObject) {
        try {
            var root = mapper.createObjectNode().put("model", model).put("temperature", .35);
            var msg = root.putArray("messages");
            messages.forEach(pair -> msg.addObject().put("role", pair[0]).put("content", pair[1]));
            if (jsonObject) root.putObject("response_format").put("type", "json_object");
            var request = HttpRequest.newBuilder(URI.create(baseUrl + "/chat/completions"))
                    .timeout(Duration.ofSeconds(6)).header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + key)
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(root))).build();
            var response = getClient().send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode payload = mapper.readTree(response.body());
            if (response.statusCode() / 100 != 2)
                throw new IllegalStateException(payload.path("error").path("message").asText("Provider request failed (" + response.statusCode() + ")"));
            return payload.path("choices").path(0).path("message").path("content").asText("");
        } catch (Exception e) {
            if (e instanceof IllegalStateException) throw (IllegalStateException)e;
            throw new IllegalStateException("AI provider request failed: " + e.getMessage(), e);
        }
    }
}
