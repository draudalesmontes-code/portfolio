package com.diego.portfolio.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangeEmailRequest(
    @NotBlank(message = "New email is required")
    @Email(message = "New email must be a valid email address")
    @Size(max = 255, message = "New email must be at most 255 characters")
    String newEmail
) {
}
