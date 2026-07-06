package com.diego.portfolio.feedback;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "author_name")
    private String authorName;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(nullable = false)
    private String message;

    @Column(length = 150)
    private String subject;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
