package com.diego.portfolio.auth.dto;

import java.time.OffsetDateTime;

public record CurrentUserResponse(
    Long id,
    String email,
    String displayName,
    String role,
    String profileImageUrl,
    OffsetDateTime createdAt
) {
}
