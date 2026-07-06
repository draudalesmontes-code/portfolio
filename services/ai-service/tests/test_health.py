from fastapi.testclient import TestClient

from main import app


client = TestClient(app, raise_server_exceptions=False)


def test_public_ai_health_endpoint() -> None:
    response = client.get("/ai/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root_health_endpoint_remains_available() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
