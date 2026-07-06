import anthropic
from services.generation.base import BaseGenerator


class ClaudeGenerator(BaseGenerator):

    def __init__(self, api_key: str):
        self._client = anthropic.Anthropic(api_key=api_key)

    def generate(self, messages: list[dict]) -> str:
        system = next((m["content"] for m in messages if m["role"] == "system"), "")
        user_messages = [m for m in messages if m["role"] != "system"]
        response = self._client.messages.create(
            model="claude-opus-4-8",
            max_tokens=1024,
            system=system,
            messages=user_messages,
        )
        return response.content[0].text

    def stream(self, messages: list[dict]):
        system = next((m["content"] for m in messages if m["role"] == "system"), "")
        user_messages = [m for m in messages if m["role"] != "system"]
        with self._client.messages.stream(
            model="claude-opus-4-8",
            max_tokens=1024,
            system=system,
            messages=user_messages,
        ) as s:
            for text in s.text_stream:
                yield text
