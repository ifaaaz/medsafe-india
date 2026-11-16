from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_search_exact_and_fuzzy():
    # Test exact query
    response = client.get("/api/v1/medicines/search?q=crocin")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    
    first_match = data["items"][0]
    assert "crocin" in first_match["medicine_name"].lower()
    assert first_match["match_confidence"] > 0.8

def test_search_typo_tolerance():
    # Test typo tolerance e.g., "crocn" instead of "crocin"
    response = client.get("/api/v1/medicines/search?q=crocn")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert data["items"][0]["match_type"].startswith("fuzzy")

def test_search_pagination():
    response = client.get("/api/v1/medicines/search?q=a&skip=0&limit=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) <= 1
    assert data["skip"] == 0
    assert data["limit"] == 1