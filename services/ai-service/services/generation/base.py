from abc import ABC, abstractmethod

class BaseGenerator(ABC):
    @abstractmethod
    def generate(self, messages:list[dict]) -> str:
        """
        Takes a conversation + context as a list of messages and returns
        the generated answer as a string.

        messages format follows the industry standard:
        [
            {"role": "system",    "content": "You are..."},
            {"role": "user",      "content": "What projects..."},
            {"role": "assistant", "content": "Diego worked on..."},
            {"role": "user",      "content": "Tell me more"},
        ]
        """


    @abstractmethod
    def stream(self, messages: list[dict]):
        """
        Same as generate() but yields tokens as they are produced
        instead of waiting for the full response.
        Used by chat.py to stream responses to the frontend.
        """
