package com.diego.portfolio.feedback.dto;

import java.time.OffsetDateTime;

public record SentFeedbackResponse(
    Long id,
    String subject,
    OffsetDateTime sentAt
) {
}
