package com.diego.portfolio.games.connect4;

public enum Difficulty {
    EASY(0, 0.0),
    MEDIUM(4, 0.70),
    HARD(6, 1.0);

    private final int searchDepth;
    private final double optimalMoveChance;

    Difficulty(int searchDepth, double optimalMoveChance) {
        this.searchDepth = searchDepth;
        this.optimalMoveChance = optimalMoveChance;
    }

    public int searchDepth() {
        return searchDepth;
    }

    public double optimalMoveChance() {
        return optimalMoveChance;
    }
}
