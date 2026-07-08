ALTER TABLE users
    ADD COLUMN profile_image_url VARCHAR(2048),
    ADD COLUMN pending_email VARCHAR(255),
    ADD COLUMN email_change_token VARCHAR(255),
    ADD COLUMN email_change_token_expires_at TIMESTAMPTZ;

CREATE UNIQUE INDEX idx_users_email_change_token
    ON users(email_change_token)
    WHERE email_change_token IS NOT NULL;
