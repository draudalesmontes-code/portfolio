package com.diego.portfolio.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.diego.portfolio.auth.dto.AuthResponse;
import com.diego.portfolio.auth.dto.CurrentUserResponse;
import com.diego.portfolio.auth.dto.LoginRequest;
import com.diego.portfolio.auth.dto.RegisterRequest;
import com.diego.portfolio.common.email.EmailService;
import java.time.OffsetDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_newEmail_createsUnverifiedUser() {
        RegisterRequest request = registerRequest(
            "  Diego@Example.com  ",
            "password123",
            "  Diego  "
        );
        when(userRepository.findByEmail("diego@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");

        authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("diego@example.com", savedUser.getEmail());
        assertEquals("hashed-password", savedUser.getPasswordHash());
        assertEquals("Diego", savedUser.getDisplayName());
        assertFalse(savedUser.isEmailVerified());
        assertNotNull(savedUser.getVerificationToken());
        assertFalse(savedUser.getVerificationToken().isBlank());
        assertTrue(
            savedUser.getVerificationTokenExpiresAt()
                .isAfter(OffsetDateTime.now())
        );
        verify(emailService).sendVerificationEmail(
            savedUser.getEmail(),
            savedUser.getVerificationToken()
        );
    }

    @Test
    void register_duplicateEmail_throwsConflict() {
        RegisterRequest request = registerRequest(
            "diego@example.com",
            "password123",
            "Diego"
        );
        when(userRepository.findByEmail("diego@example.com"))
            .thenReturn(Optional.of(verifiedUser()));

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> authService.register(request)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(passwordEncoder, jwtUtil, emailService);
    }

    @Test
    void login_validCredentials_returnsJwt() {
        LoginRequest request = loginRequest(" Diego@Example.com ", "password123");
        User user = verifiedUser();
        when(userRepository.findByEmail("diego@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);
        when(jwtUtil.generateToken("diego@example.com")).thenReturn("signed-jwt");

        AuthResponse response = authService.login(request);

        assertEquals("signed-jwt", response.getToken());
        assertEquals("diego@example.com", response.getEmail());
        assertEquals("Diego", response.getDisplayName());
    }

    @Test
    void login_wrongPassword_throwsUnauthorized() {
        LoginRequest request = loginRequest("diego@example.com", "wrong-password");
        User user = verifiedUser();
        when(userRepository.findByEmail("diego@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "hashed-password")).thenReturn(false);

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> authService.login(request)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        verifyNoInteractions(jwtUtil);
    }

    @Test
    void login_unverifiedUser_throwsForbidden() {
        LoginRequest request = loginRequest("diego@example.com", "password123");
        User user = verifiedUser();
        user.setEmailVerified(false);
        when(userRepository.findByEmail("diego@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> authService.login(request)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verifyNoInteractions(jwtUtil);
    }

    @Test
    void verifyEmail_validToken_setsEmailVerifiedAndClearsToken() {
        String token = "123e4567-e89b-12d3-a456-426614174000";
        User user = verifiedUser();
        user.setEmailVerified(false);
        user.setVerificationToken(token);
        user.setVerificationTokenExpiresAt(
            OffsetDateTime.now().plusHours(1)
        );
        when(userRepository.findByVerificationToken(token))
            .thenReturn(Optional.of(user));

        authService.verifyEmail(token);

        assertTrue(user.isEmailVerified());
        assertNull(user.getVerificationToken());
        assertNull(user.getVerificationTokenExpiresAt());
        verify(userRepository).save(user);
    }

    @Test
    void verifyEmail_expiredToken_isClearedAndRejected() {
        String token = "123e4567-e89b-12d3-a456-426614174000";
        User user = verifiedUser();
        user.setEmailVerified(false);
        user.setVerificationToken(token);
        user.setVerificationTokenExpiresAt(
            OffsetDateTime.now().minusMinutes(1)
        );
        when(userRepository.findByVerificationToken(token))
            .thenReturn(Optional.of(user));

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> authService.verifyEmail(token)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertFalse(user.isEmailVerified());
        assertNull(user.getVerificationToken());
        assertNull(user.getVerificationTokenExpiresAt());
        verify(userRepository).save(user);
    }

    @Test
    void verifyEmail_invalidToken_throwsBadRequest() {
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> authService.verifyEmail("invalid-token")
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getCurrentUser_authenticatedEmail_returnsSafeProfile() {
        User user = verifiedUser();
        user.setId(42L);
        when(userRepository.findByEmail("diego@example.com"))
            .thenReturn(Optional.of(user));

        CurrentUserResponse response =
            authService.getCurrentUser(" Diego@Example.com ");

        assertEquals(42L, response.id());
        assertEquals("diego@example.com", response.email());
        assertEquals("Diego", response.displayName());
        assertEquals("USER", response.role());
    }

    @Test
    void resendVerificationEmail_unverifiedUser_replacesTokenAndSendsEmail() {
        User user = verifiedUser();
        user.setEmailVerified(false);
        user.setVerificationToken("old-token");
        when(userRepository.findByEmail("diego@example.com"))
            .thenReturn(Optional.of(user));

        authService.resendVerificationEmail(" Diego@Example.com ");

        assertNotNull(user.getVerificationToken());
        assertFalse(user.getVerificationToken().isBlank());
        assertFalse(user.getVerificationToken().equals("old-token"));
        assertTrue(
            user.getVerificationTokenExpiresAt()
                .isAfter(OffsetDateTime.now())
        );
        verify(userRepository).save(user);
        verify(emailService).sendVerificationEmail(
            "diego@example.com",
            user.getVerificationToken()
        );
    }

    @Test
    void resendVerificationEmail_unknownEmail_doesNotRevealOrSend() {
        when(userRepository.findByEmail("missing@example.com"))
            .thenReturn(Optional.empty());

        authService.resendVerificationEmail("missing@example.com");

        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(emailService);
    }

    private RegisterRequest registerRequest(String email, String password, String displayName) {
        RegisterRequest request = new RegisterRequest();
        request.setEmail(email);
        request.setPassword(password);
        request.setDisplayName(displayName);
        return request;
    }

    private LoginRequest loginRequest(String email, String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }

    private User verifiedUser() {
        User user = new User();
        user.setEmail("diego@example.com");
        user.setPasswordHash("hashed-password");
        user.setDisplayName("Diego");
        user.setEmailVerified(true);
        return user;
    }
}
