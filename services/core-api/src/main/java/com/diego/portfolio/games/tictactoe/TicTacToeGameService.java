package com.diego.portfolio.games.tictactoe;

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
public class TicTacToeGameService {
    private static final String GAME_TYPE = "TIC_TAC_TOE";

    private final TicTacToeEngine engine;
    private final GameSessionService sessionService;

    public GameStateResponse start(
        TicTacToeStartRequest request,
        String authenticatedEmail
    ) {
        Symbol[] board = engine.newBoard();
        Players players = new Players(
            request.humanSymbol(),
            request.humanSymbol().opposite()
        );
        Integer computerMove = null;

        if (players.computerSymbol() == Symbol.X) {
            computerMove = engine.chooseComputerMove(
                board,
                request.difficulty(),
                players
            );
            engine.placePiece(
                board,
                computerMove,
                players.computerSymbol()
            );
        }

        GameSession session = sessionService.create(
            GAME_TYPE,
            request.difficulty().name(),
            players.humanSymbol().name(),
            board,
            authenticatedEmail
        );

        return response(session, board, players, computerMove);
    }

    public GameStateResponse move(
        String sessionId,
        int move,
        String authenticatedEmail
    ) {
        GameSession session = sessionService.requireSession(
            sessionId,
            GAME_TYPE,
            authenticatedEmail
        );
        requireInProgress(session);

        Symbol[] board = sessionService.readBoard(
            session,
            Symbol[].class
        );
        Difficulty difficulty = Difficulty.valueOf(
            session.getDifficulty()
        );
        Symbol humanSymbol = Symbol.valueOf(session.getHumanPiece());
        Players players = new Players(
            humanSymbol,
            humanSymbol.opposite()
        );

        try {
            engine.placePiece(board, move, players.humanSymbol());
        } catch (IllegalArgumentException exception) {
            throw badMove(exception);
        }

        if (engine.hasWon(board, players.humanSymbol())) {
            sessionService.update(
                session,
                board,
                GameStatus.HUMAN_WON,
                players.humanSymbol().name()
            );
            return response(session, board, players, null);
        }

        if (engine.isDraw(board)) {
            sessionService.update(
                session,
                board,
                GameStatus.DRAW,
                null
            );
            return response(session, board, players, null);
        }

        int computerMove = engine.chooseComputerMove(
            board,
            difficulty,
            players
        );
        engine.placePiece(
            board,
            computerMove,
            players.computerSymbol()
        );

        GameStatus status = GameStatus.IN_PROGRESS;
        String winner = null;
        if (engine.hasWon(board, players.computerSymbol())) {
            status = GameStatus.COMPUTER_WON;
            winner = players.computerSymbol().name();
        } else if (engine.isDraw(board)) {
            status = GameStatus.DRAW;
        }

        sessionService.update(session, board, status, winner);
        return response(session, board, players, computerMove);
    }

    private GameStateResponse response(
        GameSession session,
        Symbol[] board,
        Players players,
        Integer computerMove
    ) {
        return new GameStateResponse(
            session.getId(),
            session.getGameType(),
            session.getDifficulty(),
            session.getStatus(),
            board,
            players.humanSymbol().name(),
            players.computerSymbol().name(),
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
