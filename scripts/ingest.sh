#!/bin/bash
# Run this after `docker-compose up` to load Diego's content into the RAG knowledge base.
# Add your text files to scripts/data/ then run: bash scripts/ingest.sh

BASE="http://localhost/ai"

echo "Ingesting resume..."
curl -s -X POST $BASE/ingest \
  -F "file=@scripts/data/resume.txt" \
  -F "title=Resume" \
  -F "source=resume.txt" | python3 -m json.tool

echo "Ingesting projects..."
curl -s -X POST $BASE/ingest \
  -F "file=@scripts/data/projects.txt" \
  -F "title=Projects" \
  -F "source=projects.txt" | python3 -m json.tool

echo "Ingesting about..."
curl -s -X POST $BASE/ingest \
  -F "file=@scripts/data/about.txt" \
  -F "title=About Diego" \
  -F "source=about.txt" | python3 -m json.tool

echo "Done."
