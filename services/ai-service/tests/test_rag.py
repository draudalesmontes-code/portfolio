import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


# Test that POST /ingest with a valid text file returns 200 and document_id
def test_ingest_valid_file_returns_200():
    pass


# Test that /ingest stores the document and chunks in the database
def test_ingest_persists_to_database():
    pass


# Test that /ingest creates the correct number of chunks for a known input
def test_ingest_creates_correct_chunk_count():
    pass


# Test that /ingest rejects unsupported file types with 400
def test_ingest_rejects_unsupported_file_type():
    pass


# Test that /ingest is protected and rejects unauthenticated requests with 401
def test_ingest_requires_authentication():
    pass


# Test that re-ingesting the same file creates a new document without duplicating chunks
def test_ingest_idempotent_creates_new_document():
    pass
