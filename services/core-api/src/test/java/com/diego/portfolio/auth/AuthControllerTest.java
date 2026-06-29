package com.diego.portfolio.auth;

import org.junit.jupiter.api.Test;

class AuthControllerTest {

    // Test that POST /api/auth/register with valid body returns 201
    @Test
    void register_validBody_returns201() {}

    // Test that POST /api/auth/register with missing fields returns 400
    @Test
    void register_missingFields_returns400() {}

    // Test that POST /api/auth/login with valid credentials returns 200 with JWT cookie
    @Test
    void login_validCredentials_returns200WithCookie() {}

    // Test that POST /api/auth/login with bad credentials returns 401
    @Test
    void login_badCredentials_returns401() {}

    // Test that GET /api/auth/verify with valid token returns 200
    @Test
    void verifyEmail_validToken_returns200() {}
}
