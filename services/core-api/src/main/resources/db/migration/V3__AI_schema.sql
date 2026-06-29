CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    source       VARCHAR(255),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE document_chunks (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id  BIGINT       NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index  INTEGER      NOT NULL,
    chunk_text   TEXT         NOT NULL,
    embedding    vector(384)  NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX ON document_chunks USING hnsw (embedding vector_cosine_ops);

CREATE TABLE conversations (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id      BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    provider     VARCHAR(50)  NOT NULL DEFAULT 'default',
    model_name   VARCHAR(100),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE messages (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id BIGINT      NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'AI')),
    content         TEXT        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
