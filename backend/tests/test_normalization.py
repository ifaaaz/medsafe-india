import pytest
from app.services.normalization_service import normalize_ingredient, clean_string
from app.models.ingredient import CanonicalIngredient, IngredientSynonym

def test_string_cleaning():
    assert clean_string("  ACETYLSALICYLIC   ACID  ") == "acetylsalicylic acid"
    assert clean_string("Paracetamol IP") == "paracetamol"

def test_normalization_with_synonyms(db_session):
    # Setup test canonical and synonym
    canonical = CanonicalIngredient(name="Acetylsalicylic Acid", description="Aspirin group")
    db_session.add(canonical)
    db_session.commit()

    synonym = IngredientSynonym(canonical_id=canonical.id, synonym_text="ecosprin", source="test")
    db_session.add(synonym)
    db_session.commit()

    # Test normalization trace
    result = normalize_ingredient(db_session, "  ECOSPRIN  ")
    
    assert result["canonical_id"] == canonical.id
    assert result["canonical_name"] == "Acetylsalicylic Acid"
    assert result["matched_method"] == "synonym_table_exact"
    assert result["is_verified"] is True