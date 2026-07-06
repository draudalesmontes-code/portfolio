from unittest.mock import patch, MagicMock
from services.embedding.base import BaseEmbedder


def _mock_encode(vector: list[float]):
    """Return a mock array whose .tolist() gives the supplied vector."""
    arr = MagicMock()
    arr.tolist.return_value = vector
    return arr


# Test that embed() returns a list of exactly 384 floats
def test_embed_returns_384_dimensions():
    with patch("services.embedding.base._model") as mock_model:
        mock_model.encode.return_value = _mock_encode([0.0] * 384)
        embedder = BaseEmbedder()
        result = embedder.embed("test text")
        assert isinstance(result, list)
        assert len(result) == 384


# Test that embed_batch() returns one vector per input text
def test_embed_batch_returns_correct_count():
    batch_result = MagicMock()
    batch_result.tolist.return_value = [[0.0] * 384] * 3
    with patch("services.embedding.base._model") as mock_model:
        mock_model.encode.return_value = batch_result
        embedder = BaseEmbedder()
        result = embedder.embed_batch(["text one", "text two", "text three"])
        assert len(result) == 3


# Test that every vector in embed_batch has 384 dimensions
def test_embed_batch_vectors_are_384_dimensions():
    batch_result = MagicMock()
    batch_result.tolist.return_value = [[0.0] * 384, [0.0] * 384]
    with patch("services.embedding.base._model") as mock_model:
        mock_model.encode.return_value = batch_result
        embedder = BaseEmbedder()
        result = embedder.embed_batch(["hello", "world"])
        for vector in result:
            assert len(vector) == 384


# Test that the same text always produces the same embedding (deterministic)
def test_embed_is_deterministic():
    fixed = [0.1] * 384
    with patch("services.embedding.base._model") as mock_model:
        mock_model.encode.return_value = _mock_encode(fixed)
        embedder = BaseEmbedder()
        result1 = embedder.embed("same text")
        result2 = embedder.embed("same text")
        assert result1 == result2


# Test that different texts produce different embeddings
def test_different_texts_produce_different_embeddings():
    arr1 = _mock_encode([0.1] * 384)
    arr2 = _mock_encode([0.9] * 384)
    with patch("services.embedding.base._model") as mock_model:
        mock_model.encode.side_effect = [arr1, arr2]
        embedder = BaseEmbedder()
        result1 = embedder.embed("Diego built BluHorizon")
        result2 = embedder.embed("What is a CPU")
        assert result1 != result2


# Test that embed_batch on an empty list returns an empty list
def test_embed_batch_empty_list():
    batch_result = MagicMock()
    batch_result.tolist.return_value = []
    with patch("services.embedding.base._model") as mock_model:
        mock_model.encode.return_value = batch_result
        embedder = BaseEmbedder()
        result = embedder.embed_batch([])
        assert result == []
