package com.diego.portfolio.auth.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileImageRequest(
    @Size(max = 2048, message = "Profile image URL must be at most 2048 characters")
    String profileImageUrl
) {
}
