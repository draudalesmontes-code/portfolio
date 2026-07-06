package com.diego.portfolio.games;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface GameRepository extends JpaRepository<GameSession, String> {
    interface CountProjection {
        String getLabel();
        Long getCount();
    }

    @Query("""
        SELECT game.difficulty AS label, COUNT(game) AS count
        FROM GameSession game
        WHERE game.userId = :userId AND game.status = :status
        GROUP BY game.difficulty
        """)
    List<CountProjection> countByDifficulty(
        @Param("userId") Long userId,
        @Param("status") String status
    );

    @Query("""
        SELECT game.gameType AS label, COUNT(game) AS count
        FROM GameSession game
        WHERE game.userId = :userId AND game.status = :status
        GROUP BY game.gameType
        """)
    List<CountProjection> countByGameType(
        @Param("userId") Long userId,
        @Param("status") String status
    );
}
