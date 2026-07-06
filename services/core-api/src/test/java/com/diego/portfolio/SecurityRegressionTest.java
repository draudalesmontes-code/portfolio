package com.diego.portfolio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.diego.portfolio.common.email.EmailService;
import com.diego.portfolio.feedback.FeedbackRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityRegressionTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @MockitoBean
    private EmailService emailService;

    @Test
    void csrfEndpoint_issuesTokenForBrowserClients() throws Exception {
        mockMvc.perform(get("/auth/csrf"))
            .andExpect(status().isOk())
            .andExpect(cookie().exists("XSRF-TOKEN"))
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andExpect(jsonPath("$.headerName").value("X-XSRF-TOKEN"));
    }

    @Test
    void stateChangingRequest_withoutCsrfToken_isRejected() throws Exception {
        mockMvc.perform(post("/feedback")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "authorName": "Attacker",
                      "contactEmail": "attacker@example.com",
                      "message": "Cross-site submission"
                    }
                    """))
            .andExpect(status().isForbidden());

        assertThat(feedbackRepository.count()).isZero();
    }

    @Test
    void unexpectedJsonProperties_areRejected() throws Exception {
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "diego@example.com",
                      "password": "password123",
                      "role": "ADMIN"
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void publicAuthEndpoints_doNotRequireCsrfToken() throws Exception {
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "public@example.com",
                      "password": "password123",
                      "displayName": "Public User"
                    }
                    """))
            .andExpect(status().isCreated());
    }

    @Test
    void unspecifiedEndpoint_isNotPubliclyAccessible() throws Exception {
        mockMvc.perform(post("/games/future-admin-action").with(csrf()))
            .andExpect(status().is4xxClientError());
    }

    @Test
    void protectedProfileEndpoint_requiresAuthentication() throws Exception {
        mockMvc.perform(get("/auth/me"))
            .andExpect(status().isUnauthorized());
    }
}
