import json
from unittest.mock import patch

from services.session import redis_store


def test_get_history_returns_empty_list_when_redis_fails():
    with patch.object(
        redis_store._redis,
        "get",
        side_effect=Exception("invalid username-password pair"),
    ):
        assert redis_store.get_history("session-id") == []


def test_save_history_does_not_raise_when_redis_fails():
    with patch.object(
        redis_store._redis,
        "set",
        side_effect=Exception("invalid username-password pair"),
    ):
        redis_store.save_history(
            "session-id",
            [{"role": "user", "content": "hello"}],
        )


def test_get_history_returns_saved_json_messages():
    messages = [{"role": "user", "content": "hello"}]
    with patch.object(
        redis_store._redis,
        "get",
        return_value=json.dumps(messages),
    ):
        assert redis_store.get_history("session-id") == messages
