package com.diego.portfolio.feedback;

import com.diego.portfolio.auth.User;
import com.diego.portfolio.auth.UserRepository;
import com.diego.portfolio.feedback.dto.FeedbackRequest;
import com.diego.portfolio.feedback.dto.SentFeedbackResponse;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public Long submit(
        FeedbackRequest request,
        String authenticatedUserEmail
    ){

        if(request.getMessage()==null||request.getMessage().isBlank()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Feedback message is required");
        }

        Long userId = null;

        if(authenticatedUserEmail != null && !authenticatedUserEmail.isBlank()){
            User user = userRepository.findByEmail(authenticatedUserEmail)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Authenticated user was not found."));

            userId = user.getId();
        }

        Feedback feedback = new Feedback();

        String contactEmail = request.getContactEmail();
        String normalizedEmail = contactEmail.trim().toLowerCase(Locale.ROOT);
        String normalizedName = request.getAuthorName().trim();
        String normalizedMessage = request.getMessage().trim();

        feedback.setContactEmail(normalizedEmail);
        feedback.setAuthorName(normalizedName);
        feedback.setMessage(normalizedMessage);
        feedback.setSubject(subjectFor(request.getSubject(), normalizedMessage));
        feedback.setUserId(userId);

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return savedFeedback.getId();
    }

    public List<SentFeedbackResponse> getMine(
        String authenticatedUserEmail
    ) {
        User user = requireUser(authenticatedUserEmail);
        return feedbackRepository
            .findTop50ByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(feedback -> new SentFeedbackResponse(
                feedback.getId(),
                feedback.getSubject(),
                feedback.getCreatedAt()
            ))
            .toList();
    }

    private User requireUser(String authenticatedUserEmail) {
        if (authenticatedUserEmail == null
            || authenticatedUserEmail.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authentication is required."
            );
        }

        return userRepository.findByEmail(authenticatedUserEmail)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authenticated user was not found."
            ));
    }

    private String subjectFor(String subject, String message) {
        if (subject != null && !subject.isBlank()) {
            return subject.trim();
        }

        String preview = message.replaceAll("\\s+", " ");
        return preview.length() <= 80
            ? preview
            : preview.substring(0, 77) + "...";
    }
}
