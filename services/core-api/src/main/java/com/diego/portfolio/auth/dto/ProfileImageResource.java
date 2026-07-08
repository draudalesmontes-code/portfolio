package com.diego.portfolio.auth.dto;

public record ProfileImageResource(
    byte[] data,
    String contentType
) {
}
