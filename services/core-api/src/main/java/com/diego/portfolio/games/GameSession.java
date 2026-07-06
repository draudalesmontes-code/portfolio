package com.diego.portfolio.games;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Data;

@Data
@Entity
@Table(name = "game_sessions")
public class GameSession {
    @Id
    @Column(length = 36)
    private String id = UUID.randomUUID().toString();

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "game_type", nullable = false, length = 30)
    private String gameType;

    @Column(nullable = false, length = 20)
    private String difficulty;

    @Column(name = "human_piece", nullable = false, length = 10)
    private String humanPiece;

    @Column(name = "board_state", nullable = false, columnDefinition = "TEXT")
    private String boardState;

    @Column(nullable = false, length = 20)
    private String status = GameStatus.IN_PROGRESS.name();

    @Column(length = 10)
    private String winner;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}
