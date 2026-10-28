package com.example.interview.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

@Configuration
@EnableConfigurationProperties(AiProperties.class)
public class AppConfig {
    @Bean
    RestClient aiClient(AiProperties properties) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        int connectTimeout = properties.timeoutMs() > 0 ? Math.min(1500, properties.timeoutMs()) : 1500;
        int readTimeout = properties.timeoutMs() > 0 ? properties.timeoutMs() : 8000;
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);
        String baseUrl = properties.baseUrl() != null
                ? properties.baseUrl().replace("http://localhost:", "http://127.0.0.1:")
                : "http://127.0.0.1:11434/v1";
        return RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }
}
