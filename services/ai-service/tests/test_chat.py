import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


# Test that POST /chat with a valid message returns 200
def test_chat_returns_200():
    pass


# Test that first request with no session_id returns a new session_id in response
def test_chat_creates_session_id_for_guest():
    pass


# Test that sending an existing session_id loads prior conversation history
def test_chat_loads_existing_session_history():
    pass


# Test that providing an api_key switches to the Claude BYOK provider
def test_chat_uses_claude_when_api_key_provided():
    pass


# Test that response contains an answer and citations fields
def test_chat_response_shape():
    pass


# Test that exceeding the guest question cap returns 429
def test_chat_guest_cap_returns_429():
    pass
