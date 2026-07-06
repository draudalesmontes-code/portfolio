package com.diego.portfolio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import com.diego.portfolio.auth.User;
import com.diego.portfolio.auth.UserRepository;
import com.diego.portfolio.common.email.EmailService;
import com.diego.portfolio.feedback.Feedback;
import com.diego.portfolio.feedback.FeedbackRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BackendRegressionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private EmailService emailService;

    @Test
    void userCanRegisterVerifyLoginAndSubmitAuthenticatedFeedback() throws Exception {
        mockMvc.perform(post("/auth/register").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "Diego@Example.com",
                      "password": "password123",
                      "displayName": "  Diego  "
                    }
                    """))
            .andExpect(status().isCreated());

        User registeredUser = userRepository.findByEmail("diego@example.com")
            .orElseThrow();
        assertThat(registeredUser.getDisplayName()).isEqualTo("Diego");
        assertThat(registeredUser.isEmailVerified()).isFalse();
        assertThat(registeredUser.getVerificationToken()).isNotBlank();
        assertThat(registeredUser.getVerificationTokenExpiresAt()).isNotNull();
        assertThat(registeredUser.getPasswordHash()).isNotEqualTo("password123");
        assertThat(passwordEncoder.matches(
            "password123",
            registeredUser.getPasswordHash()
        )).isTrue();
        verify(emailService).sendVerificationEmail(
            "diego@example.com",
            registeredUser.getVerificationToken()
        );

        mockMvc.perform(get("/auth/verify")
                .param("token", registeredUser.getVerificationToken()))
            .andExpect(status().isOk());

        User verifiedUser = userRepository.findByEmail("diego@example.com")
            .orElseThrow();
        assertThat(verifiedUser.isEmailVerified()).isTrue();
        assertThat(verifiedUser.getVerificationToken()).isNull();
        assertThat(verifiedUser.getVerificationTokenExpiresAt()).isNull();

        MvcResult loginResult = mockMvc.perform(post("/auth/login").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "diego@example.com",
                      "password": "password123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(header().exists(HttpHeaders.SET_COOKIE))
            .andExpect(jsonPath("$.token").doesNotExist())
            .andExpect(jsonPath("$.email").value("diego@example.com"))
            .andExpect(jsonPath("$.displayName").value("Diego"))
            .andReturn();

        MockCookie authCookie = MockCookie.parse(
            loginResult.getResponse().getHeader(HttpHeaders.SET_COOKIE)
        );
        assertThat(authCookie.getName()).isEqualTo("auth_token");
        assertThat(authCookie.isHttpOnly()).isTrue();

        mockMvc.perform(get("/auth/me")
                .cookie(new Cookie("auth_token", authCookie.getValue())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("diego@example.com"))
            .andExpect(jsonPath("$.displayName").value("Diego"))
            .andExpect(jsonPath("$.role").value("USER"));

        MvcResult feedbackResult = mockMvc.perform(post("/feedback").with(csrf())
                .cookie(new Cookie("auth_token", authCookie.getValue()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "authorName": "  Diego  ",
                      "contactEmail": "Contact@Example.com",
                      "message": "  Authenticated feedback.  "
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNumber())
            .andReturn();

        long feedbackId = objectMapper
            .readTree(feedbackResult.getResponse().getContentAsString())
            .get("id")
            .asLong();
        Feedback feedback = feedbackRepository.findById(feedbackId).orElseThrow();
        assertThat(feedback.getUserId()).isEqualTo(verifiedUser.getId());
        assertThat(feedback.getAuthorName()).isEqualTo("Diego");
        assertThat(feedback.getContactEmail()).isEqualTo("contact@example.com");
        assertThat(feedback.getMessage()).isEqualTo("Authenticated feedback.");

        mockMvc.perform(post("/auth/logout").with(csrf())
                .cookie(new Cookie("auth_token", authCookie.getValue())))
            .andExpect(status().isNoContent())
            .andExpect(header().string(
                HttpHeaders.SET_COOKIE,
                org.hamcrest.Matchers.containsString("Max-Age=0")
            ));
    }

    @Test
    void guestCanSubmitFeedbackWithoutAnAccount() throws Exception {
        MvcResult result = mockMvc.perform(post("/feedback").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "authorName": "  Guest User  ",
                      "contactEmail": "Guest@Example.com",
                      "message": "  Guest feedback.  "
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNumber())
            .andReturn();

        long feedbackId = objectMapper
            .readTree(result.getResponse().getContentAsString())
            .get("id")
            .asLong();
        Feedback feedback = feedbackRepository.findById(feedbackId).orElseThrow();
        assertThat(feedback.getUserId()).isNull();
        assertThat(feedback.getAuthorName()).isEqualTo("Guest User");
        assertThat(feedback.getContactEmail()).isEqualTo("guest@example.com");
        assertThat(feedback.getMessage()).isEqualTo("Guest feedback.");
    }

    @Test
    void invalidFeedbackReturnsTheSharedValidationErrorShape() throws Exception {
        mockMvc.perform(post("/feedback").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "authorName": "",
                      "contactEmail": "not-an-email",
                      "message": ""
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.message").value("Validation failed"))
            .andExpect(jsonPath("$.path").value("/feedback"))
            .andExpect(jsonPath("$.fields.authorName").exists())
            .andExpect(jsonPath("$.fields.contactEmail").exists())
            .andExpect(jsonPath("$.fields.message").exists());

        assertThat(feedbackRepository.count()).isZero();
    }

    @Test
    void currentUserRequiresAValidAuthenticationCookie() throws Exception {
        mockMvc.perform(get("/auth/me"))
            .andExpect(status().isUnauthorized());
    }
}
