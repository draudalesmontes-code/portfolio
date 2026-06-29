package com.diego.portfolio.games.wordgame;

import org.junit.jupiter.api.Test;

class WordGameEngineTest {

    // Test that a valid dictionary word is accepted as a guess
    @Test
    void guess_validWord_accepted() {}

    // Test that a word not in the dictionary is rejected
    @Test
    void guess_invalidWord_rejected() {}

    // Test that a correct guess ends the game with a win
    @Test
    void guess_correctWord_gameWon() {}

    // Test that feedback correctly marks letters as correct, present, or absent
    @Test
    void guess_returnsFeedbackPerLetter() {}

    // Test that exceeding max attempts ends the game with a loss
    @Test
    void guess_maxAttemptsExceeded_gameLost() {}

    // Test that guessing the same word twice is rejected
    @Test
    void guess_duplicateGuess_rejected() {}
}
