ALTER TABLE users
    ADD COLUMN profile_image_content_type VARCHAR(100),
    ADD COLUMN profile_image_data BYTEA,
    ADD COLUMN profile_image_updated_at TIMESTAMPTZ;
