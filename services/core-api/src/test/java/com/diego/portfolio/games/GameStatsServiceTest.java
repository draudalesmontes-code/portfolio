package com.diego.portfolio.games;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.diego.portfolio.auth.User;
import com.diego.portfolio.auth.UserRepository;
import com.diego.portfolio.games.dto.GameStatsResponse;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GameStatsServiceTest {
    @Mock
    private GameRepository gameRepository;

    @Mock
    private UserRepository userRepository;

    private GameStatsService gameStatsService;

    @BeforeEach
    void setUp() {
        gameStatsService = new GameStatsService(
            gameRepository,
            userRepository
        );
    }

    @Test
    void getStats_returnsFrontendReadyCountsIncludingZeroValues() {
        User user = new User();
        user.setId(42L);
        when(userRepository.findByEmail("diego@example.com"))
            .thenReturn(Optional.of(user));
        when(gameRepository.countByDifficulty(42L, "HUMAN_WON"))
            .thenReturn(List.of(
                projection("EASY", 4L),
                projection("HARD", 1L)
            ));
        when(gameRepository.countByGameType(42L, "HUMAN_WON"))
            .thenReturn(List.of(
                projection("TIC_TAC_TOE", 2L),
                projection("CONNECT_FOUR", 3L)
            ));

        GameStatsResponse response = gameStatsService.getStats(
            "diego@example.com"
        );

        assertEquals(5L, response.totalWins());
        assertEquals("Easy", response.winsByDifficulty().get(0).level());
        assertEquals(4L, response.winsByDifficulty().get(0).count());
        assertEquals("Medium", response.winsByDifficulty().get(1).level());
        assertEquals(0L, response.winsByDifficulty().get(1).count());
        assertEquals("Hard", response.winsByDifficulty().get(2).level());
        assertEquals(1L, response.winsByDifficulty().get(2).count());
        assertEquals("Tic-Tac-Toe", response.winsByGame().get(0).game());
        assertEquals(2L, response.winsByGame().get(0).count());
        assertEquals("Connect 4", response.winsByGame().get(1).game());
        assertEquals(3L, response.winsByGame().get(1).count());
    }

    private GameRepository.CountProjection projection(
        String label,
        Long count
    ) {
        return new GameRepository.CountProjection() {
            @Override
            public String getLabel() {
                return label;
            }

            @Override
            public Long getCount() {
                return count;
            }
        };
    }
}
