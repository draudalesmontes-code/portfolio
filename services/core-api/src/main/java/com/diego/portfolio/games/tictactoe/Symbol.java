package com.diego.portfolio.games.tictactoe;

/**
 * The two marks supported by a Tic-Tac-Toe board.
 */
public enum Symbol {
    X,
    O;

    /**
     * Returns the mark assigned to the other player.
     */
    public Symbol opposite() {
        return this == X ? O : X;
    }
}
