package com.diego.portfolio.games.dto;

import java.util.List;

public record GameStatsResponse(
    long totalWins,
    List<DifficultyWins> winsByDifficulty,
    List<GameWins> winsByGame
) {
    public record DifficultyWins(String level, long count) {
    }

    public record GameWins(String game, long count) {
    }
}
