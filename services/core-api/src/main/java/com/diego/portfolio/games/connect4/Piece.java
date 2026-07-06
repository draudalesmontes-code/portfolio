package com.diego.portfolio.games.connect4;

public enum Piece {
    RED,
    YELLOW;

    public Piece opposite() {
        return this == RED ? YELLOW : RED;
    }
}
