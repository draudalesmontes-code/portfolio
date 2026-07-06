package com.diego.portfolio.games;

import com.diego.portfolio.auth.User;
import com.diego.portfolio.auth.UserRepository;
import com.diego.portfolio.games.dto.GameStatsResponse;
import com.diego.portfolio.games.dto.GameStatsResponse.DifficultyWins;
import com.diego.portfolio.games.dto.GameStatsResponse.GameWins;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class GameStatsService {
    private static final Map<String, String> DIFFICULTY_LABELS =
        orderedLabels(
            "EASY", "Easy",
            "MEDIUM", "Medium",
            "HARD", "Hard"
        );

    private static final Map<String, String> GAME_LABELS =
        orderedLabels(
            "TIC_TAC_TOE", "Tic-Tac-Toe",
            "CONNECT_FOUR", "Connect 4"
        );

    private final GameRepository gameRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public GameStatsResponse getStats(String authenticatedEmail) {
        User user = requireUser(authenticatedEmail);
        String winningStatus = GameStatus.HUMAN_WON.name();

        Map<String, Long> difficultyCounts = counts(
            gameRepository.countByDifficulty(user.getId(), winningStatus)
        );
        Map<String, Long> gameCounts = counts(
            gameRepository.countByGameType(user.getId(), winningStatus)
        );

        List<DifficultyWins> winsByDifficulty = DIFFICULTY_LABELS
            .entrySet()
            .stream()
            .map(entry -> new DifficultyWins(
                entry.getValue(),
                difficultyCounts.getOrDefault(entry.getKey(), 0L)
            ))
            .toList();

        List<GameWins> winsByGame = GAME_LABELS
            .entrySet()
            .stream()
            .map(entry -> new GameWins(
                entry.getValue(),
                gameCounts.getOrDefault(entry.getKey(), 0L)
            ))
            .toList();

        long totalWins = winsByDifficulty
            .stream()
            .mapToLong(DifficultyWins::count)
            .sum();

        return new GameStatsResponse(
            totalWins,
            winsByDifficulty,
            winsByGame
        );
    }

    private User requireUser(String authenticatedEmail) {
        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authentication is required."
            );
        }

        return userRepository.findByEmail(authenticatedEmail)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authenticated user was not found."
            ));
    }

    private Map<String, Long> counts(
        List<GameRepository.CountProjection> projections
    ) {
        Map<String, Long> counts = new LinkedHashMap<>();
        projections.forEach(projection ->
            counts.put(projection.getLabel(), projection.getCount())
        );
        return counts;
    }

    private static Map<String, String> orderedLabels(String... entries) {
        Map<String, String> labels = new LinkedHashMap<>();
        for (int index = 0; index < entries.length; index += 2) {
            labels.put(entries[index], entries[index + 1]);
        }
        return Collections.unmodifiableMap(labels);
    }
}
