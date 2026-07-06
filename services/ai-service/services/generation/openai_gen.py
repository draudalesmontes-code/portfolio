from openai import OpenAI
from services.generation.base import BaseGenerator
from config import settings


class OpenAIGenerator(BaseGenerator):

    def __init__(self, api_key: str):
        self._client = OpenAI(api_key=api_key)

    def generate(self, messages: list[dict]) -> str:
        response = self._client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
        )
        return response.choices[0].message.content

    def stream(self, messages: list[dict]):
        stream = self._client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            stream=True,
        )
        for chunk in stream:
            yield chunk.choices[0].delta.content or ""
