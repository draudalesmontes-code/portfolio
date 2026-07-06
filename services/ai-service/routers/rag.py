from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field
from services.retrieval.chunk import Chunks
from services.embedding.base import BaseEmbedder
from services.retrieval.pgvector_store import store_document

router = APIRouter()


_embedder = BaseEmbedder()
class IngestResponse(BaseModel):
    message: str = Field(..., json_schema_extra={"example": "File ingested successfully"})
    document_id: int
    chunk_count: int



@router.post("/ingest", response_model=IngestResponse)
async def ingest(
        file: UploadFile = File(...),
        title: str = Form(...),
        source: str = Form(...),
):
    try:
        file_bytes = await file.read()
        file_text = file_bytes.decode("utf-8")
        chunks = Chunks.chunk_text(file_text)
        embeddings = _embedder.embed_batch(chunks)
        document_id = store_document(title, source, chunks, embeddings)

        return IngestResponse(document_id=document_id, chunk_count=len(chunks), message="File ingested successfully")

    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded text")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Something went wrong during ingestion: {str(e)}")
