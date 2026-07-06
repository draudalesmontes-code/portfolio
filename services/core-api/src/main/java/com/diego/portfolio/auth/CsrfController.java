package com.diego.portfolio.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class CsrfController {
    private final CookieCsrfTokenRepository csrfTokenRepository;

    @GetMapping("/csrf")
    public Map<String, String> csrf(
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        CsrfToken csrfToken = csrfTokenRepository
            .loadDeferredToken(request, response)
            .get();

        return Map.of(
            "token",
            csrfToken.getToken(),
            "headerName",
            csrfToken.getHeaderName()
        );
    }
}
