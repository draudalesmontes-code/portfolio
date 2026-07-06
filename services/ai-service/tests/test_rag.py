import io
from unittest.mock import patch
from fastapi.testclient import TestClient
from main import app

client = TestClient(app, raise_server_exceptions=False)


def _make_file(content: bytes, filename: str = "resume.txt"):
    return ("file", (filename, io.BytesIO(content), "text/plain"))


# Test that POST /ai/ingest with a valid UTF-8 file returns 200
def test_ingest_valid_file_returns_200():
    with patch("routers.rag.Chunks.chunk_text", return_value=["chunk one", "chunk two"]), \
         patch("routers.rag._embedder") as mock_embedder, \
         patch("routers.rag.store_document", return_value=1):
        mock_embedder.embed_batch.return_value = [[0.1] * 384, [0.2] * 384]

        response = client.post(
            "/ai/ingest",
            files=[_make_file(b"Hello Diego")],
            data={"title": "Resume", "source": "resume.txt"},
        )
        assert response.status_code == 200


# Test that response body contains document_id, chunk_count, and message
def test_ingest_response_shape():
    with patch("routers.rag.Chunks.chunk_text", return_value=["chunk one", "chunk two"]), \
         patch("routers.rag._embedder") as mock_embedder, \
         patch("routers.rag.store_document", return_value=7):
        mock_embedder.embed_batch.return_value = [[0.1] * 384, [0.2] * 384]

        response = client.post(
            "/ai/ingest",
            files=[_make_file(b"Some text about Diego")],
            data={"title": "Resume", "source": "resume.txt"},
        )
        body = response.json()
        assert body["document_id"] == 7
        assert body["chunk_count"] == 2
        assert "message" in body


# Test that uploading a non-UTF-8 binary file returns 400
def test_ingest_rejects_non_utf8_file():
    binary_content = bytes([0xFF, 0xFE, 0x00, 0x01])
    response = client.post(
        "/ai/ingest",
        files=[_make_file(binary_content, "binary.bin")],
        data={"title": "Bad file", "source": "binary.bin"},
    )
    assert response.status_code == 400


# Test that missing title returns 422
def test_ingest_missing_title_returns_422():
    response = client.post(
        "/ai/ingest",
        files=[_make_file(b"some text")],
        data={"source": "resume.txt"},
    )
    assert response.status_code == 422


# Test that missing source returns 422
def test_ingest_missing_source_returns_422():
    response = client.post(
        "/ai/ingest",
        files=[_make_file(b"some text")],
        data={"title": "Resume"},
    )
    assert response.status_code == 422


# Test that store_document is called with the correct title and source
def test_ingest_passes_title_and_source_to_store():
    with patch("routers.rag.Chunks.chunk_text", return_value=["single chunk"]), \
         patch("routers.rag._embedder") as mock_embedder, \
         patch("routers.rag.store_document", return_value=3) as mock_store:
        mock_embedder.embed_batch.return_value = [[0.1] * 384]

        client.post(
            "/ai/ingest",
            files=[_make_file(b"Diego is a developer")],
            data={"title": "Portfolio Summary", "source": "summary.txt"},
        )
        call_args = mock_store.call_args[0]
        assert call_args[0] == "Portfolio Summary"
        assert call_args[1] == "summary.txt"


# Test that chunk_count in response matches the number of chunks produced
def test_ingest_chunk_count_matches_chunks():
    three_chunks = ["chunk one", "chunk two", "chunk three"]
    with patch("routers.rag.Chunks.chunk_text", return_value=three_chunks), \
         patch("routers.rag._embedder") as mock_embedder, \
         patch("routers.rag.store_document", return_value=5):
        mock_embedder.embed_batch.return_value = [[0.1] * 384] * 3

        response = client.post(
            "/ai/ingest",
            files=[_make_file(b"A long document about Diego")],
            data={"title": "Resume", "source": "resume.txt"},
        )
        assert response.json()["chunk_count"] == 3
