import json
from typing import Optional

from fastapi import Depends, APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from dependencies import get_current_user
from middleware.rate_limit import limiter, GUEST_LIMIT, is_byok_request
from services.generation.factory import get_generator
from services.embedding.base import BaseEmbedder
from services.retrieval.pgvector_store import similarity_search
from services.session.redis_store import get_history, save_history, generate_session_id

router = APIRouter()

_embedder = BaseEmbedder()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    provider: str = "groq"
    api_key: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    session_id: str
    citations: list[dict]


@router.post("/chat")
@limiter.limit(GUEST_LIMIT, exempt_when=is_byok_request)
async def chat(request: Request, body: ChatRequest, user_id: Optional[int] = Depends(get_current_user)):
    try:
        history = get_history(body.session_id)
        query_vector = _embedder.embed(body.message)
        chunks = similarity_search(query_vector, k=5)

        context = "\n\n".join(chunk["chunk_text"] for chunk in chunks)
        messages = [
            {
                "role": "system",
                "content": f"""You are an AI assistant for Diego Raudales's portfolio.
Answer questions ONLY about Diego using the context below.
If the answer is not in the context, say you don't know and suggest
they send a message via the feedback form. Never make up information.

CONTEXT:
{context}"""
            },
            *history,
            {"role": "user", "content": body.message},
        ]
        generator = get_generator(body.provider, body.api_key)
        session = body.session_id or generate_session_id()

        async def generate_and_save():
            full_answer = ""
            for token in generator.stream(messages):
                full_answer += token
                yield token
            save_history(session, history + [
                {"role": "user",      "content": body.message},
                {"role": "assistant", "content": full_answer},
            ])

        return StreamingResponse(
            generate_and_save(),
            media_type="text/plain",
            headers={"X-Session-Id": session, "X-Citations": json.dumps(chunks)},
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
