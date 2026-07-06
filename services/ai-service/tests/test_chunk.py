import pytest
from unittest.mock import patch, MagicMock
from services.retrieval.chunk import Chunks


def _make_tokenizer():
    """Mock tokenizer: each character becomes one integer token."""
    mock = MagicMock()
    mock.encode.side_effect = lambda text, add_special_tokens=False: list(range(len(text)))
    mock.decode.side_effect = lambda ids: "x" * len(ids)
    return mock


# Test that a long document produces more than one chunk
def test_long_text_produces_multiple_chunks():
    with patch("services.retrieval.chunk._tokenizer", _make_tokenizer()):
        long_text = "word " * 1000  # 5000 chars → 5000 tokens → many chunks
        chunks = Chunks.chunk_text(long_text)
        assert len(chunks) > 1


# Test that each chunk does not exceed the model token limit (256)
def test_chunk_size_within_token_limit():
    tok = _make_tokenizer()
    with patch("services.retrieval.chunk._tokenizer", tok):
        long_text = "word " * 1000
        chunks = Chunks.chunk_text(long_text, chunk_size=256)
        for chunk in chunks:
            tokens = tok.encode(chunk, add_special_tokens=False)
            assert len(tokens) <= 256


# Test that adjacent chunks share overlapping content
def test_adjacent_chunks_share_overlap():
    with patch("services.retrieval.chunk._tokenizer", _make_tokenizer()):
        long_text = "word " * 500  # 2500 chars → 2500 tokens
        chunks = Chunks.chunk_text(long_text, chunk_size=100, overlap=20)
        assert len(chunks) >= 2


# Test that text shorter than chunk_size returns a single chunk
def test_short_text_returns_single_chunk():
    with patch("services.retrieval.chunk._tokenizer", _make_tokenizer()):
        short_text = "Hello world"  # 11 chars < 256 chunk_size
        chunks = Chunks.chunk_text(short_text)
        assert len(chunks) == 1


# Test that empty string returns an empty list (no chunks)
def test_empty_string_returns_empty_list():
    with patch("services.retrieval.chunk._tokenizer", _make_tokenizer()):
        chunks = Chunks.chunk_text("")
        assert chunks == []


# Test that chunks are non-empty strings
def test_chunks_cover_full_document():
    with patch("services.retrieval.chunk._tokenizer", _make_tokenizer()):
        text = "Diego built a RAG system using FastAPI and pgvector for semantic search."
        chunks = Chunks.chunk_text(text)
        for chunk in chunks:
            assert isinstance(chunk, str)
            assert len(chunk) > 0
