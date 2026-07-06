package com.diego.portfolio.games.tictactoe;

/**
 * Controls how often the computer follows the optimal minimax move.
 * A failed minimax roll falls back to a random legal move.
 */
public enum Difficulty {
    EASY(0.0),
    MEDIUM(0.70),
    HARD(1.0);

    // Probability from 0.0 (never) to 1.0 (always).
    private final double minimaxChance;

    Difficulty(double minimaxChance) {
        this.minimaxChance = minimaxChance;
    }

    public double minimaxChance() {
        return minimaxChance;
    }
}
