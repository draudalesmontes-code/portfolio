package com.diego.portfolio.games.connect4;

import com.diego.portfolio.games.GameSession;
import com.diego.portfolio.games.GameSessionService;
import com.diego.portfolio.games.GameStatus;
import com.diego.portfolio.games.dto.GameStateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class Connect4GameService {
    private static final String GAME_TYPE = "CONNECT_FOUR";

    private final Connect4Engine engine;
    private final GameSessionService sessionService;

    public GameStateResponse start(
        Connect4StartRequest request,
        String authenticatedEmail
    ) {
        Piece[][] board = engine.newBoard();
        Piece computerPiece = request.humanPiece().opposite();
        Integer computerMove = null;

        if (computerPiece == Piece.RED) {
            computerMove = engine.chooseComputerMove(
                board,
                request.difficulty(),
                computerPiece
            );
            engine.dropPiece(board, computerMove, computerPiece);
        }

        GameSession session = sessionService.create(
            GAME_TYPE,
            request.difficulty().name(),
            request.humanPiece().name(),
            board,
            authenticatedEmail
        );

        return response(
            session,
            board,
            request.humanPiece(),
            computerMove
        );
    }

    public GameStateResponse move(
        String sessionId,
        int column,
        String authenticatedEmail
    ) {
        GameSession session = sessionService.requireSession(
            sessionId,
            GAME_TYPE,
            authenticatedEmail
        );
        requireInProgress(session);

        Piece[][] board = sessionService.readBoard(
            session,
            Piece[][].class
        );
        Difficulty difficulty = Difficulty.valueOf(
            session.getDifficulty()
        );
        Piece humanPiece = Piece.valueOf(session.getHumanPiece());
        Piece computerPiece = humanPiece.opposite();

        Connect4Engine.PlacedPiece humanMove;
        try {
            humanMove = engine.dropPiece(board, column, humanPiece);
        } catch (IllegalArgumentException exception) {
            throw badMove(exception);
        }

        if (engine.hasWon(board, humanMove, humanPiece)) {
            sessionService.update(
                session,
                board,
                GameStatus.HUMAN_WON,
                humanPiece.name()
            );
            return response(session, board, humanPiece, null);
        }

        if (engine.isDraw(board)) {
            sessionService.update(
                session,
                board,
                GameStatus.DRAW,
                null
            );
            return response(session, board, humanPiece, null);
        }

        int computerColumn = engine.chooseComputerMove(
            board,
            difficulty,
            computerPiece
        );
        Connect4Engine.PlacedPiece computerMove = engine.dropPiece(
            board,
            computerColumn,
            computerPiece
        );

        GameStatus status = GameStatus.IN_PROGRESS;
        String winner = null;
        if (engine.hasWon(board, computerMove, computerPiece)) {
            status = GameStatus.COMPUTER_WON;
            winner = computerPiece.name();
        } else if (engine.isDraw(board)) {
            status = GameStatus.DRAW;
        }

        sessionService.update(session, board, status, winner);
        return response(session, board, humanPiece, computerColumn);
    }

    private GameStateResponse response(
        GameSession session,
        Piece[][] board,
        Piece humanPiece,
        Integer computerMove
    ) {
        return new GameStateResponse(
            session.getId(),
            session.getGameType(),
            session.getDifficulty(),
            session.getStatus(),
            board,
            humanPiece.name(),
            humanPiece.opposite().name(),
            session.getWinner(),
            computerMove
        );
    }

    private void requireInProgress(GameSession session) {
        if (!GameStatus.IN_PROGRESS.name().equals(session.getStatus())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "This game has already finished."
            );
        }
    }

    private ResponseStatusException badMove(
        IllegalArgumentException exception
    ) {
        return new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            exception.getMessage(),
            exception
        );
    }
}
