"""
AI Service — Entry Point
========================

This FastAPI application powers the AI assistant for Diego Raudales's portfolio.
It exposes two routers under the /ai prefix and a root health check.

Startup
-------
Run locally:
    uvicorn main:app --reload --port 8001

Via Docker Compose the service starts automatically when `db` and `redis` are healthy.

Routers
-------
POST /ai/chat
    Stream an AI answer grounded in the portfolio knowledge base.

    Request body (JSON):
        {
            "message":    "Who is Diego?",       # required — user's question
            "session_id": "uuid-string",          # optional — omit on first message
            "provider":   "groq",                 # optional — groq (default) | openai | claude
            "api_key":    "sk-..."                # required when provider != "groq"
        }

    Response:
        Content-Type: text/plain (streamed tokens)
        X-Session-Id: <uuid>        — use this value as session_id in subsequent requests
        X-Citations: [...]          — JSON array of retrieved chunks used to build the answer
                                      each object: { chunk_text, source, distance }

POST /ai/ingest
    Upload a UTF-8 text document to be chunked, embedded, and stored in pgvector.
    Accepts multipart/form-data.

    Form fields:
        file    (required) — UTF-8 text file (resume, bio, project description, etc.)
        title   (required) — human-readable document name, e.g. "Resume"
        source  (required) — file origin label, e.g. "resume.pdf"

    Response body (JSON):
        {
            "message":     "File ingested successfully",
            "document_id": 1,    # database id of the newly created document row
            "chunk_count": 14    # number of chunks stored in document_chunks
        }

GET /
    Health check. Returns {"status": "ok"} with HTTP 200.
    Used by Docker Compose and the nginx gateway to verify the service is alive.

Error Responses
---------------
All errors follow FastAPI's default JSON error envelope:
    { "detail": "<human-readable message>" }

400 Bad Request
    • /ai/ingest  — file is not valid UTF-8 ("File must be UTF-8 encoded text")
    • /ai/chat    — unsupported provider string
    • /ai/chat    — provider is openai or claude but api_key was not supplied

422 Unprocessable Entity
    FastAPI validation error — missing required fields, wrong types, etc.
    Body contains a `detail` array with per-field errors.

429 Too Many Requests
    Guest rate limit (10 requests/minute per IP) exceeded.
    Body: { "detail": "Rate limit exceeded. Provide your own API key for unlimited access." }
    Bypass: include X-Api-Key header with a valid BYOK key to get 10 000 requests/minute.

500 Internal Server Error
    Unexpected failure in /ai/chat or /ai/ingest.
    Body: { "detail": "<error message>" }

Rate Limiting
-------------
Implemented via slowapi (starlette middleware wrapping limits-lib).
`app.state.limiter` must be set before the exception handler is registered —
slowapi reads it off app.state internally.

Session Management
------------------
Guest sessions live in Redis under key `session:<uuid>` with a 30-minute sliding TTL.
The TTL resets on every save, so active conversations never expire mid-chat.
On browser close / TTL expiry Redis drops the key automatically — no cleanup job needed.

BYOK (Bring Your Own Key)
--------------------------
The api_key field is used in-memory for the duration of the request only.
It is never written to the database, never logged, never stored in Redis.
"""

from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from slowapi.errors import RateLimitExceeded

from middleware.rate_limit import limiter, rate_limit_handler
from routers import chat, rag
from services.retrieval.chunk import Chunks
from services.embedding.base import BaseEmbedder
from services.retrieval.pgvector_store import store_document, has_content

_DATA_DIR = Path(__file__).parent / "data"
_DOCUMENTS = [
    ("Resume", "resume.txt"),
    ("Projects", "projects.txt"),
    ("About", "about.txt"),
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not has_content():
        embedder = BaseEmbedder()
        for title, filename in _DOCUMENTS:
            path = _DATA_DIR / filename
            if path.exists():
                text = path.read_text(encoding="utf-8")
                chunks = Chunks.chunk_text(text)
                embeddings = embedder.embed_batch(chunks)
                store_document(title, filename, chunks, embeddings)
    yield


app = FastAPI(lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

app.include_router(chat.router, prefix="/ai")
app.include_router(rag.router, prefix="/ai")


@app.get("/")
@app.get("/ai/health")
def health() -> dict:
    return {"status": "ok"}
