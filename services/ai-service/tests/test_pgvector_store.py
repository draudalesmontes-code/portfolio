import pytest
from unittest.mock import patch, MagicMock


def _make_mock_pool(fetchone=None, fetchall=None):
    mock_pool = MagicMock()
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    if fetchone is not None:
        mock_cursor.fetchone.return_value = fetchone
    if fetchall is not None:
        mock_cursor.fetchall.return_value = fetchall
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
    mock_conn.__enter__.return_value = mock_conn
    mock_pool.getconn.return_value = mock_conn
    return mock_pool, mock_conn, mock_cursor


# Test that store_document returns the document_id from the DB
def test_store_document_returns_document_id():
    mock_pool, _, _ = _make_mock_pool(fetchone=[42])
    with patch("services.retrieval.pgvector_store._get_pool", return_value=mock_pool), \
         patch("services.retrieval.pgvector_store.register_vector"):
        from services.retrieval.pgvector_store import store_document
        doc_id = store_document("Resume", "resume.pdf", ["chunk one"], [[0.1] * 384])
        assert doc_id == 42


# Test that mismatched chunks and embeddings lengths raises ValueError
def test_store_document_raises_on_length_mismatch():
    from services.retrieval.pgvector_store import store_document
    with pytest.raises(ValueError):
        store_document("Resume", "resume.pdf", ["chunk one", "chunk two"], [[0.1] * 384])


# Test that similarity_search returns exactly k results
def test_similarity_search_returns_k_results():
    rows = [
        {"chunk_text": f"chunk {i}", "source": "resume.pdf", "distance": 0.1 * i}
        for i in range(5)
    ]
    mock_pool, _, _ = _make_mock_pool(fetchall=rows)
    with patch("services.retrieval.pgvector_store._get_pool", return_value=mock_pool), \
         patch("services.retrieval.pgvector_store.register_vector"):
        from services.retrieval.pgvector_store import similarity_search
        results = similarity_search([0.1] * 384, k=5)
        assert len(results) == 5


# Test that similarity_search results contain required fields
def test_similarity_search_result_shape():
    rows = [{"chunk_text": "Diego built BluHorizon", "source": "resume.pdf", "distance": 0.08}]
    mock_pool, _, _ = _make_mock_pool(fetchall=rows)
    with patch("services.retrieval.pgvector_store._get_pool", return_value=mock_pool), \
         patch("services.retrieval.pgvector_store.register_vector"):
        from services.retrieval.pgvector_store import similarity_search
        results = similarity_search([0.1] * 384, k=1)
        assert "chunk_text" in results[0]
        assert "source" in results[0]
        assert "distance" in results[0]


# Test that similarity_search results are ordered by distance ascending
def test_similarity_search_ordered_by_distance():
    rows = [
        {"chunk_text": "closest", "source": "a.pdf", "distance": 0.05},
        {"chunk_text": "further", "source": "b.pdf", "distance": 0.20},
        {"chunk_text": "furthest", "source": "c.pdf", "distance": 0.45},
    ]
    mock_pool, _, _ = _make_mock_pool(fetchall=rows)
    with patch("services.retrieval.pgvector_store._get_pool", return_value=mock_pool), \
         patch("services.retrieval.pgvector_store.register_vector"):
        from services.retrieval.pgvector_store import similarity_search
        results = similarity_search([0.1] * 384, k=3)
        distances = [r["distance"] for r in results]
        assert distances == sorted(distances)


# Integration placeholder — requires real DB connection
def test_store_then_retrieve_integration():
    pytest.skip("requires live database — run in integration test suite")
