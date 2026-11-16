import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.medicine import MedicineBrand, ActiveIngredient
from app.services.duplicates import check_duplicate_ingredients

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    # Seed test data
    paracetamol = ActiveIngredient(name="Paracetamol")
    pantoprazole = ActiveIngredient(name="Pantoprazole")
    domperidone = ActiveIngredient(name="Domperidone")

    med1 = MedicineBrand(brand_name="Crocin 500", generic_name="Paracetamol", normalized_brand_name="crocin 500", manufacturer="GSK", dosage_form="Tablet", strength="500 mg")
    med1.ingredients.append(paracetamol)

    med2 = MedicineBrand(brand_name="Dolo 650", generic_name="Paracetamol", normalized_brand_name="dolo 650", manufacturer="Micro Labs", dosage_form="Tablet", strength="650 mg")
    med2.ingredients.append(paracetamol)

    med3 = MedicineBrand(brand_name="Pan-D", generic_name="Pantoprazole + Domperidone", normalized_brand_name="pan-d", manufacturer="Alkem", dosage_form="Capsule", strength="40mg/30mg")
    med3.ingredients.extend([pantoprazole, domperidone])

    med4 = MedicineBrand(brand_name="Pantocid 40", generic_name="Pantoprazole", normalized_brand_name="pantocid 40", manufacturer="Sun Pharma", dosage_form="Tablet", strength="40 mg")
    med4.ingredients.append(pantoprazole)

    session.add_all([med1, med2, med3, med4])
    session.commit()

    yield session
    session.close()

def test_different_brands_exact_duplicate(db_session):
    # Crocin (500mg) and Dolo (650mg) - both Paracetamol
    result = check_duplicate_ingredients(db_session, [1, 2])
    assert result["has_duplicates"] is True
    assert len(result["duplicate_findings"]) == 1
    assert result["duplicate_findings"][0]["ingredient_name"] == "Paracetamol"
    assert len(result["duplicate_findings"][0]["medicines"]) == 2

def test_different_strengths(db_session):
    # Verifies that different strengths of the same active ingredient are correctly detected as duplicates
    result = check_duplicate_ingredients(db_session, [1, 2])
    assert result["has_duplicates"] is True
    strengths = {m["strength"] for m in result["duplicate_findings"][0]["medicines"]}
    assert strengths == {"500 mg", "650 mg"}

def test_combination_medicines(db_session):
    # Pan-D (Pantoprazole + Domperidone) and Pantocid 40 (Pantoprazole)
    result = check_duplicate_ingredients(db_session, [3, 4])
    assert result["has_duplicates"] is True
    assert result["duplicate_findings"][0]["ingredient_name"] == "Pantoprazole"

def test_no_duplicates(db_session):
    # Crocin (Paracetamol) and Pantocid 40 (Pantoprazole) - distinct active ingredients
    result = check_duplicate_ingredients(db_session, [1, 4])
    assert result["has_duplicates"] is False
    assert len(result["duplicate_findings"]) == 0