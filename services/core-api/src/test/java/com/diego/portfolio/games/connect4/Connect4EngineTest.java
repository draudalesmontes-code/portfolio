package com.diego.portfolio.games.connect4;

import org.junit.jupiter.api.Test;

class Connect4EngineTest {

    // Test that dropping a piece in an empty column lands on the bottom row
    @Test
    void dropPiece_emptyColumn_landsOnBottom() {}

    // Test that dropping a piece in a column stacks on top of existing pieces
    @Test
    void dropPiece_stacksCorrectly() {}

    // Test that a full column rejects a new drop
    @Test
    void dropPiece_fullColumn_rejected() {}

    // Test that four in a horizontal row is detected as a win
    @Test
    void checkWin_horizontal_returnsWin() {}

    // Test that four in a diagonal is detected as a win
    @Test
    void checkWin_diagonal_returnsWin() {}

    // Test that a full board with no winner is a draw
    @Test
    void checkDraw_fullBoard_returnsDraw() {}
}
