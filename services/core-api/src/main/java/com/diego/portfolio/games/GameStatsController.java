package com.diego.portfolio.games;

import com.diego.portfolio.games.dto.GameStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class GameStatsController {
    private final GameStatsService gameStatsService;

    @GetMapping("/stats")
    public GameStatsResponse stats(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authentication is required."
            );
        }
        return gameStatsService.getStats(authentication.getName());
    }
}
