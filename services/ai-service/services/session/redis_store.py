import json
import redis
from uuid import uuid4
from config import settings

# Redis gives the chatbot short-term memory between requests. It is intentionally
# best-effort: if Redis is down or misconfigured, chat should still answer instead
# of failing the whole request.
_redis = redis.Redis.from_url(settings.redis_url, decode_responses=True)

SESSION_TTL = 1800  # 30 minutes in seconds


def get_history(session_id: str | None) -> list[dict]:
    """Return saved chat messages for a session, or an empty history fallback."""
    if not session_id:
        return []

    try:
        data = _redis.get(f"session:{session_id}")
    except Exception:
        return []

    if data is None:
        return []

    return json.loads(data)


def save_history(session_id: str, messages: list[dict]) -> None:
    """Persist chat messages without blocking the chatbot if Redis fails."""
    try:
        _redis.set(f"session:{session_id}", json.dumps(messages), ex=SESSION_TTL)
    except Exception:
        return


def generate_session_id() -> str:
    """Create an opaque browser session id for chat history lookup."""
    return str(uuid4())
