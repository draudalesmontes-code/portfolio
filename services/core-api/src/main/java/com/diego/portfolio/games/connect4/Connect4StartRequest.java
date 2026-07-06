package com.diego.portfolio.games.connect4;

import jakarta.validation.constraints.NotNull;

public record Connect4StartRequest(
    @NotNull(message = "Difficulty is required.")
    Difficulty difficulty,

    @NotNull(message = "Human piece is required.")
    Piece humanPiece
) {
}
