"""
Root conftest.py — stubs unavailable heavy packages for local unit test runs.

fastapi, pydantic, pydantic-settings, and slowapi are installed locally so we
do NOT stub those. We only stub the packages that require a running service or
a large ML download: psycopg2/pgvector (database), sentence_transformers /
transformers / numpy (ML model), and API client libs.
"""
import sys
from unittest.mock import MagicMock


def _stub(*names: str) -> None:
    for name in names:
        if name not in sys.modules:
            sys.modules[name] = MagicMock()


_stub(
    "psycopg2",
    "psycopg2.pool",
    "psycopg2.extras",
    "pgvector",
    "pgvector.psycopg2",
    "sentence_transformers",
    "transformers",
    "numpy",
    "anthropic",
    "openai",
    "groq",
    "redis",
)
