ALTER TABLE users
    ADD COLUMN verification_token_expires_at TIMESTAMPTZ;

UPDATE users
SET verification_token_expires_at = NOW() + INTERVAL '24 hours'
WHERE verification_token IS NOT NULL;
