package com.diego.portfolio.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatusException(
        ResponseStatusException exception,
        HttpServletRequest request
    ) {
        String errorMessage = exception.getReason() != null
        ? exception.getReason()
        : "Request failed";
        ApiError error = new ApiError(
            Instant.now(),
            exception.getStatusCode().value(),
            errorMessage,
            request.getRequestURI(),
            Map.of()
        );

        return ResponseEntity
            .status(exception.getStatusCode())
            .body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationException(
        MethodArgumentNotValidException exception,
        HttpServletRequest request
    ){
        Map<String, String> fields = new LinkedHashMap<>();


        exception.getBindingResult()
            .getFieldErrors()
            .forEach(error -> fields.putIfAbsent(
                error.getField(),
                error.getDefaultMessage() != null
                ? error.getDefaultMessage()
                : "Invalid value"
            ));

            ApiError error = new ApiError(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed",
                request.getRequestURI(),
                fields
            );
            return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadableRequest(
        HttpMessageNotReadableException exception,
        HttpServletRequest request
    ) {
        ApiError error = new ApiError(
            Instant.now(),
            HttpStatus.BAD_REQUEST.value(),
            "Request body is malformed or contains an unsupported value.",
            request.getRequestURI(),
            Map.of()
        );
        return ResponseEntity.badRequest().body(error);
    }

    public record ApiError(
        Instant timestamp,
        int status,
        String message,
        String path,
        Map<String, String> fields
    ) {}

}
