package com.diego.portfolio.games.connect4;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.diego.portfolio.common.exception.GlobalExceptionHandler;
import com.diego.portfolio.games.dto.GameStateResponse;
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
class Connect4ControllerTest {
    @Mock
    private Connect4GameService gameService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
            .standaloneSetup(new Connect4Controller(gameService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    }

    @Test
    void start_validGuestRequest_returnsCreatedState() throws Exception {
        Piece[][] board = new Piece[6][7];
        when(gameService.start(
            eq(new Connect4StartRequest(Difficulty.MEDIUM, Piece.RED)),
            isNull()
        )).thenReturn(state(board));

        mockMvc.perform(post("/games/connect4/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "difficulty": "MEDIUM",
                      "humanPiece": "RED"
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.sessionId").value("session-1"))
            .andExpect(jsonPath("$.gameType").value("CONNECT_FOUR"))
            .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
            .andExpect(jsonPath("$.board.length()").value(6));
    }

    @Test
    void move_authenticatedRequest_passesIdentityAndMove() throws Exception {
        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(
                "diego@example.com",
                null,
                List.of()
            );
        when(gameService.move(
            "session-1",
            3,
            "diego@example.com"
        )).thenReturn(state(new Piece[6][7]));

        mockMvc.perform(post("/games/connect4/sessions/session-1/moves")
                .principal(authentication)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"move": 3}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sessionId").value("session-1"));

        verify(gameService).move(
            "session-1",
            3,
            "diego@example.com"
        );
    }

    @Test
    void move_missingMove_returnsValidationError() throws Exception {
        mockMvc.perform(post("/games/connect4/sessions/session-1/moves")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.fields.move").value("Move is required."));

        verifyNoInteractions(gameService);
    }

    @Test
    void start_unknownDifficulty_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/games/connect4/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "difficulty": "IMPOSSIBLE",
                      "humanPiece": "RED"
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value(
                "Request body is malformed or contains an unsupported value."
            ));

        verifyNoInteractions(gameService);
    }

    private GameStateResponse state(Piece[][] board) {
        return new GameStateResponse(
            "session-1",
            "CONNECT_FOUR",
            "MEDIUM",
            "IN_PROGRESS",
            board,
            "RED",
            "YELLOW",
            null,
            null
        );
    }
}
