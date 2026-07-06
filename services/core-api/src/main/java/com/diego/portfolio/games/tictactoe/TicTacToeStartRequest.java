package com.diego.portfolio.games.tictactoe;

import jakarta.validation.constraints.NotNull;

public record TicTacToeStartRequest(
    @NotNull(message = "Difficulty is required.")
    Difficulty difficulty,

    @NotNull(message = "Human symbol is required.")
    Symbol humanSymbol
) {
}
