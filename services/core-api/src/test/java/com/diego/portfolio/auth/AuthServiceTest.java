package com.diego.portfolio.auth;

import org.junit.jupiter.api.Test;

class AuthServiceTest {

    // Test that registering with a new email creates a user with email_verified = false
    @Test
    void register_newEmail_createsUnverifiedUser() {}

    // Test that registering with a duplicate email throws an exception
    @Test
    void register_duplicateEmail_throwsException() {}

    // Test that login with correct credentials returns a JWT token
    @Test
    void login_validCredentials_returnsJwt() {}

    // Test that login with wrong password throws an exception
    @Test
    void login_wrongPassword_throwsException() {}

    // Test that verifying a valid token flips email_verified to true
    @Test
    void verifyEmail_validToken_setsEmailVerified() {}

    // Test that verifying an invalid or expired token throws an exception
    @Test
    void verifyEmail_invalidToken_throwsException() {}
}
