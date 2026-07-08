package com.diego.portfolio.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CookieCsrfTokenRepository csrfTokenRepository(
        @Value("${app.auth.cookie-secure:false}") boolean secureCookie
    ) {
        CookieCsrfTokenRepository repository = new CookieCsrfTokenRepository();
        repository.setCookieCustomizer(cookie -> cookie
            .httpOnly(false)
            .path("/")
            .sameSite("Strict")
            .secure(secureCookie));
        return repository;
    }

    @Bean
    public SecurityFilterChain filterChain(
        HttpSecurity http,
        CookieCsrfTokenRepository csrfTokenRepository
    ) throws Exception {
        http.csrf(csrf -> csrf
                .ignoringRequestMatchers(
                    "/auth/register",
                    "/auth/login",
                    "/auth/resend-verification",
                    "/feedback",
                    "/games/connect4/sessions",
                    "/games/connect4/sessions/*/moves",
                    "/games/tictactoe/sessions",
                    "/games/tictactoe/sessions/*/moves"
                )
                .csrfTokenRepository(csrfTokenRepository)
                .csrfTokenRequestHandler(
                    new SpaCsrfTokenRequestHandler()
                ))
            .sessionManagement(sm ->
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    HttpMethod.POST,
                    "/auth/register",
                    "/auth/login",
                    "/auth/logout",
                    "/auth/resend-verification"
                ).permitAll()
                .requestMatchers(
                    HttpMethod.GET,
                    "/auth/verify",
                    "/auth/confirm-email-change",
                    "/auth/users/*/profile-image",
                    "/auth/csrf",
                    "/actuator/health"
                ).permitAll()
                .requestMatchers(HttpMethod.POST, "/feedback").permitAll()
                .requestMatchers(
                    HttpMethod.POST,
                    "/games/connect4/sessions",
                    "/games/connect4/sessions/*/moves",
                    "/games/tictactoe/sessions",
                    "/games/tictactoe/sessions/*/moves"
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/auth/me").authenticated()
                .requestMatchers(
                    HttpMethod.POST,
                    "/auth/change-password",
                    "/auth/change-email",
                    "/auth/profile-image"
                ).authenticated()
                .requestMatchers(
                    HttpMethod.GET,
                    "/games/stats",
                    "/feedback/mine"
                ).authenticated()
                .anyRequest().denyAll())
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, exception) ->
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED))
                .accessDeniedHandler((request, response, exception) ->
                    response.sendError(HttpServletResponse.SC_FORBIDDEN)))
            .requestCache(cache -> cache.disable())
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
