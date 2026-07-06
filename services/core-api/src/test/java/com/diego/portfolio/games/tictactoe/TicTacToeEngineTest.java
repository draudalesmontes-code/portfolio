package com.diego.portfolio.games.tictactoe;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TicTacToeEngineTest {
    private TicTacToeEngine engine;
    private MiniMax miniMax;
    private Players players;

    @BeforeEach
    void setUp() {
        miniMax = new MiniMax();
        engine = new TicTacToeEngine(miniMax);
        players = new Players(Symbol.X, Symbol.O);
    }

    @Test
    void hardDifficulty_takesImmediateWinningMove() {
        Symbol[] board = {
            Symbol.O, Symbol.O, null,
            Symbol.X, Symbol.X, null,
            null, null, null
        };

        int move = engine.chooseComputerMove(
            board,
            Difficulty.HARD,
            players
        );

        assertEquals(2, move);
    }

    @Test
    void hardDifficulty_blocksImmediateHumanWin() {
        Symbol[] board = {
            Symbol.X, Symbol.X, null,
            Symbol.O, null, null,
            null, null, null
        };

        int move = engine.chooseComputerMove(
            board,
            Difficulty.HARD,
            players
        );

        assertEquals(2, move);
    }

    @Test
    void everyDifficulty_returnsOnlyRemainingMove() {
        Symbol[] board = {
            Symbol.X, Symbol.O, Symbol.X,
            Symbol.X, Symbol.O, Symbol.O,
            Symbol.O, Symbol.X, null
        };

        for (Difficulty difficulty : Difficulty.values()) {
            assertEquals(
                8,
                engine.chooseComputerMove(board, difficulty, players)
            );
        }
    }

    @Test
    void miniMax_doesNotModifyCallerBoard() {
        Symbol[] board = {
            Symbol.X, null, null,
            null, Symbol.O, null,
            null, null, null
        };
        Symbol[] original = board.clone();

        miniMax.findBestMove(board, players);

        assertArrayEquals(original, board);
    }

    @Test
    void fullBoard_isRejected() {
        Symbol[] board = {
            Symbol.X, Symbol.O, Symbol.X,
            Symbol.X, Symbol.O, Symbol.O,
            Symbol.O, Symbol.X, Symbol.X
        };

        assertThrows(
            IllegalStateException.class,
            () -> engine.chooseComputerMove(
                board,
                Difficulty.HARD,
                players
            )
        );
    }

    @Test
    void invalidBoardSize_isRejected() {
        Symbol[] board = new Symbol[8];

        assertThrows(
            IllegalArgumentException.class,
            () -> engine.chooseComputerMove(
                board,
                Difficulty.HARD,
                players
            )
        );
    }
}
