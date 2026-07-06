import json
import redis
from uuid import uuid4
from config import settings

_redis = redis.Redis.from_url(settings.redis_url, decode_responses=True)

SESSION_TTL = 1800  # 30 minutes in seconds


def get_history(session_id: str | None) -> list[dict]:
    if not session_id:
        return []
    data = _redis.get(f"session:{session_id}")
    if data is None:
        return []
    return json.loads(data)


def save_history(session_id: str, messages: list[dict]) -> None:
    _redis.set(f"session:{session_id}", json.dumps(messages), ex=SESSION_TTL)


def generate_session_id() -> str:
    return str(uuid4())



