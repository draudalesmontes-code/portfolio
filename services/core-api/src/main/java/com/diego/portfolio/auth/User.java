package com.diego.portfolio.auth;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(nullable = false)
    private String role = "USER";

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "verification_token_expires_at")
    private OffsetDateTime verificationTokenExpiresAt;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "profile_image_content_type")
    private String profileImageContentType;

    @Column(name = "profile_image_data", columnDefinition = "BYTEA")
    private byte[] profileImageData;

    @Column(name = "profile_image_updated_at")
    private OffsetDateTime profileImageUpdatedAt;

    @Column(name = "pending_email")
    private String pendingEmail;

    @Column(name = "email_change_token")
    private String emailChangeToken;

    @Column(name = "email_change_token_expires_at")
    private OffsetDateTime emailChangeTokenExpiresAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
