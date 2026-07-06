package com.diego.portfolio.feedback;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.diego.portfolio.auth.User;
import com.diego.portfolio.auth.UserRepository;
import com.diego.portfolio.feedback.dto.FeedbackRequest;
import com.diego.portfolio.feedback.dto.SentFeedbackResponse;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceTest {

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FeedbackService feedbackService;

    @Test
    void submit_validFeedback_persistsNormalizedMessageAndReturnsId() {
        FeedbackRequest request = request(
            "  Diego  ",
            "  Diego@Example.com  ",
            "  Hello from the contact form.  "
        );
        stubSavedFeedbackId(42L);

        Long feedbackId = feedbackService.submit(request, null);

        assertEquals(42L, feedbackId);

        ArgumentCaptor<Feedback> feedbackCaptor = ArgumentCaptor.forClass(Feedback.class);
        verify(feedbackRepository).save(feedbackCaptor.capture());

        Feedback savedFeedback = feedbackCaptor.getValue();
        assertEquals("Diego", savedFeedback.getAuthorName());
        assertEquals("diego@example.com", savedFeedback.getContactEmail());
        assertEquals("Hello from the contact form.", savedFeedback.getMessage());
        assertEquals(
            "Hello from the contact form.",
            savedFeedback.getSubject()
        );
        assertNull(savedFeedback.getUserId());
    }

    @Test
    void submit_loggedInUser_linksFeedbackToUser() {
        FeedbackRequest request = request(
            "Diego",
            "diego@example.com",
            "Authenticated message"
        );
        User user = new User();
        user.setId(7L);
        user.setEmail("diego@example.com");
        when(userRepository.findByEmail("diego@example.com"))
            .thenReturn(Optional.of(user));
        stubSavedFeedbackId(43L);

        feedbackService.submit(request, "diego@example.com");

        ArgumentCaptor<Feedback> feedbackCaptor = ArgumentCaptor.forClass(Feedback.class);
        verify(feedbackRepository).save(feedbackCaptor.capture());
        assertEquals(7L, feedbackCaptor.getValue().getUserId());
    }

    @Test
    void submit_guestUser_storesWithNullUserId() {
        FeedbackRequest request = request(
            "Guest",
            "guest@example.com",
            "Guest message"
        );
        stubSavedFeedbackId(44L);

        feedbackService.submit(request, null);

        ArgumentCaptor<Feedback> feedbackCaptor = ArgumentCaptor.forClass(Feedback.class);
        verify(feedbackRepository).save(feedbackCaptor.capture());
        assertNull(feedbackCaptor.getValue().getUserId());
        verifyNoInteractions(userRepository);
    }

    @Test
    void submit_emptyMessage_throwsBadRequest() {
        FeedbackRequest request = request(
            "Diego",
            "diego@example.com",
            "   "
        );

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> feedbackService.submit(request, null)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verifyNoInteractions(feedbackRepository, userRepository);
    }

    @Test
    void submit_authenticatedUserMissing_throwsUnauthorized() {
        FeedbackRequest request = request(
            "Diego",
            "diego@example.com",
            "Message"
        );
        when(userRepository.findByEmail("diego@example.com"))
            .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> feedbackService.submit(request, "diego@example.com")
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        verify(feedbackRepository, never()).save(any(Feedback.class));
    }

    @Test
    void getMine_returnsNewestSentFeedbackForAuthenticatedUser() {
        User user = new User();
        user.setId(7L);
        when(userRepository.findByEmail("diego@example.com"))
            .thenReturn(Optional.of(user));

        Feedback feedback = new Feedback();
        feedback.setId(42L);
        feedback.setSubject("Portfolio question");
        feedback.setCreatedAt(
            OffsetDateTime.parse("2026-07-02T12:00:00Z")
        );
        when(feedbackRepository.findTop50ByUserIdOrderByCreatedAtDesc(7L))
            .thenReturn(List.of(feedback));

        List<SentFeedbackResponse> responses = feedbackService.getMine(
            "diego@example.com"
        );

        assertEquals(1, responses.size());
        assertEquals(42L, responses.get(0).id());
        assertEquals("Portfolio question", responses.get(0).subject());
        assertEquals(feedback.getCreatedAt(), responses.get(0).sentAt());
    }

    private FeedbackRequest request(String authorName, String contactEmail, String message) {
        FeedbackRequest request = new FeedbackRequest();
        request.setAuthorName(authorName);
        request.setContactEmail(contactEmail);
        request.setMessage(message);
        return request;
    }

    private void stubSavedFeedbackId(Long id) {
        when(feedbackRepository.save(any(Feedback.class))).thenAnswer(invocation -> {
            Feedback feedback = invocation.getArgument(0);
            feedback.setId(id);
            return feedback;
        });
    }
}
