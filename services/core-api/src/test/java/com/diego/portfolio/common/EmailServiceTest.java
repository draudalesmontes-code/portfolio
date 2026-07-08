package com.diego.portfolio.common;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.diego.portfolio.common.email.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;

class EmailServiceTest {
    private MockRestServiceServer server;
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        RestClient.Builder restClientBuilder = RestClient.builder();
        server = MockRestServiceServer.bindTo(restClientBuilder).build();
        emailService = new EmailService(
            restClientBuilder,
            "test-api-key",
            "Portfolio <onboarding@example.com>",
            "http://localhost",
            "draudalesmontes@gmail.com"
        );
    }

    @Test
    void sendVerificationEmail_sendsExpectedResendRequest() {
        server.expect(once(), requestTo("https://api.resend.com/emails"))
            .andExpect(method(HttpMethod.POST))
            .andExpect(header("Authorization", "Bearer test-api-key"))
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.from").value(
                "Portfolio <onboarding@example.com>"
            ))
            .andExpect(jsonPath("$.to[0]").value("diego@example.com"))
            .andExpect(jsonPath("$.subject").value("Verify your email"))
            .andExpect(jsonPath("$.html").value(containsString(
                "http://localhost/verify-email?token=verification-token"
            )))
            .andRespond(withSuccess());

        emailService.sendVerificationEmail(
            "diego@example.com",
            "verification-token"
        );

        server.verify();
    }

    @Test
    void sendVerificationEmail_resendFailureIsPropagated() {
        server.expect(once(), requestTo("https://api.resend.com/emails"))
            .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        assertThrows(
            HttpServerErrorException.class,
            () -> emailService.sendVerificationEmail(
                "diego@example.com",
                "verification-token"
            )
        );

        server.verify();
    }

    @Test
    void sendContactNotification_sendsExpectedResendRequest() {
        server.expect(once(), requestTo("https://api.resend.com/emails"))
            .andExpect(method(HttpMethod.POST))
            .andExpect(header("Authorization", "Bearer test-api-key"))
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.from").value(
                "Portfolio <onboarding@example.com>"
            ))
            .andExpect(jsonPath("$.to[0]").value("draudalesmontes@gmail.com"))
            .andExpect(jsonPath("$.reply_to").value("visitor@example.com"))
            .andExpect(jsonPath("$.subject").value(
                "Portfolio contact: Project question"
            ))
            .andExpect(jsonPath("$.html").value(containsString(
                "Hello Diego"
            )))
            .andRespond(withSuccess());

        emailService.sendContactNotification(
            "Visitor",
            "visitor@example.com",
            "Project question",
            "Hello Diego"
        );

        server.verify();
    }
}
