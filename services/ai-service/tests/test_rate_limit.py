import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


# Test that a guest request under the limit returns 200
def test_guest_request_under_limit_allowed():
    pass


# Test that a guest request over the limit returns 429
def test_guest_request_over_limit_blocked():
    pass


# Test that a BYOK request is never blocked by the rate limiter
def test_byok_request_bypasses_rate_limit():
    pass


# Test that a logged-in user has a higher limit than a guest
def test_logged_in_user_has_higher_limit():
    pass


# Test that the rate limit counter resets after the time window expires
def test_rate_limit_resets_after_window():
    pass
