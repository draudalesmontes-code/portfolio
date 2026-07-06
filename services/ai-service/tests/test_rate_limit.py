import json
import pytest
from unittest.mock import MagicMock, AsyncMock
from fastapi import Request
from fastapi.testclient import TestClient
from middleware.rate_limit import is_byok_request, rate_limit_handler, GUEST_LIMIT
from slowapi.errors import RateLimitExceeded
from main import app

client = TestClient(app, raise_server_exceptions=False)


def _mock_request(api_key: str | None = None) -> MagicMock:
    mock = MagicMock()
    mock.headers = {"X-Api-Key": api_key} if api_key else {}
    return mock


# Test that a request with no X-Api-Key header is NOT byok
def test_is_byok_returns_false_without_api_key():
    request = _mock_request()
    assert is_byok_request(request) is False


# Test that a request with X-Api-Key header IS byok
def test_is_byok_returns_true_with_api_key():
    request = _mock_request(api_key="sk-test-key")
    assert is_byok_request(request) is True


# Test that an empty X-Api-Key header is falsy (still treated as guest)
def test_is_byok_returns_false_for_empty_api_key():
    request = _mock_request(api_key="")
    assert is_byok_request(request) is False


# Test that rate_limit_handler returns a JSONResponse with status 429
@pytest.mark.asyncio
async def test_rate_limit_handler_returns_429():
    mock_request = MagicMock()
    mock_exc = MagicMock(spec=RateLimitExceeded)
    response = await rate_limit_handler(mock_request, mock_exc)
    assert response.status_code == 429


# Test that rate_limit_handler response body contains a detail key
@pytest.mark.asyncio
async def test_rate_limit_handler_body_has_detail():
    mock_request = MagicMock()
    mock_exc = MagicMock(spec=RateLimitExceeded)
    response = await rate_limit_handler(mock_request, mock_exc)
    body = json.loads(response.body)
    assert "detail" in body


# Test that the guest limit constant is a valid rate-limit string
def test_guest_limit_is_valid_string():
    assert "/" in GUEST_LIMIT
    count, period = GUEST_LIMIT.split("/")
    assert int(count) > 0
    assert period in ("second", "minute", "hour", "day")
