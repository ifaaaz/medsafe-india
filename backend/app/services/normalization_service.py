import re
from sqlalchemy.orm import Session
from app.models.ingredient import IngredientSynonym, CanonicalIngredient

def clean_string(raw_text: str) -> str:
    """Standardizes capitalization and whitespace deterministically."""
    if not raw_text:
        return ""
    # Lowercase, strip outer whitespace, collapse internal multiple spaces
    normalized = raw_text.lower().strip()
    normalized = re.sub(r'\s+', ' ', normalized)
    # Remove common trailing strengths/salts for raw matching if needed
    normalized = re.sub(r'\b(ip|bp|usp|tablet|capsule|mg|ml|g)\b', '', normalized).strip()
    return normalized

def normalize_ingredient(db: Session, raw_input: str) -> dict:
    """
    Normalizes a raw ingredient string to a Canonical Ingredient with full traceability.
    Architecture: Raw -> Normalization -> Canonical Ingredient -> Ingredient ID
    """
    cleaned_raw = clean_string(raw_input)
    
    trace_info = {
        "raw_input": raw_input,
        "cleaned_key": cleaned_raw,
        "matched_method": None,
        "matched_synonym": None,
        "canonical_id": None,
        "canonical_name": None,
        "is_verified": False
    }

    if not cleaned_raw:
        return {**trace_info, "matched_method": "empty_input"}

    # 1. Check synonym table for exact match on cleaned string
    synonym_match = db.query(IngredientSynonym).filter(
        IngredientSynonym.synonym_text == cleaned_raw
    ).first()

    if synonym_match:
        canonical = synonym_match.canonical_ingredient
        trace_info.update({
            "matched_method": "synonym_table_exact",
            "matched_synonym": synonym_match.synonym_text,
            "canonical_id": canonical.id,
            "canonical_name": canonical.name,
            "is_verified": synonym_match.is_verified
        })
        return trace_info

    # 2. Fallback: Check if canonical ingredient itself matches directly
    canonical_match = db.query(CanonicalIngredient).filter(
        CanonicalIngredient.name.ilike(cleaned_raw)
    ).first()

    if canonical_match:
        trace_info.update({
            "matched_method": "canonical_direct_match",
            "matched_synonym": cleaned_raw,
            "canonical_id": canonical_match.id,
            "canonical_name": canonical_match.name,
            "is_verified": True
        })
        return trace_info

    # 3. Unresolved fallback
    trace_info.update({
        "matched_method": "unresolved_fallback",
        "canonical_name": raw_input.title(),
        "canonical_id": None
    })
    return trace_info