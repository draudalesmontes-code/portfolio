package com.diego.portfolio.games.tictactoe;

import com.diego.portfolio.games.dto.GameMoveRequest;
import com.diego.portfolio.games.dto.GameStateResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/games/tictactoe")
@RequiredArgsConstructor
public class TicTacToeController {
    private final TicTacToeGameService gameService;

    @PostMapping("/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public GameStateResponse start(
        @Valid @RequestBody TicTacToeStartRequest request,
        Authentication authentication
    ) {
        return gameService.start(request, emailFrom(authentication));
    }

    @PostMapping("/sessions/{sessionId}/moves")
    public GameStateResponse move(
        @PathVariable String sessionId,
        @Valid @RequestBody GameMoveRequest request,
        Authentication authentication
    ) {
        return gameService.move(
            sessionId,
            request.move(),
            emailFrom(authentication)
        );
    }

    private String emailFrom(Authentication authentication) {
        if (authentication == null
            || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        return authentication.getName();
    }
}
