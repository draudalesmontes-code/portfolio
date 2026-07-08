from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse

from config import settings

limiter = Limiter(key_func=get_remote_address)

GUEST_LIMIT = "10/minute"


def is_byok_request(request: Request) -> bool:
    """Return True when the caller supplies their own API key (exempt from rate limiting)."""
    return settings.byok_enabled and bool(request.headers.get("X-Api-Key"))


async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    # FastAPI calls this automatically when RateLimitExceeded is raised
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Provide your own API key for unlimited access."},
    )
