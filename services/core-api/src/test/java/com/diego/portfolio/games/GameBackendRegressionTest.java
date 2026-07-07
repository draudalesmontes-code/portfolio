package com.diego.portfolio.games;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import com.diego.portfolio.common.email.EmailService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GameBackendRegressionTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GameRepository gameRepository;

    @MockitoBean
    private EmailService emailService;

    @Test
    void guestCanStartGamesWithoutCsrfToken() throws Exception {
        mockMvc.perform(post("/games/connect4/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "difficulty": "EASY",
                      "humanPiece": "RED"
                    }
                    """))
            .andExpect(status().isCreated());

        mockMvc.perform(post("/games/tictactoe/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "difficulty": "EASY",
                      "humanSymbol": "X"
                    }
                    """))
            .andExpect(status().isCreated());
    }

    @Test
    void guestCanStartAndPlayConnectFour() throws Exception {
        MvcResult startResult = mockMvc.perform(
                post("/games/connect4/sessions").with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                          "difficulty": "EASY",
                          "humanPiece": "RED"
                        }
                        """)
            )
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.gameType").value("CONNECT_FOUR"))
            .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
            .andExpect(jsonPath("$.humanPiece").value("RED"))
            .andExpect(jsonPath("$.computerPiece").value("YELLOW"))
            .andExpect(jsonPath("$.board.length()").value(6))
            .andReturn();

        String sessionId = readSessionId(startResult);

        mockMvc.perform(post(
                "/games/connect4/sessions/{sessionId}/moves",
                sessionId
            )
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"move": 0}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.board[5][0]").value("RED"))
            .andExpect(jsonPath("$.computerMove").isNumber());

        GameSession stored = gameRepository.findById(sessionId).orElseThrow();
        assertThat(stored.getUserId()).isNull();
        assertThat(stored.getBoardState()).contains("RED", "YELLOW");
    }

    @Test
    void guestCanStartAndPlayTicTacToe() throws Exception {
        MvcResult startResult = mockMvc.perform(
                post("/games/tictactoe/sessions").with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {
                          "difficulty": "EASY",
                          "humanSymbol": "X"
                        }
                        """)
            )
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.gameType").value("TIC_TAC_TOE"))
            .andExpect(jsonPath("$.board.length()").value(9))
            .andReturn();

        String sessionId = readSessionId(startResult);

        mockMvc.perform(post(
                "/games/tictactoe/sessions/{sessionId}/moves",
                sessionId
            )
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"move": 0}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.board[0]").value("X"))
            .andExpect(jsonPath("$.computerMove").isNumber());

        assertThat(gameRepository.findById(sessionId)).isPresent();
    }

    @Test
    void invalidAndUnknownGameMovesReturnSharedApiErrors() throws Exception {
        mockMvc.perform(post(
                "/games/connect4/sessions/{sessionId}/moves",
                "missing-session"
            )
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"move": 2}
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.message").value(
                "Game session ID is invalid."
            ));

        mockMvc.perform(post("/games/connect4/sessions").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "difficulty": "UNKNOWN",
                      "humanPiece": "RED"
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400));
    }

    private String readSessionId(MvcResult result) throws Exception {
        JsonNode response = objectMapper.readTree(
            result.getResponse().getContentAsString()
        );
        return response.get("sessionId").asText();
    }
}
