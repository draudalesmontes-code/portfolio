CREATE TABLE game_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    game_type VARCHAR(30) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    human_piece VARCHAR(10) NOT NULL,
    board_state TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    winner VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_game_sessions_user_id
    ON game_sessions(user_id);

CREATE INDEX idx_game_sessions_user_result
    ON game_sessions(user_id, status, difficulty);
