package com.example.interview.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ai")
public record AiProperties(String baseUrl, String apiKey, String model, int timeoutMs) {}
