import psycopg2
import psycopg2.extras
from psycopg2 import pool as pg_pool
from pgvector.psycopg2 import register_vector
from config import settings


_pool = pg_pool.ThreadedConnectionPool(
    minconn=1,
    maxconn=10,
    dsn=settings.database_url,
)


def _get_conn():
    conn = _pool.getconn()
    register_vector(conn)
    return conn


def _release_conn(conn):
    _pool.putconn(conn)


def store_document(title: str, source: str, chunks: list[str], embeddings: list[list[float]]) -> int:
    if len(chunks) != len(embeddings):
        raise ValueError("chunks and embeddings must have the same length")

    conn = _get_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO documents (title, source) VALUES (%s, %s) RETURNING id",
                    (title, source),
                )
                document_id = cur.fetchone()[0]

                for chunk_index, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
                    cur.execute(
                        """INSERT INTO document_chunks (document_id, chunk_index, chunk_text, embedding)
                           VALUES (%s, %s, %s, %s)""",
                        (document_id, chunk_index, chunk_text, embedding),
                    )
        return document_id
    finally:
        _release_conn(conn)


def similarity_search(query_embedding: list[float], k: int = 5) -> list[dict]:
    conn = _get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """SELECT dc.chunk_text, d.source, dc.embedding <=> %s AS distance
                   FROM document_chunks dc
                   JOIN documents d ON d.id = dc.document_id
                   ORDER BY dc.embedding <=> %s
                   LIMIT %s""",
                (query_embedding, query_embedding, k),
            )
            return [dict(row) for row in cur.fetchall()]
    finally:
        _release_conn(conn)
