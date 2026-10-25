package com.goalmind;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.goalmind.dto.LoginRequest;
import com.goalmind.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class GoalMindIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testEndToEndAuthAndProtectedEndpoints() throws Exception {
        // 1. Register a new user with username and strong password
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setUsername("integration_user");
        registerReq.setPassword("P@ssword123!");

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.username").value("integration_user"))
                .andReturn();

        // 2. Reject registering duplicate username
        RegisterRequest dupReq = new RegisterRequest();
        dupReq.setUsername("integration_user");
        dupReq.setPassword("AnotherP@ss123!");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupReq)))
                .andExpect(status().isBadRequest());

        // 3. Reject weak password
        RegisterRequest weakReq = new RegisterRequest();
        weakReq.setUsername("new_user_123");
        weakReq.setPassword("weak");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(weakReq)))
                .andExpect(status().isBadRequest());

        // 4. Login with registered username and password
        LoginRequest loginReq = new LoginRequest();
        loginReq.setUsername("integration_user");
        loginReq.setPassword("P@ssword123!");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.username").value("integration_user"))
                .andReturn();

        String responseJson = loginResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseJson).get("token").asText();

        // 5. Verify accessing protected endpoint with Bearer token
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("integration_user"));

        // 6. Verify accessing dashboard analytics with Bearer token
        mockMvc.perform(get("/api/analytics/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGoals").value(0))
                .andExpect(jsonPath("$.taskCompletionRate").value(0.0));

        // 7. Verify unauthenticated access is rejected with 401 Unauthorized
        mockMvc.perform(get("/api/goals"))
                .andExpect(status().isUnauthorized());
    }
}
