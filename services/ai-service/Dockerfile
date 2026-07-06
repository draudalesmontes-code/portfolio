FROM python:3.12-slim

WORKDIR /ai-services

COPY requirements.txt .

RUN pip install -r requirements.txt

RUN python -c "from fastembed import TextEmbedding; list(TextEmbedding('sentence-transformers/all-MiniLM-L6-v2').embed(['warmup']))"

COPY .  .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
