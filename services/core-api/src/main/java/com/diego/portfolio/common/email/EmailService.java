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

    public EmailService(
        RestClient.Builder restClientBuilder,
        @Value("${app.resend.api-key}") String apiKey,
        @Value("${app.resend.from}") String from,
        @Value("${app.base-url}") String baseUrl
    ) {
        this.restClient = restClientBuilder
            .baseUrl("https://api.resend.com")
            .build();
        this.apiKey = apiKey;
        this.from = from;
        this.baseUrl = baseUrl;
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
}
