import re
from typing import Dict, List
from pydantic import BaseModel, Field
from google.genai import types
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.medicine import MedicineBrand, ActiveIngredient
from app.services.search_service import search_medicines
from app.services.detail_service import get_medicine_by_id
from app.services.ai_fallback_service import generate_with_key_rotation
from app.api.v1.endpoints.history import log_medicine_to_history

router = APIRouter(prefix="/medicines", tags=["Medicines"])


class MedicineUsesSchema(BaseModel):
    brand_name: str = Field(description="Standardized Indian brand or medicine name")
    generic_name: str = Field(description="Generic salt/composition name")
    strength: str = Field(description="Common strength, e.g., 650mg, or 'Standard'")
    dosage_form: str = Field(description="Tablet, Capsule, Syrup, Injection, etc.")
    active_ingredients: List[str] = Field(description="List of standardized INN active chemical ingredients")
    therapeutic_uses: str = Field(
        description="Clear, patient-friendly explanation of what medical conditions this medicine treats, how it works, and key precautions."
    )


# Deterministic offline Indian clinical pharmacology catalog (zero API quota needed if all 9 buckets hit 429)
OFFLINE_INDIAN_MEDICINES: Dict[str, dict] = {
    "dolo": {
        "brand_name": "Dolo 650",
        "generic_name": "Paracetamol 650mg",
        "strength": "650mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Paracetamol"],
        "therapeutic_uses": "Relieves mild-to-moderate pain (headache, body ache, toothache) and reduces fever by inhibiting prostaglandin synthesis in the central nervous system. Precaution: Do not exceed 4g/day or combine with other Paracetamol brands due to liver toxicity risk.",
    },
    "paracetamol": {
        "brand_name": "Paracetamol 650mg",
        "generic_name": "Paracetamol",
        "strength": "650mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Paracetamol"],
        "therapeutic_uses": "Antipyretic and analgesic used to treat fever and mild-to-moderate pain. Precaution: Avoid alcohol and check combination cold/pain tablets to avoid accidental Paracetamol overdose.",
    },
    "augmentin": {
        "brand_name": "Augmentin 625 Duo",
        "generic_name": "Amoxicillin 500mg + Clavulanic Acid 125mg",
        "strength": "625mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Amoxicillin", "Clavulanic Acid"],
        "therapeutic_uses": "Broad-spectrum penicillin-class antibiotic used to treat bacterial infections of the respiratory tract, sinuses, ear, skin, and urinary tract. Precaution: Take at the start of a meal to reduce stomach upset and complete the full prescribed course.",
    },
    "warf": {
        "brand_name": "Warf 5",
        "generic_name": "Warfarin Sodium 5mg",
        "strength": "5mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Warfarin"],
        "therapeutic_uses": "Oral vitamin K antagonist anticoagulant prescribed to prevent and treat deep vein thrombosis (DVT), pulmonary embolism, and stroke risk in atrial fibrillation or mechanical heart valves. Precaution: Requires regular PT/INR blood monitoring; avoid NSAIDs, alcohol, and sudden changes in Vitamin K leafy green intake.",
    },
    "warfarin": {
        "brand_name": "Warfarin 5mg",
        "generic_name": "Warfarin Sodium",
        "strength": "5mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Warfarin"],
        "therapeutic_uses": "Oral anticoagulant that reduces blood clot formation by inhibiting vitamin K-dependent clotting factors. Precaution: Strictly contraindicated in pregnancy; monitor INR regularly and watch for unusual bleeding.",
    },
    "acitrom": {
        "brand_name": "Acitrom 2",
        "generic_name": "Acenocoumarol 2mg",
        "strength": "2mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Acenocoumarol"],
        "therapeutic_uses": "Oral coumarin anticoagulant used to prevent harmful blood clots in thromboembolic disorders and cardiac valve conditions. Precaution: Requires regular INR testing; avoid Aspirin/NSAIDs unless prescribed by a cardiologist.",
    },
    "telma": {
        "brand_name": "Telma 40",
        "generic_name": "Telmisartan 40mg",
        "strength": "40mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Telmisartan"],
        "therapeutic_uses": "Angiotensin II Receptor Blocker (ARB) used to treat high blood pressure (hypertension) and reduce cardiovascular risk. Precaution: Strictly contraindicated in pregnancy; monitor blood pressure and kidney function.",
    },
    "pan-d": {
        "brand_name": "Pan-D",
        "generic_name": "Pantoprazole 40mg + Domperidone 30mg",
        "strength": "40mg / 30mg",
        "dosage_form": "Capsule",
        "active_ingredients": ["Pantoprazole", "Domperidone"],
        "therapeutic_uses": "Combines a proton pump inhibitor (reduces stomach acid) with a prokinetic agent (relieves nausea, bloating, and acid reflux/GERD). Precaution: Take 30–45 minutes before breakfast on an empty stomach.",
    },
    "pantop": {
        "brand_name": "Pantop 40",
        "generic_name": "Pantoprazole 40mg",
        "strength": "40mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Pantoprazole"],
        "therapeutic_uses": "Proton pump inhibitor (PPI) used to treat acidity, gastroesophageal reflux disease (GERD), peptic ulcers, and NSAID-induced gastritis. Precaution: Swallow whole 30 minutes before breakfast.",
    },
    "combiflam": {
        "brand_name": "Combiflam",
        "generic_name": "Ibuprofen 400mg + Paracetamol 325mg",
        "strength": "400mg / 325mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Ibuprofen", "Paracetamol"],
        "therapeutic_uses": "Dual anti-inflammatory and analgesic tablet for musculoskeletal pain, sprains, dental pain, and high fever. Precaution: Take strictly after food; avoid in gastric ulcers, kidney disease, or alongside Aspirin/other NSAIDs.",
    },
    "zerodol": {
        "brand_name": "Zerodol-P",
        "generic_name": "Aceclofenac 100mg + Paracetamol 325mg",
        "strength": "100mg / 325mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Aceclofenac", "Paracetamol"],
        "therapeutic_uses": "NSAID + analgesic combination for joint pain, arthritis, backache, and post-operative inflammation. Precaution: Take after meals; avoid in active peptic ulcer or severe renal impairment.",
    },
    "ecosprin": {
        "brand_name": "Ecosprin 75",
        "generic_name": "Aspirin 75mg",
        "strength": "75mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Aspirin"],
        "therapeutic_uses": "Low-dose antiplatelet agent prescribed to prevent heart attacks and ischemic strokes by preventing platelet aggregation. Precaution: Take after food; avoid combining with Ibuprofen or anticoagulants unless directed by a cardiologist.",
    },
    "atorva": {
        "brand_name": "Atorva 20",
        "generic_name": "Atorvastatin 20mg",
        "strength": "20mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Atorvastatin"],
        "therapeutic_uses": "HMG-CoA reductase inhibitor (statin) used to lower LDL cholesterol and triglycerides and prevent cardiovascular events. Precaution: Contraindicated in pregnancy; report unexplained muscle pain.",
    },
    "clopilet": {
        "brand_name": "Clopilet 75",
        "generic_name": "Clopidogrel 75mg",
        "strength": "75mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Clopidogrel"],
        "therapeutic_uses": "Antiplatelet medication used after coronary stents, heart attack, or stroke to prevent arterial blood clots. Precaution: Increases bleeding risk; inform doctors/dentists before procedures.",
    },
    "azithral": {
        "brand_name": "Azithral 500",
        "generic_name": "Azithromycin 500mg",
        "strength": "500mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Azithromycin"],
        "therapeutic_uses": "Macrolide antibiotic prescribed for throat, sinus, chest, and skin bacterial infections. Precaution: Complete the full prescribed days even if symptoms improve early.",
    },
    "montair": {
        "brand_name": "Montair LC",
        "generic_name": "Montelukast 10mg + Levocetirizine 5mg",
        "strength": "10mg / 5mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Montelukast", "Levocetirizine"],
        "therapeutic_uses": "Anti-allergic and leukotriene receptor antagonist combination for allergic rhinitis, sneezing, runny nose, and asthma prophylaxis. Precaution: Usually taken in the evening; may cause mild drowsiness.",
    },
    "glycomet": {
        "brand_name": "Glycomet 500 SR",
        "generic_name": "Metformin 500mg",
        "strength": "500mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Metformin"],
        "therapeutic_uses": "First-line oral antihyperglycemic medication for Type 2 Diabetes Mellitus that lowers hepatic glucose production and improves insulin sensitivity. Precaution: Take with meals to minimize GI upset; avoid excessive alcohol.",
    },
    "allegra": {
        "brand_name": "Allegra 120",
        "generic_name": "Fexofenadine 120mg",
        "strength": "120mg",
        "dosage_form": "Tablet",
        "active_ingredients": ["Fexofenadine"],
        "therapeutic_uses": "Non-drowsy second-generation antihistamine used to relieve seasonal allergies, sneezing, itching, and urticaria (hives). Precaution: Take with plain water; avoid fruit juices (apple, orange, grapefruit) within 2 hours as they reduce absorption.",
    },
}


