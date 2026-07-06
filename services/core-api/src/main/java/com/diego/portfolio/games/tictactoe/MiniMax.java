package com.diego.portfolio.games.tictactoe;

import org.springframework.stereotype.Component;

/**
 * Evaluates the complete Tic-Tac-Toe game tree while assuming that both
 * players choose their strongest available response.
 */
@Component
public class MiniMax {
    // Every row, column, and diagonal that can win a 3x3 game.
    private static final int[][] WINNING_LINES = {
        {0, 1, 2},
        {3, 4, 5},
        {6, 7, 8},
        {0, 3, 6},
        {1, 4, 7},
        {2, 5, 8},
        {0, 4, 8},
        {2, 4, 6}
    };

    /**
     * Couples the selected board index with the score minimax assigned it.
     */
    public record MoveScore(int move, int score) {
    }

    /**
     * Tries every legal computer move and returns the highest-scoring one.
     */
    public MoveScore findBestMove(Symbol[] board, Players players) {
        int bestMove = -1;
        int bestScore = Integer.MIN_VALUE;

        for (int move = 0; move < board.length; move++) {
            if (board[move] != null) {
                continue;
            }

            board[move] = players.computerSymbol();
            int score = minimax(board, 0, false, players);
            // Undo the simulated move before evaluating the next branch.
            board[move] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        if (bestMove == -1) {
            throw new IllegalStateException("No available moves.");
        }

        return new MoveScore(bestMove, bestScore);
    }

    /**
     * Recursively returns the value of the current simulated board.
     * The computer maximizes scores; the human minimizes them.
     */
    private int minimax(
        Symbol[] board,
        int depth,
        boolean computerTurn,
        Players players
    ) {
        // Depth rewards faster wins and makes delayed losses less negative.
        if (hasWon(board, players.computerSymbol())) {
            return 10 - depth;
        }

        if (hasWon(board, players.humanSymbol())) {
            return depth - 10;
        }

        int bestScore = computerTurn
            ? Integer.MIN_VALUE
            : Integer.MAX_VALUE;
        boolean moveFound = false;

        for (int move = 0; move < board.length; move++) {
            if (board[move] != null) {
                continue;
            }

            moveFound = true;
            // Make one simulated move for the active player.
            board[move] = computerTurn
                ? players.computerSymbol()
                : players.humanSymbol();

            int score = minimax(
                board,
                depth + 1,
                !computerTurn,
                players
            );

            // Backtrack so sibling branches start from the same board.
            board[move] = null;

            bestScore = computerTurn
                ? Math.max(bestScore, score)
                : Math.min(bestScore, score);
        }

        // No legal move and no winner means the simulated game is a draw.
        return moveFound ? bestScore : 0;
    }

    private boolean hasWon(Symbol[] board, Symbol symbol) {
        for (int[] line : WINNING_LINES) {
            if (board[line[0]] == symbol
                && board[line[1]] == symbol
                && board[line[2]] == symbol) {
                return true;
            }
        }

        return false;
    }
}
