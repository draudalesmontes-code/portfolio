from services.generation.groq_gen import GroqGenerator
from services.generation.openai_gen import OpenAIGenerator
from services.generation.claude import ClaudeGenerator
from services.generation.base import BaseGenerator
from fastapi import HTTPException


def get_generator(provider:str, api_key: str | None) -> BaseGenerator:
    if provider == "groq":
        return GroqGenerator()
    elif provider == "openai":
        if not api_key:
            raise HTTPException(status_code=400, detail="OpenAI provider requires an api_key")
        return OpenAIGenerator(api_key)
    elif provider == "claude":
        if not api_key:
            raise HTTPException(status_code=400, detail="Claude provider requires an api_key")
        return ClaudeGenerator(api_key)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
