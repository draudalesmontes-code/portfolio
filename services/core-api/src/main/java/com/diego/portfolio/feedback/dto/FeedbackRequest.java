package com.diego.portfolio.feedback.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FeedbackRequest {
    @Size(max = 150, message = "Subject must be at most 150 characters")
    private String subject;

    @NotBlank(message = "Author name is required")
    @Size(max = 100, message = "Author name must be at most 100 characters")
    private String authorName;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Contact email must be a valid email address")
    @Size(max = 255, message = "Contact email must be at most 255 characters")
    private String contactEmail;

    @NotBlank(message = "Feedback message is required")
    @Size(max = 5000, message = "Feedback message must be at most 5000 characters")
    private String message;
}
