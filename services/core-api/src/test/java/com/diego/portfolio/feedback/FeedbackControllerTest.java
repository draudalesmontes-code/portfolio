package com.diego.portfolio.feedback;

import org.junit.jupiter.api.Test;

class FeedbackControllerTest {

    // Test that POST /api/feedback with valid body returns 201
    @Test
    void submitFeedback_validBody_returns201() {}

    // Test that POST /api/feedback with empty message returns 400
    @Test
    void submitFeedback_emptyMessage_returns400() {}

    // Test that POST /api/feedback with rating out of range returns 400
    @Test
    void submitFeedback_invalidRating_returns400() {}

    // Test that an authenticated user's feedback is linked to their account
    @Test
    void submitFeedback_authenticated_linksToUser() {}

    // Test that an unauthenticated (guest) request is still accepted
    @Test
    void submitFeedback_guest_returns201() {}
}
