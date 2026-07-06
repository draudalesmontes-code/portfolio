package com.diego.portfolio.games;

import com.diego.portfolio.auth.User;
import com.diego.portfolio.auth.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class GameSessionService {
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public GameSession create(
        String gameType,
        String difficulty,
        String humanPiece,
        Object board,
        String authenticatedEmail
    ) {
        GameSession session = new GameSession();
        session.setUserId(resolveUserId(authenticatedEmail));
        session.setGameType(gameType);
        session.setDifficulty(difficulty);
        session.setHumanPiece(humanPiece);
        session.setBoardState(writeBoard(board));
        return gameRepository.save(session);
    }

    @Transactional(readOnly = true)
    public GameSession requireSession(
        String sessionId,
        String expectedGameType,
        String authenticatedEmail
    ) {
        validateSessionId(sessionId);
        GameSession session = gameRepository.findById(sessionId)
            .filter(found -> expectedGameType.equals(found.getGameType()))
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Game session was not found."
            ));

        verifyOwnership(session, authenticatedEmail);
        return session;
    }

    public <T> T readBoard(GameSession session, Class<T> boardType) {
        try {
            return objectMapper.readValue(session.getBoardState(), boardType);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException(
                "Stored game board could not be read.",
                exception
            );
        }
    }

    @Transactional
    public GameSession update(
        GameSession session,
        Object board,
        GameStatus status,
        String winner
    ) {
        session.setBoardState(writeBoard(board));
        session.setStatus(status.name());
        session.setWinner(winner);
        session.setUpdatedAt(OffsetDateTime.now());
        return gameRepository.save(session);
    }

    private Long resolveUserId(String authenticatedEmail) {
        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            return null;
        }

        return userRepository.findByEmail(authenticatedEmail)
            .map(User::getId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authenticated user was not found."
            ));
    }

    private void verifyOwnership(
        GameSession session,
        String authenticatedEmail
    ) {
        if (session.getUserId() == null) {
            return;
        }

        Long requesterId = resolveUserId(authenticatedEmail);
        if (!session.getUserId().equals(requesterId)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "This game session belongs to another user."
            );
        }
    }

    private String writeBoard(Object board) {
        try {
            return objectMapper.writeValueAsString(board);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException(
                "Game board could not be stored.",
                exception
            );
        }
    }

    private void validateSessionId(String sessionId) {
        try {
            if (sessionId == null || sessionId.length() != 36) {
                throw new IllegalArgumentException();
            }
            UUID.fromString(sessionId);
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Game session ID is invalid."
            );
        }
    }
}
