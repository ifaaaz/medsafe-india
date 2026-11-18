import os
import re
from typing import List
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from google.genai.errors import APIError
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.medicine import MedicineBrand, ActiveIngredient
from app.services.search_service import search_medicines
from app.services.detail_service import get_medicine_by_id
from app.api.v1.endpoints.history import log_medicine_to_history

load_dotenv()

router = APIRouter(prefix="/medicines", tags=["Medicines"])

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(
    api_key=api_key,
    http_options={"api_version": "v1beta"}
) if api_key else None

# Each model has its own independent daily free-tier quota
FALLBACK_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
]


class MedicineUsesSchema(BaseModel):
    brand_name: str = Field(description="Standardized Indian brand or medicine name")
    generic_name: str = Field(description="Generic salt/composition name")
    strength: str = Field(description="Common strength, e.g., 650mg, or 'Standard'")
    dosage_form: str = Field(description="Tablet, Capsule, Syrup, Injection, etc.")
    active_ingredients: List[str] = Field(description="List of standardized INN active chemical ingredients")
    therapeutic_uses: str = Field(
        description="Clear, patient-friendly explanation of what medical conditions this medicine treats, how it works, and key precautions."
    )


def normalize_name(text: str) -> str:
    return re.sub(r'[^a-z0-9]', '', text.lower()) if text else ""


def generate_with_fallback(prompt: str) -> MedicineUsesSchema:
    if not client:
        raise RuntimeError("GEMINI_API_KEY is missing in environment variables.")

    last_error = None
    for model_name in FALLBACK_MODELS:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=MedicineUsesSchema,
                    temperature=0.1,
                ),
            )
            return MedicineUsesSchema.model_validate_json(response.text)
        except APIError as e:
            if e.code in (429, 404, 503):
                last_error = e
                continue
            raise
    raise last_error


@router.get("/search")
def search_endpoint(
    q: str = Query(..., min_length=1),
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    return search_medicines(db=db, query=q, skip=skip, limit=limit)


@router.get("/lookup")
def lookup_medicine_uses(
    q: str = Query(..., min_length=2, description="Medicine brand or generic name"),
    db: Session = Depends(get_db)
):
    search_term = q.strip()
    norm_query = normalize_name(search_term)

    # 1. Search PostgreSQL first
    db_brand = (
        db.query(MedicineBrand)
        .filter(
            (MedicineBrand.normalized_brand_name.contains(norm_query)) |
            (MedicineBrand.brand_name.ilike(f"%{search_term}%")) |
            (MedicineBrand.generic_name.ilike(f"%{search_term}%"))
        )
        .first()
    )

    # 2. Return immediately if already stored with therapeutic_uses
    if db_brand and db_brand.therapeutic_uses:
        ings = [ing.name for ing in db_brand.ingredients] or ([db_brand.generic_name] if db_brand.generic_name else [])
        
        log_medicine_to_history(
            db=db,
            brand_name=db_brand.brand_name,
            generic_name=db_brand.generic_name,
            strength=db_brand.strength,
            active_ingredients=ings,
            source_action="Medicine Lookup"
        )

        return {
            "brand_name": db_brand.brand_name,
            "generic_name": db_brand.generic_name,
            "strength": db_brand.strength,
            "dosage_form": db_brand.dosage_form,
            "active_ingredients": ings,
            "therapeutic_uses": db_brand.therapeutic_uses,
            "source": "Verified Local Database"
        }

    # 3. AI Fallback for unknown medicines or existing records missing uses
    prompt = f"""
    You are a clinical pharmacology assistant for Indian medications.
    A user searched for the medicine: "{search_term}".
    Provide its standardized Indian brand/medicine details, active chemical ingredients (using INN names like Paracetamol instead of Acetaminophen), and a clear, accurate summary of its therapeutic uses (what conditions it treats and key safety precautions; do NOT give personalized dosage prescriptions).
    """

    try:
        ai_data = generate_with_fallback(prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI lookup failed: {str(e)}")

    # 4. Persist to PostgreSQL so future searches resolve instantly
    if not db_brand:
        db_brand = db.query(MedicineBrand).filter_by(normalized_brand_name=normalize_name(ai_data.brand_name)).first()

    if not db_brand:
        db_brand = MedicineBrand(
            brand_name=ai_data.brand_name,
            normalized_brand_name=normalize_name(ai_data.brand_name),
            generic_name=ai_data.generic_name,
            strength=ai_data.strength,
            dosage_form=ai_data.dosage_form or "Tablet",
            therapeutic_uses=ai_data.therapeutic_uses,
            manufacturer="Auto-Indexed via Clinical AI"
        )
        db.add(db_brand)
        db.flush()
    else:
        db_brand.therapeutic_uses = ai_data.therapeutic_uses

    saved_ings = []
    for ing_name in ai_data.active_ingredients:
        clean_ing = ing_name.strip().title()
        db_ing = db.query(ActiveIngredient).filter_by(name=clean_ing).first()
        if not db_ing:
            db_ing = ActiveIngredient(name=clean_ing)
            db.add(db_ing)
            db.flush()
        if db_ing not in db_brand.ingredients:
            db_brand.ingredients.append(db_ing)
        saved_ings.append(clean_ing)

    db.commit()

    log_medicine_to_history(
        db=db,
        brand_name=db_brand.brand_name,
        generic_name=db_brand.generic_name,
        strength=db_brand.strength,
        active_ingredients=saved_ings,
        source_action="Medicine Lookup"
    )

    return {
        "brand_name": db_brand.brand_name,
        "generic_name": db_brand.generic_name,
        "strength": db_brand.strength,
        "dosage_form": db_brand.dosage_form,
        "active_ingredients": saved_ings,
        "therapeutic_uses": db_brand.therapeutic_uses,
        "source": "AI Auto-Indexed & Saved"
    }


@router.get("/{medicine_id}")
def medicine_detail_endpoint(
    medicine_id: int,
    db: Session = Depends(get_db)
):
    detail = get_medicine_by_id(db=db, medicine_id=medicine_id)
    if not detail:
        raise HTTPException(
            status_code=404, 
            detail="Medicine information unavailable in verified structured sources."
        )
    return detail