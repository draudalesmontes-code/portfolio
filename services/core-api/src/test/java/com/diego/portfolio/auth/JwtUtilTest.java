package com.diego.portfolio.auth;

import org.junit.jupiter.api.Test;

class JwtUtilTest {

    // Test that generateToken produces a non-empty string
    @Test
    void generateToken_returnsNonEmptyString() {}

    // Test that a token generated for a user extracts the correct email
    @Test
    void extractEmail_fromValidToken_returnsCorrectEmail() {}

    // Test that a valid token is not flagged as expired
    @Test
    void isExpired_validToken_returnsFalse() {}

    // Test that a tampered token fails validation
    @Test
    void validateToken_tamperedToken_returnsFalse() {}

    // Test that an expired token is flagged correctly
    @Test
    void isExpired_expiredToken_returnsTrue() {}
}
