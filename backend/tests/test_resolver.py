from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_exact_brand_resolution():
    response = client.get("/api/v1/resolver?q=Crocin 650")
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates"] > 0
    top = data["candidates"][0]
    assert top["brand"] == "Crocin 650"
    assert top["match_confidence"] == 1.0
    assert top["match_type"] == "exact_brand"

def test_capitalization_differences():
    response = client.get("/api/v1/resolver?q=cRoCiN 650")
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates"] > 0
    assert data["candidates"][0]["brand"] == "Crocin 650"

def test_spelling_errors():
    # Typo: "crocn" -> Crocin 650 / 500
    response = client.get("/api/v1/resolver?q=crocn")
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates"] > 0
    assert "Crocin" in data["candidates"][0]["brand"]

def test_combination_medicines():
    response = client.get("/api/v1/resolver?q=Pan-D")
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates"] > 0
    top = data["candidates"][0]
    assert top["brand"] == "Pan-D"
    assert "Pantoprazole" in top["active_ingredients"]
    assert "Domperidone" in top["active_ingredients"]

def test_multiple_strengths():
    # Querying generic "Paracetamol" returns multiple strengths (Crocin 500 and Crocin 650)
    response = client.get("/api/v1/resolver?q=Paracetamol")
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates"] >= 2
    strengths = {c["strength"] for c in data["candidates"]}
    assert "500mg" in strengths
    assert "650mg" in strengths
    assert data["requires_confirmation"] is True

def test_ambiguous_names():
    response = client.get("/api/v1/resolver?q=Crocin")
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates"] >= 2
    assert data["requires_confirmation"] is True

def test_unknown_medicines():
    # Unknown medicine name should return zero candidates (never invent)
    response = client.get("/api/v1/resolver?q=xyzabc999unknown")
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates"] == 0
    assert len(data["candidates"]) == 0
    assert data["requires_confirmation"] is False