package com.diego.portfolio.feedback;

import org.junit.jupiter.api.Test;

class FeedbackServiceTest {

    // Test that submitting feedback with a valid message persists it and returns the id
    @Test
    void submit_validFeedback_persistsAndReturnsId() {}

    // Test that a logged-in user's feedback is linked to their user_id
    @Test
    void submit_loggedInUser_linksFeedbackToUser() {}

    // Test that guest feedback is stored with null user_id
    @Test
    void submit_guestUser_storesWithNullUserId() {}

    // Test that a rating outside 1-5 is rejected
    @Test
    void submit_invalidRating_throwsException() {}

    // Test that a feedback with an empty message is rejected
    @Test
    void submit_emptyMessage_throwsException() {}
}
