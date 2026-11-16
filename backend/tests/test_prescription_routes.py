from fastapi.testclient import TestClient
from app.main import app


def test_prescription_upload_route_is_registered():
    response = TestClient(app).post("/api/v1/prescription/upload")

    assert response.status_code == 422
