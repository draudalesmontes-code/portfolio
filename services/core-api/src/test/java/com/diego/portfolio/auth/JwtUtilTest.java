package com.diego.portfolio.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class JwtUtilTest {
    private static final String EMAIL = "diego@example.com";
    private static final String TEST_SECRET = Base64.getEncoder().encodeToString(
        "01234567890123456789012345678901".getBytes(StandardCharsets.UTF_8)
    );

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expiryMs", 60_000L);
    }

    @Test
    void generateToken_returnsNonEmptyString() {
        String token = jwtUtil.generateToken(EMAIL);

        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void extractEmail_fromValidToken_returnsCorrectEmail() {
        String token = jwtUtil.generateToken(EMAIL);

        assertEquals(EMAIL, jwtUtil.extractEmail(token));
    }

    @Test
    void isValid_generatedToken_returnsTrue() {
        String token = jwtUtil.generateToken(EMAIL);

        assertTrue(jwtUtil.isValid(token));
    }

    @Test
    void isValid_tamperedToken_returnsFalse() {
        String token = jwtUtil.generateToken(EMAIL);

        assertFalse(jwtUtil.isValid(token + "tampered"));
    }

    @Test
    void isValid_expiredToken_returnsFalse() {
        ReflectionTestUtils.setField(jwtUtil, "expiryMs", -1_000L);
        String token = jwtUtil.generateToken(EMAIL);

        assertFalse(jwtUtil.isValid(token));
    }
}
