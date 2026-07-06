package com.diego.portfolio.games.connect4;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class Connect4EngineTest {
    private Connect4Engine engine;

    @BeforeEach
    void setUp() {
        engine = new Connect4Engine();
    }

    @Test
    void dropPiece_emptyColumn_landsOnBottom() {
        Piece[][] board = engine.newBoard();

        Connect4Engine.PlacedPiece move = engine.dropPiece(
            board,
            3,
            Piece.RED
        );

        assertEquals(5, move.row());
        assertEquals(3, move.column());
        assertEquals(Piece.RED, board[5][3]);
    }

    @Test
    void dropPiece_stacksOnExistingPieces() {
        Piece[][] board = engine.newBoard();
        engine.dropPiece(board, 2, Piece.RED);

        Connect4Engine.PlacedPiece move = engine.dropPiece(
            board,
            2,
            Piece.YELLOW
        );

        assertEquals(4, move.row());
        assertEquals(Piece.YELLOW, board[4][2]);
    }

    @Test
    void dropPiece_fullColumn_isRejected() {
        Piece[][] board = engine.newBoard();
        for (int row = 0; row < Connect4Engine.ROWS; row++) {
            engine.dropPiece(board, 0, Piece.RED);
        }

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> engine.dropPiece(board, 0, Piece.YELLOW)
        );

        assertEquals("Column is full.", exception.getMessage());
    }

    @Test
    void dropPiece_outOfRangeColumn_isRejected() {
        Piece[][] board = engine.newBoard();

        assertThrows(
            IllegalArgumentException.class,
            () -> engine.dropPiece(board, 7, Piece.RED)
        );
    }

    @Test
    void hasWon_detectsHorizontalLine() {
        Piece[][] board = engine.newBoard();
        Connect4Engine.PlacedPiece lastMove = null;

        for (int column = 0; column < 4; column++) {
            lastMove = engine.dropPiece(board, column, Piece.RED);
        }

        assertTrue(engine.hasWon(board, lastMove, Piece.RED));
        assertFalse(engine.hasWon(board, lastMove, Piece.YELLOW));
    }

    @Test
    void hasWon_detectsVerticalLine() {
        Piece[][] board = engine.newBoard();
        Connect4Engine.PlacedPiece lastMove = null;

        for (int count = 0; count < 4; count++) {
            lastMove = engine.dropPiece(board, 4, Piece.YELLOW);
        }

        assertTrue(engine.hasWon(board, lastMove, Piece.YELLOW));
    }

    @Test
    void hasWon_detectsBothDiagonalDirections() {
        Piece[][] descending = engine.newBoard();
        descending[5][0] = Piece.RED;
        descending[4][1] = Piece.RED;
        descending[3][2] = Piece.RED;
        descending[2][3] = Piece.RED;

        Piece[][] ascending = engine.newBoard();
        ascending[2][0] = Piece.YELLOW;
        ascending[3][1] = Piece.YELLOW;
        ascending[4][2] = Piece.YELLOW;
        ascending[5][3] = Piece.YELLOW;

        assertTrue(engine.hasWon(
            descending,
            new Connect4Engine.PlacedPiece(2, 3),
            Piece.RED
        ));
        assertTrue(engine.hasWon(
            ascending,
            new Connect4Engine.PlacedPiece(2, 0),
            Piece.YELLOW
        ));
    }

    @Test
    void isDraw_fullBoard_returnsTrue() {
        Piece[][] board = engine.newBoard();
        for (int row = 0; row < Connect4Engine.ROWS; row++) {
            for (int column = 0; column < Connect4Engine.COLUMNS; column++) {
                board[row][column] = (row + column) % 2 == 0
                    ? Piece.RED
                    : Piece.YELLOW;
            }
        }

        assertTrue(engine.isDraw(board));
    }

    @Test
    void hardDifficulty_takesImmediateWinningMove() {
        Piece[][] board = engine.newBoard();
        engine.dropPiece(board, 0, Piece.RED);
        engine.dropPiece(board, 1, Piece.RED);
        engine.dropPiece(board, 2, Piece.RED);

        int move = engine.chooseComputerMove(
            board,
            Difficulty.HARD,
            Piece.RED
        );

        assertEquals(3, move);
    }

    @Test
    void hardDifficulty_blocksImmediateLoss() {
        Piece[][] board = engine.newBoard();
        engine.dropPiece(board, 0, Piece.YELLOW);
        engine.dropPiece(board, 1, Piece.YELLOW);
        engine.dropPiece(board, 2, Piece.YELLOW);

        int move = engine.chooseComputerMove(
            board,
            Difficulty.HARD,
            Piece.RED
        );

        assertEquals(3, move);
    }

    @Test
    void choosingComputerMove_doesNotModifyBoard() {
        Piece[][] board = engine.newBoard();
        engine.dropPiece(board, 3, Piece.RED);
        engine.dropPiece(board, 3, Piece.YELLOW);
        Piece[][] original = copy(board);

        engine.chooseComputerMove(
            board,
            Difficulty.HARD,
            Piece.RED
        );

        for (int row = 0; row < Connect4Engine.ROWS; row++) {
            assertArrayEquals(original[row], board[row]);
        }
    }

    private Piece[][] copy(Piece[][] board) {
        Piece[][] copy = new Piece[board.length][];
        for (int row = 0; row < board.length; row++) {
            copy[row] = board[row].clone();
        }
        return copy;
    }
}
