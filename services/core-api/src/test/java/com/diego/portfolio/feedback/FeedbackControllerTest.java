package com.diego.portfolio.feedback;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.diego.portfolio.feedback.dto.FeedbackRequest;
import com.diego.portfolio.common.exception.GlobalExceptionHandler;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class FeedbackControllerTest {

    @Mock
    private FeedbackService feedbackService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        FeedbackController feedbackController = new FeedbackController(feedbackService);
        mockMvc = MockMvcBuilders
            .standaloneSetup(feedbackController)
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    }

    @Test
    void submitFeedback_validBody_returnsCreatedWithId() throws Exception {
        when(feedbackService.submit(any(FeedbackRequest.class), isNull()))
            .thenReturn(42L);

        mockMvc.perform(post("/feedback")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validRequestBody()))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(42));
    }

    @Test
    void submitFeedback_emptyMessage_returnsValidationError() throws Exception {
        mockMvc.perform(post("/feedback")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "authorName": "Diego",
                      "contactEmail": "diego@example.com",
                      "message": "   "
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Validation failed"))
            .andExpect(jsonPath("$.fields.message").value(
                "Feedback message is required"
            ));

        verifyNoInteractions(feedbackService);
    }

    @Test
    void submitFeedback_authenticated_passesPrincipalEmailToService() throws Exception {
        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(
                "diego@example.com",
                null,
                List.of()
            );
        when(feedbackService.submit(
            any(FeedbackRequest.class),
            eq("diego@example.com")
        )).thenReturn(43L);

        mockMvc.perform(post("/feedback")
                .principal(authentication)
                .contentType(MediaType.APPLICATION_JSON)
                .content(validRequestBody()))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(43));

        verify(feedbackService).submit(
            any(FeedbackRequest.class),
            eq("diego@example.com")
        );
    }

    @Test
    void submitFeedback_guest_passesNullEmailToService() throws Exception {
        when(feedbackService.submit(any(FeedbackRequest.class), isNull()))
            .thenReturn(44L);

        mockMvc.perform(post("/feedback")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validRequestBody()))
            .andExpect(status().isCreated());

        verify(feedbackService).submit(any(FeedbackRequest.class), isNull());
    }

    private String validRequestBody() {
        return """
            {
              "authorName": "Diego",
              "contactEmail": "diego@example.com",
              "message": "Hello from the contact form."
            }
            """;
    }
}
