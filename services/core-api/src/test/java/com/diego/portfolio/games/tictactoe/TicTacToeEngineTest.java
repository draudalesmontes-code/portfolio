package com.diego.portfolio.games.tictactoe;

import org.junit.jupiter.api.Test;

class TicTacToeEngineTest {

    // Test that a valid move on an empty cell is accepted
    @Test
    void applyMove_emptyCell_accepted() {}

    // Test that a move on an occupied cell is rejected
    @Test
    void applyMove_occupiedCell_rejected() {}

    // Test that three in a row on a row is detected as a win
    @Test
    void checkWin_threeInRow_returnsWin() {}

    // Test that three in a diagonal is detected as a win
    @Test
    void checkWin_diagonal_returnsWin() {}

    // Test that a full board with no winner is detected as a draw
    @Test
    void checkDraw_fullBoard_returnsDraw() {}

    // Test that a move after the game is over is rejected
    @Test
    void applyMove_gameOver_rejected() {}
}
