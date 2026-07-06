package com.diego.portfolio.auth;

import com.diego.portfolio.auth.dto.AuthResponse;
import com.diego.portfolio.auth.dto.CurrentUserResponse;
import com.diego.portfolio.auth.dto.LoginRequest;
import com.diego.portfolio.auth.dto.RegisterRequest;
import com.diego.portfolio.common.email.EmailService;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.time.Duration;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final Duration VERIFICATION_TOKEN_TTL =
        Duration.ofHours(24);

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
            user.getCreatedAt()
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
}
