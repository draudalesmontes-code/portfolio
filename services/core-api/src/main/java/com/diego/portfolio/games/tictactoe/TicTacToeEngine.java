package com.diego.portfolio.games.tictactoe;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ThreadLocalRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Selects a legal computer move according to the requested difficulty.
 * Recursive game-tree evaluation is delegated to {@link MiniMax}.
 */
@Component
@RequiredArgsConstructor
public class TicTacToeEngine {
    private static final int BOARD_SIZE = 9;

    private final MiniMax miniMax;

    public Symbol[] newBoard() {
        return new Symbol[BOARD_SIZE];
    }

    public void placePiece(Symbol[] board, int move, Symbol symbol) {
        validateBoard(board);
        Objects.requireNonNull(symbol, "Symbol is required.");

        if (move < 0 || move >= BOARD_SIZE) {
            throw new IllegalArgumentException(
                "Move must be between 0 and 8."
            );
        }
        if (board[move] != null) {
            throw new IllegalArgumentException(
                "That board position is already occupied."
            );
        }

        board[move] = symbol;
    }

    public boolean hasWon(Symbol[] board, Symbol symbol) {
        validateBoard(board);
        Objects.requireNonNull(symbol, "Symbol is required.");

        int[][] winningLines = {
            {0, 1, 2},
            {3, 4, 5},
            {6, 7, 8},
            {0, 3, 6},
            {1, 4, 7},
            {2, 5, 8},
            {0, 4, 8},
            {2, 4, 6}
        };

        for (int[] line : winningLines) {
            if (board[line[0]] == symbol
                && board[line[1]] == symbol
                && board[line[2]] == symbol) {
                return true;
            }
        }

        return false;
    }

    public boolean isDraw(Symbol[] board) {
        validateBoard(board);
        for (Symbol symbol : board) {
            if (symbol == null) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns a board index from 0 through 8 without mutating the supplied
     * board. Difficulty determines whether the move is optimal or random.
     */
    public int chooseComputerMove(
        Symbol[] board,
        Difficulty difficulty,
        Players players
    ) {
        validateInputs(board, difficulty, players);

        List<Integer> moves = availableMoves(board);
        if (moves.isEmpty()) {
            throw new IllegalStateException("No available moves.");
        }

        // Easy never passes this roll, Medium passes about 70% of the time,
        // and Hard always passes it.
        boolean useMiniMax = ThreadLocalRandom.current().nextDouble()
            < difficulty.minimaxChance();

        if (useMiniMax) {
            return miniMax.findBestMove(board, players).move();
        }

        int randomIndex = ThreadLocalRandom.current().nextInt(moves.size());
        return moves.get(randomIndex);
    }

    private List<Integer> availableMoves(Symbol[] board) {
        List<Integer> moves = new ArrayList<>();

        for (int index = 0; index < board.length; index++) {
            if (board[index] == null) {
                moves.add(index);
            }
        }

        return moves;
    }

    private void validateInputs(
        Symbol[] board,
        Difficulty difficulty,
        Players players
    ) {
        validateBoard(board);
        Objects.requireNonNull(difficulty, "Difficulty is required.");
        Objects.requireNonNull(players, "Players are required.");
    }

    private void validateBoard(Symbol[] board) {
        Objects.requireNonNull(board, "Board is required.");
        if (board.length != BOARD_SIZE) {
            throw new IllegalArgumentException(
                "Tic-Tac-Toe board must contain exactly 9 cells."
            );
        }
    }
}