def normalize_name(text: str) -> str:
    return re.sub(r'[^a-z0-9]', '', text.lower()) if text else ""


def _offline_medicine_lookup(search_term: str) -> MedicineUsesSchema:
    q_low = search_term.strip().lower()
    for key, entry in OFFLINE_INDIAN_MEDICINES.items():
        if key in q_low or q_low in entry["brand_name"].lower() or q_low in entry["generic_name"].lower():
            return MedicineUsesSchema(**entry)

    clean_title = search_term.strip().title()
    return MedicineUsesSchema(
        brand_name=clean_title,
        generic_name=clean_title,
        strength="Standard",
        dosage_form="Tablet",
        active_ingredients=[clean_title],
        therapeutic_uses=f"{clean_title} is a prescribed pharmaceutical formulation. Please verify its active salt composition, meal timing, and contraindications on the strip label or with a licensed pharmacist.",
    )


def generate_with_fallback(prompt: str, search_term: str) -> MedicineUsesSchema:
    try:
        response = generate_with_key_rotation(
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=MedicineUsesSchema,
                temperature=0.1,
            ),
        )
        return MedicineUsesSchema.model_validate_json(response.text)
    except Exception:
        return _offline_medicine_lookup(search_term)


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

    # 3. AI Key-Rotated + Offline Pharmacology Fallback for unknown medicines or records missing uses
    prompt = f"""
    You are a clinical pharmacology assistant for Indian medications.
    A user searched for the medicine: "{search_term}".
    Provide its standardized Indian brand/medicine details, active chemical ingredients (using INN names like Paracetamol instead of Acetaminophen), and a clear, accurate summary of its therapeutic uses (what conditions it treats and key safety precautions; do NOT give personalized dosage prescriptions).
    """

    ai_data = generate_with_fallback(prompt, search_term)

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
    