package com.diego.portfolio.games.tictactoe;

import java.util.Objects;

/**
 * Stores the symbol assignment for one game. The assignment is created at
 * runtime, so either the human or computer may play X.
 */
public record Players(
    Symbol humanSymbol,
    Symbol computerSymbol
) {
    /**
     * Rejects an incomplete or conflicting symbol assignment immediately.
     */
    public Players {
        Objects.requireNonNull(humanSymbol, "Human symbol is required.");
        Objects.requireNonNull(computerSymbol, "Computer symbol is required.");

        if (humanSymbol == computerSymbol) {
            throw new IllegalArgumentException(
                "Human and computer must use different symbols."
            );
        }
    }
}
