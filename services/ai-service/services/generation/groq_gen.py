from groq import Groq
from services.generation.base import BaseGenerator
from config import settings


class GroqGenerator(BaseGenerator):

    def __init__(self):
        self._client = Groq(api_key=settings.groq_api_key)

    def generate(self, messages: list[dict]) -> str:
        response = self._client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
        )
        return response.choices[0].message.content

    def stream(self, messages: list[dict]):
        stream = self._client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            stream=True,
        )
        for chunk in stream:
            yield chunk.choices[0].delta.content or ""
