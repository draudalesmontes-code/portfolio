package com.diego.portfolio.games.dto;

public record GameStateResponse(
    String sessionId,
    String gameType,
    String difficulty,
    String status,
    Object board,
    String humanPiece,
    String computerPiece,
    String winner,
    Integer computerMove
) {
}
