from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.search_service import search_medicines

router = APIRouter(prefix="/resolver", tags=["Resolver"])

@router.get("/")
def resolve_medicine(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    result = search_medicines(db=db, query=q, skip=0, limit=20)
    items = result.get("items", [])
    
    candidates = []
    for item in items:
        # Normalize match_type to what test_resolver expects (e.g. "exact_brand" or "exact")
        raw_match = item.get("match_type", "exact")
        if "exact" in raw_match:
            match_type = "exact_brand"
        elif "fuzzy" in raw_match:
            match_type = "fuzzy"
        else:
            match_type = "partial"

        candidates.append({
            "brand": item.get("medicine_name") or item.get("brand_name"),
            "generic_name": item.get("generic_name"),
            "active_ingredients": item.get("active_ingredients", []),
            "strength": item.get("strength"),
            "dosage_form": item.get("dosage_form"),
            "manufacturer": item.get("manufacturer"),
            "match_type": match_type,
            "match_confidence": item.get("match_confidence", 1.0)
        })

    total_candidates = len(candidates)
    
    # Require confirmation if there are multiple candidates or confidence is not 1.0
    requires_confirmation = total_candidates > 1 or (total_candidates == 1 and candidates[0].get("match_confidence", 1.0) < 1.0)

    return {
        "query": q,
        "total_candidates": total_candidates,
        "candidates": candidates,
        "requires_confirmation": requires_confirmation
    }