package com.diego.portfolio;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.diego.portfolio.auth.User;
import com.diego.portfolio.auth.UserRepository;
import com.diego.portfolio.common.email.EmailService;
import com.diego.portfolio.feedback.Feedback;
import com.diego.portfolio.feedback.FeedbackRepository;
import com.diego.portfolio.games.GameRepository;
import com.diego.portfolio.games.GameSession;
import com.diego.portfolio.games.GameStatus;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AccountDataRegressionTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @MockitoBean
    private EmailService emailService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setEmail("diego@example.com");
        user.setPasswordHash("not-used-in-this-test");
        user.setDisplayName("Diego");
        user.setEmailVerified(true);
        user = userRepository.save(user);
    }

    @Test
    void authenticatedAccountCanReadGameStatistics() throws Exception {
        saveGame("TIC_TAC_TOE", "EASY", GameStatus.HUMAN_WON);
        saveGame("CONNECT_FOUR", "EASY", GameStatus.HUMAN_WON);
        saveGame("CONNECT_FOUR", "HARD", GameStatus.HUMAN_WON);
        saveGame("TIC_TAC_TOE", "MEDIUM", GameStatus.COMPUTER_WON);

        mockMvc.perform(get("/games/stats")
                .with(user("diego@example.com")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalWins").value(3))
            .andExpect(jsonPath("$.winsByDifficulty[0].level").value("Easy"))
            .andExpect(jsonPath("$.winsByDifficulty[0].count").value(2))
            .andExpect(jsonPath("$.winsByDifficulty[1].level").value("Medium"))
            .andExpect(jsonPath("$.winsByDifficulty[1].count").value(0))
            .andExpect(jsonPath("$.winsByDifficulty[2].level").value("Hard"))
            .andExpect(jsonPath("$.winsByDifficulty[2].count").value(1))
            .andExpect(jsonPath("$.winsByGame[0].game").value("Tic-Tac-Toe"))
            .andExpect(jsonPath("$.winsByGame[0].count").value(1))
            .andExpect(jsonPath("$.winsByGame[1].game").value("Connect 4"))
            .andExpect(jsonPath("$.winsByGame[1].count").value(2));
    }

    @Test
    void authenticatedAccountCanReadNewestSentFeedback() throws Exception {
        saveFeedback(
            "Older message",
            OffsetDateTime.parse("2026-07-01T12:00:00Z")
        );
        saveFeedback(
            "Newest message",
            OffsetDateTime.parse("2026-07-02T12:00:00Z")
        );

        mockMvc.perform(get("/feedback/mine")
                .with(user("diego@example.com")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].subject").value("Newest message"))
            .andExpect(jsonPath("$[0].sentAt").value(
                "2026-07-02T12:00:00Z"
            ))
            .andExpect(jsonPath("$[1].subject").value("Older message"));
    }

    @Test
    void accountDataEndpointsRejectAnonymousRequests() throws Exception {
        mockMvc.perform(get("/games/stats"))
            .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/feedback/mine"))
            .andExpect(status().isUnauthorized());
    }

    private void saveGame(
        String gameType,
        String difficulty,
        GameStatus status
    ) {
        GameSession session = new GameSession();
        session.setUserId(user.getId());
        session.setGameType(gameType);
        session.setDifficulty(difficulty);
        session.setHumanPiece("X");
        session.setBoardState("[]");
        session.setStatus(status.name());
        gameRepository.save(session);
    }

    private void saveFeedback(String subject, OffsetDateTime createdAt) {
        Feedback feedback = new Feedback();
        feedback.setUserId(user.getId());
        feedback.setAuthorName("Diego");
        feedback.setContactEmail("diego@example.com");
        feedback.setMessage(subject);
        feedback.setSubject(subject);
        feedback.setCreatedAt(createdAt);
        feedbackRepository.save(feedback);
    }
}
