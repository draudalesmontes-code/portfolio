import json
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app

client = TestClient(app, raise_server_exceptions=False)


# Test that POST /ai/chat with a valid message returns 200
def test_chat_returns_200():
    with patch("routers.chat.get_history", return_value=[]), \
         patch("routers.chat._embedder") as mock_embedder, \
         patch("routers.chat.similarity_search", return_value=[]), \
         patch("routers.chat.get_generator") as mock_factory, \
         patch("routers.chat.save_history"):
        mock_embedder.embed.return_value = [0.1] * 384
        mock_gen = MagicMock()
        mock_gen.stream.return_value = iter(["Hello", " Diego"])
        mock_factory.return_value = mock_gen

        response = client.post("/ai/chat", json={"message": "Who is Diego?"})
        assert response.status_code == 200


# Test that first request with no session_id returns a new X-Session-Id header
def test_chat_creates_session_id_for_guest():
    with patch("routers.chat.get_history", return_value=[]), \
         patch("routers.chat._embedder") as mock_embedder, \
         patch("routers.chat.similarity_search", return_value=[]), \
         patch("routers.chat.get_generator") as mock_factory, \
         patch("routers.chat.save_history"), \
         patch("routers.chat.generate_session_id", return_value="new-session-abc"):
        mock_embedder.embed.return_value = [0.1] * 384
        mock_gen = MagicMock()
        mock_gen.stream.return_value = iter(["Hello"])
        mock_factory.return_value = mock_gen

        response = client.post("/ai/chat", json={"message": "Hi"})
        assert response.headers.get("x-session-id") == "new-session-abc"


# Test that sending an existing session_id loads prior conversation history
def test_chat_loads_existing_session_history():
    prior_history = [
        {"role": "user", "content": "Who is Diego?"},
        {"role": "assistant", "content": "Diego is a software engineer."},
    ]
    with patch("routers.chat.get_history", return_value=prior_history) as mock_get, \
         patch("routers.chat._embedder") as mock_embedder, \
         patch("routers.chat.similarity_search", return_value=[]), \
         patch("routers.chat.get_generator") as mock_factory, \
         patch("routers.chat.save_history"):
        mock_embedder.embed.return_value = [0.1] * 384
        mock_gen = MagicMock()
        mock_gen.stream.return_value = iter(["He also built BluHorizon"])
        mock_factory.return_value = mock_gen

        client.post("/ai/chat", json={"message": "Tell me more", "session_id": "abc123"})
        mock_get.assert_called_once_with("abc123")


# Test that providing a provider + api_key calls get_generator with both args
def test_chat_uses_byok_when_api_key_provided():
    with patch("routers.chat.get_history", return_value=[]), \
         patch("routers.chat._embedder") as mock_embedder, \
         patch("routers.chat.similarity_search", return_value=[]), \
         patch("routers.chat.get_generator") as mock_factory, \
         patch("routers.chat.save_history"):
        mock_embedder.embed.return_value = [0.1] * 384
        mock_gen = MagicMock()
        mock_gen.stream.return_value = iter(["Answer"])
        mock_factory.return_value = mock_gen

        client.post("/ai/chat", json={
            "message": "Hi",
            "provider": "claude",
            "api_key": "sk-test-key"
        })
        mock_factory.assert_called_once_with("claude", "sk-test-key")


# Test that similarity_search results are forwarded as X-Citations header
def test_chat_returns_citations_in_headers():
    chunks = [{"chunk_text": "Diego built BluHorizon", "source": "resume.pdf", "distance": 0.1}]
    with patch("routers.chat.get_history", return_value=[]), \
         patch("routers.chat._embedder") as mock_embedder, \
         patch("routers.chat.similarity_search", return_value=chunks), \
         patch("routers.chat.get_generator") as mock_factory, \
         patch("routers.chat.save_history"):
        mock_embedder.embed.return_value = [0.1] * 384
        mock_gen = MagicMock()
        mock_gen.stream.return_value = iter(["Answer"])
        mock_factory.return_value = mock_gen

        response = client.post("/ai/chat", json={"message": "Hi"})
        header = response.headers.get("x-citations")
        assert header is not None
        citations = json.loads(header)
        assert citations[0]["source"] == "resume.pdf"


# Test that the full streamed response body is the concatenated token stream
def test_chat_streams_full_text():
    tokens = ["Diego ", "built ", "BluHorizon"]
    with patch("routers.chat.get_history", return_value=[]), \
         patch("routers.chat._embedder") as mock_embedder, \
         patch("routers.chat.similarity_search", return_value=[]), \
         patch("routers.chat.get_generator") as mock_factory, \
         patch("routers.chat.save_history"):
        mock_embedder.embed.return_value = [0.1] * 384
        mock_gen = MagicMock()
        mock_gen.stream.return_value = iter(tokens)
        mock_factory.return_value = mock_gen

        response = client.post("/ai/chat", json={"message": "Tell me about Diego"})
        assert response.text == "Diego built BluHorizon"


# Test that save_history is called with full user + assistant turn appended
def test_chat_saves_full_history_after_stream():
    with patch("routers.chat.get_history", return_value=[]), \
         patch("routers.chat._embedder") as mock_embedder, \
         patch("routers.chat.similarity_search", return_value=[]), \
         patch("routers.chat.get_generator") as mock_factory, \
         patch("routers.chat.save_history") as mock_save, \
         patch("routers.chat.generate_session_id", return_value="session-xyz"):
        mock_embedder.embed.return_value = [0.1] * 384
        mock_gen = MagicMock()
        mock_gen.stream.return_value = iter(["Great developer"])
        mock_factory.return_value = mock_gen

        client.post("/ai/chat", json={"message": "Is Diego good?"})
        mock_save.assert_called_once()
        saved_history = mock_save.call_args[0][1]
        assert saved_history[-2]["role"] == "user"
        assert saved_history[-2]["content"] == "Is Diego good?"
        assert saved_history[-1]["role"] == "assistant"
        assert saved_history[-1]["content"] == "Great developer"
