package com.diego.portfolio.auth;

import com.diego.portfolio.auth.dto.AuthResponse;
import com.diego.portfolio.auth.dto.ChangeEmailRequest;
import com.diego.portfolio.auth.dto.ChangePasswordRequest;
import com.diego.portfolio.auth.dto.CurrentUserResponse;
import com.diego.portfolio.auth.dto.LoginRequest;
import com.diego.portfolio.auth.dto.ProfileImageResource;
import com.diego.portfolio.auth.dto.RegisterRequest;
import com.diego.portfolio.auth.dto.ResendVerificationRequest;
import com.diego.portfolio.auth.dto.UpdateProfileImageRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @Value("${app.jwt.expiry-ms}")
    private long jwtExpiryMs;

    @Value("${app.auth.cookie-secure:false}")
    private boolean secureCookie;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        ResponseCookie cookie = authCookie(
            authResponse.getToken(),
            Duration.ofMillis(jwtExpiryMs)
        );

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(authResponse);
    }

    @GetMapping("/verify")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/confirm-email-change")
    public ResponseEntity<Void> confirmEmailChange(@RequestParam String token) {
        authService.confirmEmailChange(token);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<CurrentUserResponse> currentUser(
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(
            authService.getCurrentUser(authentication.getName())
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie cookie = authCookie("", Duration.ZERO);
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<CurrentUserResponse> changePassword(
        Authentication authentication,
        @Valid @RequestBody ChangePasswordRequest request
    ) {
        return ResponseEntity.ok(
            authService.changePassword(
                requireAuthenticatedEmail(authentication),
                request
            )
        );
    }

    @PostMapping("/change-email")
    public ResponseEntity<CurrentUserResponse> changeEmail(
        Authentication authentication,
        @Valid @RequestBody ChangeEmailRequest request
    ) {
        return ResponseEntity.ok(
            authService.requestEmailChange(
                requireAuthenticatedEmail(authentication),
                request
            )
        );
    }

    @PostMapping(
        value = "/profile-image",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CurrentUserResponse> updateProfileImage(
        Authentication authentication,
        @Valid @RequestBody UpdateProfileImageRequest request
    ) {
        return ResponseEntity.ok(
            authService.updateProfileImage(
                requireAuthenticatedEmail(authentication),
                request
            )
        );
    }

    @PostMapping(
        value = "/profile-image",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<CurrentUserResponse> uploadProfileImage(
        Authentication authentication,
        @RequestPart("image") MultipartFile image
    ) {
        return ResponseEntity.ok(
            authService.uploadProfileImage(
                requireAuthenticatedEmail(authentication),
                image
            )
        );
    }

    @GetMapping("/users/{userId}/profile-image")
    public ResponseEntity<byte[]> profileImage(
        @PathVariable Long userId
    ) {
        ProfileImageResource image = authService.getProfileImage(userId);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(image.contentType()))
            .cacheControl(CacheControl.noCache())
            .body(image.data());
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(
        @Valid @RequestBody ResendVerificationRequest request
    ) {
        authService.resendVerificationEmail(request.getEmail());
        return ResponseEntity.noContent().build();
    }

    private ResponseCookie authCookie(String value, Duration maxAge) {
        return ResponseCookie.from("auth_token", value)
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite("Strict")
            .path("/")
            .maxAge(maxAge)
            .build();
    }

    private String requireAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authentication is required."
            );
        }

        return authentication.getName();
    }
}
