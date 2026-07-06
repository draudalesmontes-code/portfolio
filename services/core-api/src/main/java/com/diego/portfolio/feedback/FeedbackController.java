package com.diego.portfolio.feedback;

import com.diego.portfolio.feedback.dto.FeedbackRequest;
import com.diego.portfolio.feedback.dto.SentFeedbackResponse;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
public class FeedbackController {
    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<Map<String, Long>> submitFeedback(
        @Valid @RequestBody FeedbackRequest request,
        Authentication authentication
    ) {
        String authenticatedEmail = null;
        if (authentication != null
            && !(authentication instanceof AnonymousAuthenticationToken)) {
            authenticatedEmail = authentication.getName();
        }

        Long feedbackId = feedbackService.submit(request, authenticatedEmail);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(Map.of("id", feedbackId));
    }

    @GetMapping("/mine")
    public List<SentFeedbackResponse> mine(
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authentication is required."
            );
        }
        return feedbackService.getMine(authentication.getName());
    }
}
