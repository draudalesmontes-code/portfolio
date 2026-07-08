package com.diego.portfolio.auth;

import com.diego.portfolio.auth.dto.AuthResponse;
import com.diego.portfolio.auth.dto.ChangeEmailRequest;
import com.diego.portfolio.auth.dto.ChangePasswordRequest;
import com.diego.portfolio.auth.dto.CurrentUserResponse;
import com.diego.portfolio.auth.dto.LoginRequest;
import com.diego.portfolio.auth.dto.ProfileImageResource;
import com.diego.portfolio.auth.dto.RegisterRequest;
import com.diego.portfolio.auth.dto.UpdateProfileImageRequest;
import com.diego.portfolio.common.email.EmailService;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.time.Duration;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final Duration VERIFICATION_TOKEN_TTL =
        Duration.ofHours(24);
    private static final Duration EMAIL_CHANGE_TOKEN_TTL =
        Duration.ofHours(24);
    private static final long MAX_PROFILE_IMAGE_BYTES =
        2L * 1024L * 1024L;
    private static final Set<String> ALLOWED_PROFILE_IMAGE_TYPES = Set.of(
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public void register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        Optional<User> existingUser = userRepository.findByEmail(normalizedEmail);
        if (existingUser.isPresent()) {
            resendVerificationOrReject(existingUser.get());
            return;
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(hashedPassword);
        user.setDisplayName(request.getDisplayName().trim());
        user.setEmailVerified(false);
        refreshVerificationToken(user);

        userRepository.save(user);
        emailService.sendVerificationEmail(
            user.getEmail(),
            user.getVerificationToken()
        );
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        if (!user.isEmailVerified()) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Please verify your email before logging in.");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getDisplayName());
    }

    public void verifyEmail(String token) {
        validateVerificationToken(token);
        User user = userRepository.findByVerificationToken(token)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid verification token."));

        if (user.getVerificationTokenExpiresAt() == null
            || user.getVerificationTokenExpiresAt()
                .isBefore(OffsetDateTime.now())) {
            user.setVerificationToken(null);
            user.setVerificationTokenExpiresAt(null);
            userRepository.save(user);
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Verification token has expired."
            );
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiresAt(null);
        userRepository.save(user);
    }

    public CurrentUserResponse getCurrentUser(String authenticatedEmail) {
        User user = userRepository.findByEmail(normalizeEmail(authenticatedEmail))
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Authenticated user was not found."));

        return new CurrentUserResponse(
            user.getId(),
            user.getEmail(),
            user.getDisplayName(),
            user.getRole(),
            profileImageUrlFor(user),
            user.getCreatedAt()
        );
    }

    public CurrentUserResponse changePassword(
        String authenticatedEmail,
        ChangePasswordRequest request
    ) {
        User user = requireUser(authenticatedEmail);

        if (!passwordEncoder.matches(
            request.currentPassword(),
            user.getPasswordHash()
        )) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Current password is incorrect."
            );
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        return toCurrentUserResponse(user);
    }

    public CurrentUserResponse requestEmailChange(
        String authenticatedEmail,
        ChangeEmailRequest request
    ) {
        User user = requireUser(authenticatedEmail);
        String normalizedEmail = normalizeEmail(request.newEmail());

        if (normalizedEmail.equals(user.getEmail())) {
            return toCurrentUserResponse(user);
        }

        userRepository.findByEmail(normalizedEmail).ifPresent(existing -> {
            if (!Objects.equals(existing.getId(), user.getId())) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already in use."
                );
            }
        });

        user.setPendingEmail(normalizedEmail);
        user.setEmailChangeToken(UUID.randomUUID().toString());
        user.setEmailChangeTokenExpiresAt(
            OffsetDateTime.now().plus(EMAIL_CHANGE_TOKEN_TTL)
        );
        userRepository.save(user);

        emailService.sendEmailChangeConfirmation(
            normalizedEmail,
            user.getEmailChangeToken()
        );

        return toCurrentUserResponse(user);
    }

    public void confirmEmailChange(String token) {
        validateVerificationToken(token);
        User user = userRepository.findByEmailChangeToken(token)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid email change token."
            ));

        if (user.getPendingEmail() == null
            || user.getEmailChangeTokenExpiresAt() == null
            || user.getEmailChangeTokenExpiresAt()
                .isBefore(OffsetDateTime.now())) {
            clearEmailChange(user);
            userRepository.save(user);
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Email change token has expired."
            );
        }

        userRepository.findByEmail(user.getPendingEmail()).ifPresent(existing -> {
            if (!Objects.equals(existing.getId(), user.getId())) {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already in use."
                );
            }
        });

        user.setEmail(user.getPendingEmail());
        clearEmailChange(user);
        userRepository.save(user);
    }

    public CurrentUserResponse updateProfileImage(
        String authenticatedEmail,
        UpdateProfileImageRequest request
    ) {
        User user = requireUser(authenticatedEmail);
        String profileImageUrl = normalizeProfileImageUrl(
            request.profileImageUrl()
        );
        user.setProfileImageUrl(profileImageUrl);
        user.setProfileImageData(null);
        user.setProfileImageContentType(null);
        user.setProfileImageUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);
        return toCurrentUserResponse(user);
    }

    public CurrentUserResponse uploadProfileImage(
        String authenticatedEmail,
        MultipartFile image
    ) {
        User user = requireUser(authenticatedEmail);

        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Profile image file is required."
            );
        }

        if (image.getSize() > MAX_PROFILE_IMAGE_BYTES) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Profile image must be 2 MB or smaller."
            );
        }

        String contentType = image.getContentType();
        if (contentType == null
            || !ALLOWED_PROFILE_IMAGE_TYPES.contains(
                contentType.toLowerCase(Locale.ROOT)
            )) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Profile image must be a JPG, PNG, WebP, or GIF file."
            );
        }

        try {
            user.setProfileImageData(image.getBytes());
        } catch (IOException exception) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Profile image could not be read."
            );
        }

        user.setProfileImageContentType(contentType.toLowerCase(Locale.ROOT));
        user.setProfileImageUrl(null);
        user.setProfileImageUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);
        return toCurrentUserResponse(user);
    }

    public ProfileImageResource getProfileImage(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Profile image was not found."
            ));

        if (user.getProfileImageData() == null
            || user.getProfileImageContentType() == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Profile image was not found."
            );
        }

        return new ProfileImageResource(
            user.getProfileImageData(),
            user.getProfileImageContentType()
        );
    }

    public void resendVerificationEmail(String email) {
        userRepository.findByEmail(normalizeEmail(email)).ifPresent(user -> {
            if (user.isEmailVerified()) {
                return;
            }

            refreshVerificationToken(user);
            userRepository.save(user);
            emailService.sendVerificationEmail(
                user.getEmail(),
                user.getVerificationToken()
            );
        });
    }

    private void resendVerificationOrReject(User user) {
        if (user.isEmailVerified()) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email already in use."
            );
        }

        refreshVerificationToken(user);
        userRepository.save(user);
        emailService.sendVerificationEmail(
            user.getEmail(),
            user.getVerificationToken()
        );
    }

    private void refreshVerificationToken(User user) {
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setVerificationTokenExpiresAt(
            OffsetDateTime.now().plus(VERIFICATION_TOKEN_TTL)
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private void validateVerificationToken(String token) {
        try {
            if (token == null || token.length() != 36) {
                throw new IllegalArgumentException();
            }
            UUID.fromString(token);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid verification token."
            );
        }
    }

    private User requireUser(String authenticatedEmail) {
        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authentication is required."
            );
        }

        return userRepository.findByEmail(normalizeEmail(authenticatedEmail))
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authenticated user was not found."
            ));
    }

    private CurrentUserResponse toCurrentUserResponse(User user) {
        return new CurrentUserResponse(
            user.getId(),
            user.getEmail(),
            user.getDisplayName(),
            user.getRole(),
            profileImageUrlFor(user),
            user.getCreatedAt()
        );
    }

    private void clearEmailChange(User user) {
        user.setPendingEmail(null);
        user.setEmailChangeToken(null);
        user.setEmailChangeTokenExpiresAt(null);
    }

    private String normalizeProfileImageUrl(String profileImageUrl) {
        if (profileImageUrl == null || profileImageUrl.isBlank()) {
            return null;
        }

        String normalizedUrl = profileImageUrl.trim();
        try {
            URI uri = new URI(normalizedUrl);
            String scheme = uri.getScheme();
            if (scheme == null
                || (!scheme.equalsIgnoreCase("http")
                    && !scheme.equalsIgnoreCase("https"))
                || uri.getHost() == null) {
                throw new URISyntaxException(
                    normalizedUrl,
                    "Profile image URL must be absolute HTTP(S)."
                );
            }
        } catch (URISyntaxException exception) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Profile image URL must be a valid HTTP or HTTPS URL."
            );
        }

        return normalizedUrl;
    }

    private String profileImageUrlFor(User user) {
        if (user.getProfileImageData() != null && user.getId() != null) {
            long version = user.getProfileImageUpdatedAt() == null
                ? 0L
                : user.getProfileImageUpdatedAt().toInstant().toEpochMilli();
            return "/api/auth/users/" + user.getId()
                + "/profile-image?v=" + version;
        }

        return user.getProfileImageUrl();
    }
}
