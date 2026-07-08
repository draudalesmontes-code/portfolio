package com.diego.portfolio.auth;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.diego.portfolio.auth.dto.AuthResponse;
import com.diego.portfolio.auth.dto.CurrentUserResponse;
import com.diego.portfolio.auth.dto.LoginRequest;
import com.diego.portfolio.auth.dto.ProfileImageResource;
import com.diego.portfolio.auth.dto.RegisterRequest;
import com.diego.portfolio.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import java.time.OffsetDateTime;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        AuthController authController = new AuthController(authService);
        ReflectionTestUtils.setField(authController, "jwtExpiryMs", 86_400_000L);
        ReflectionTestUtils.setField(authController, "secureCookie", false);

        mockMvc = MockMvcBuilders
            .standaloneSetup(authController)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    }

    @Test
    void register_validBody_returnsCreated() throws Exception {
        doNothing().when(authService).register(any(RegisterRequest.class));

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "diego@example.com",
                      "password": "password123",
                      "displayName": "Diego"
                    }
                    """))
            .andExpect(status().isCreated());

        verify(authService).register(argThat(request ->
            request.getEmail().equals("diego@example.com")
                && request.getPassword().equals("password123")
                && request.getDisplayName().equals("Diego")
        ));
    }

    @Test
    void register_missingFields_returnsValidationErrors() throws Exception {
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Validation failed"))
            .andExpect(jsonPath("$.fields.email").exists())
            .andExpect(jsonPath("$.fields.password").exists())
            .andExpect(jsonPath("$.fields.displayName").exists());
    }

    @Test
    void login_validCredentials_returnsJwtCookieAndUserBody() throws Exception {
        when(authService.login(any(LoginRequest.class)))
            .thenReturn(new AuthResponse(
                "signed-jwt",
                "diego@example.com",
                "Diego"
            ));

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "diego@example.com",
                      "password": "password123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(header().string(
                HttpHeaders.SET_COOKIE,
                containsString("auth_token=signed-jwt")
            ))
            .andExpect(header().string(
                HttpHeaders.SET_COOKIE,
                containsString("HttpOnly")
            ))
            .andExpect(header().string(
                HttpHeaders.SET_COOKIE,
                containsString("SameSite=Strict")
            ))
            .andExpect(jsonPath("$.token").doesNotExist())
            .andExpect(jsonPath("$.email").value("diego@example.com"))
            .andExpect(jsonPath("$.displayName").value("Diego"));
    }

    @Test
    void login_badCredentials_returnsUnauthorizedApiError() throws Exception {
        when(authService.login(any(LoginRequest.class)))
            .thenThrow(new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password."
            ));

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "diego@example.com",
                      "password": "wrong-password"
                    }
                    """))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.status").value(401))
            .andExpect(jsonPath("$.message").value("Invalid email or password."))
            .andExpect(jsonPath("$.path").value("/auth/login"));
    }

    @Test
    void verifyEmail_validToken_returnsOk() throws Exception {
        doNothing().when(authService).verifyEmail("verification-token");

        mockMvc.perform(get("/auth/verify")
                .param("token", "verification-token"))
            .andExpect(status().isOk());

        verify(authService).verifyEmail("verification-token");
    }

    @Test
    void currentUser_authenticated_returnsProfile() throws Exception {
        when(authService.getCurrentUser("diego@example.com"))
            .thenReturn(new CurrentUserResponse(
                42L,
                "diego@example.com",
                "Diego",
                "USER",
                "https://example.com/avatar.jpg",
                OffsetDateTime.parse("2026-03-04T12:00:00Z")
            ));
        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(
                "diego@example.com",
                null,
                java.util.List.of()
            );

        mockMvc.perform(get("/auth/me").principal(authentication))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(42))
            .andExpect(jsonPath("$.email").value("diego@example.com"))
            .andExpect(jsonPath("$.displayName").value("Diego"))
            .andExpect(jsonPath("$.role").value("USER"))
            .andExpect(jsonPath("$.profileImageUrl").value(
                "https://example.com/avatar.jpg"
            ));
    }

    @Test
    void currentUser_withoutAuthentication_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/auth/me"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void logout_clearsAuthCookie() throws Exception {
        mockMvc.perform(post("/auth/logout"))
            .andExpect(status().isNoContent())
            .andExpect(header().string(
                HttpHeaders.SET_COOKIE,
                containsString("auth_token=")
            ))
            .andExpect(header().string(
                HttpHeaders.SET_COOKIE,
                containsString("Max-Age=0")
            ));
    }

    @Test
    void uploadProfileImage_authenticated_returnsUpdatedProfile() throws Exception {
        when(authService.uploadProfileImage(any(), any()))
            .thenReturn(new CurrentUserResponse(
                42L,
                "diego@example.com",
                "Diego",
                "USER",
                "/api/auth/users/42/profile-image?v=123",
                OffsetDateTime.parse("2026-03-04T12:00:00Z")
            ));
        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(
                "diego@example.com",
                null,
                java.util.List.of()
            );
        MockMultipartFile image = new MockMultipartFile(
            "image",
            "avatar.png",
            "image/png",
            new byte[] {1, 2, 3}
        );

        mockMvc.perform(multipart("/auth/profile-image")
                .file(image)
                .principal(authentication))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.profileImageUrl").value(
                "/api/auth/users/42/profile-image?v=123"
            ));
    }

    @Test
    void profileImage_existingImage_returnsImageBytes() throws Exception {
        when(authService.getProfileImage(42L))
            .thenReturn(new ProfileImageResource(
                new byte[] {1, 2, 3},
                "image/png"
            ));

        mockMvc.perform(get("/auth/users/42/profile-image"))
            .andExpect(status().isOk())
            .andExpect(content().contentType("image/png"))
            .andExpect(content().bytes(new byte[] {1, 2, 3}));
    }

    @Test
    void resendVerification_validEmail_returnsNoContent() throws Exception {
        mockMvc.perform(post("/auth/resend-verification")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "email": "diego@example.com"
                    }
                    """))
            .andExpect(status().isNoContent());

        verify(authService).resendVerificationEmail("diego@example.com");
    }
}
