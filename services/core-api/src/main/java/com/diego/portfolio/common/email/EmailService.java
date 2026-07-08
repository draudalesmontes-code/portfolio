package com.diego.portfolio.common.email;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class EmailService {
    private final RestClient restClient;
    private final String apiKey;
    private final String from;
    private final String baseUrl;
    private final String contactToEmail;

    public EmailService(
        RestClient.Builder restClientBuilder,
        @Value("${app.resend.api-key}") String apiKey,
        @Value("${app.resend.from}") String from,
        @Value("${app.base-url}") String baseUrl,
        @Value("${app.contact.to-email}") String contactToEmail
    ) {
        this.restClient = restClientBuilder
            .baseUrl("https://api.resend.com")
            .build();
        this.apiKey = apiKey;
        this.from = from;
        this.baseUrl = baseUrl;
        this.contactToEmail = contactToEmail;
    }

    public void sendVerificationEmail(String to, String token) {
        String link = baseUrl + "/verify-email?token=" + token;
        Map<String, Object> body = Map.of(
            "from", from,
            "to", List.of(to),
            "subject", "Verify your email",
            "html", "<p>Click <a href=\"" + link + "\">here</a> to verify your email.</p>"
        );

        restClient.post().uri("/emails")
            .header("Authorization", "Bearer " + apiKey)
            .contentType(MediaType.APPLICATION_JSON)
            .body(body)
            .retrieve()
            .toBodilessEntity();
    }

    public void sendEmailChangeConfirmation(String to, String token) {
        String link = baseUrl + "/api/auth/confirm-email-change?token=" + token;
        Map<String, Object> body = Map.of(
            "from", from,
            "to", List.of(to),
            "subject", "Confirm your new email",
            "html", "<p>Click <a href=\"" + link + "\">here</a> to confirm this email address for your portfolio account.</p>"
        );

        sendEmail(body);
    }

    public void sendContactNotification(
        String authorName,
        String contactEmail,
        String subject,
        String message
    ) {
        Map<String, Object> body = Map.of(
            "from", from,
            "to", List.of(contactToEmail),
            "reply_to", contactEmail,
            "subject", "Portfolio contact: " + subject,
            "html",
            "<p><strong>From:</strong> " + escapeHtml(authorName) + "</p>"
                + "<p><strong>Email:</strong> " + escapeHtml(contactEmail) + "</p>"
                + "<p><strong>Subject:</strong> " + escapeHtml(subject) + "</p>"
                + "<hr />"
                + "<p>" + escapeHtml(message).replace("\n", "<br />") + "</p>"
        );

        sendEmail(body);
    }

    private void sendEmail(Map<String, Object> body) {
        restClient.post().uri("/emails")
            .header("Authorization", "Bearer " + apiKey)
            .contentType(MediaType.APPLICATION_JSON)
            .body(body)
            .retrieve()
            .toBodilessEntity();
    }

    private String escapeHtml(String value) {
        return value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }
}
