package com.diego.portfolio.games.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;

public record GameMoveRequest(
    @NotNull(message = "Move is required.")
    @Min(value = 0, message = "Move cannot be negative.")
    @Max(value = 8, message = "Move must be at most 8.")
    Integer move
) {
}
