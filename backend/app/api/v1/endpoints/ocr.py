import os
import io
import json
import pytesseract
from PIL import Image, ImageEnhance, ImageOps
from rapidfuzz import process, fuzz
from typing import List, Dict, Any

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.medicine import MedicineBrand, ActiveIngredient
from app.models.interaction import DrugInteraction
from app.services.ai_fallback_service import resolve_and_learn_from_ocr
from app.api.v1.endpoints.history import log_medicine_to_history

# Configure Tesseract binary path for Windows
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

router = APIRouter(prefix="/api/v1/prescription", tags=["Prescription & OCR"])


def preprocess_image(image_bytes: bytes) -> Image.Image:
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != "RGB":
        image = image.convert("RGB")
    gray = ImageOps.grayscale(image)
    enhancer = ImageEnhance.Contrast(gray)
    return enhancer.enhance(2.0)


def match_brands_from_lines(raw_lines: List[str], db: Session) -> Dict[int, MedicineBrand]:
    all_brands = db.query(MedicineBrand).all()
    brand_map = {b.brand_name.lower(): b for b in all_brands}
    brand_names = list(brand_map.keys())
    matched_brands: Dict[int, MedicineBrand] = {}

    if not brand_names:
        return matched_brands

    for line in raw_lines:
        cleaned = line.strip().lower()
        if len(cleaned) < 3:
            continue
        for b_name, b_obj in brand_map.items():
            if b_name in cleaned or cleaned in b_name:
                matched_brands[b_obj.id] = b_obj
        best_match = process.extractOne(cleaned, brand_names, scorer=fuzz.partial_ratio, score_cutoff=80)
        if best_match:
            matched_obj = brand_map[best_match[0]]
            matched_brands[matched_obj.id] = matched_obj

    return matched_brands


@router.post("/upload")
async def upload_and_analyze_prescription(
    file: UploadFile = File(...),
    existing_ingredients: str = Form("[]"),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.pdf')):
        raise HTTPException(status_code=400, detail="Invalid file format.")

    try:
        contents = await file.read()
        processed_img = preprocess_image(contents)

        extracted_text = pytesseract.image_to_string(processed_img)
        raw_lines = [line.strip() for line in extracted_text.split("\n") if line.strip()]

        # 1. Resolve brands against local DB
        matched_brands = match_brands_from_lines(raw_lines, db)

        # 2. AI Auto-Learning Fallback if no brands matched OR any matched brand has no linked ingredients
        needs_ai_fallback = (not matched_brands) or any(len(b.ingredients) == 0 for b in matched_brands.values())

        if needs_ai_fallback and extracted_text.strip():
            try:
                current_ings = json.loads(existing_ingredients)
            except Exception:
                current_ings = []

            resolve_and_learn_from_ocr(
                raw_ocr_text=extracted_text,
                existing_patient_ingredients=current_ings,
                db=db
            )
            db.expire_all()
            matched_brands = match_brands_from_lines(raw_lines, db)

        matched_list = list(matched_brands.values())
        active_ingredients_map = {}
        detected_summary = []

        for brand in matched_list:
            brand_ings = [ing.name for ing in brand.ingredients]
            if not brand_ings and brand.generic_name:
                brand_ings = [brand.generic_name]

            detected_summary.append({
                "brand_name": brand.brand_name,
                "generic_name": brand.generic_name,
                "strength": brand.strength,
                "active_ingredients": brand_ings
            })

            # Automatically record scanned medicine in user history
            log_medicine_to_history(
                db=db,
                brand_name=brand.brand_name,
                generic_name=brand.generic_name,
                strength=brand.strength,
                active_ingredients=brand_ings,
                source_action="Prescription Scan",
                notes=f"File: {file.filename}"
            )

            for ing in brand.ingredients:
                active_ingredients_map[ing.id] = ing

        resolved_ings = list(active_ingredients_map.values())

        # 3. Interaction check logic
        interactions = []
        ing_ids = [ing.id for ing in resolved_ings]
        for i in range(len(ing_ids)):
            for j in range(i + 1, len(ing_ids)):
                id_a = min(ing_ids[i], ing_ids[j])
                id_b = max(ing_ids[i], ing_ids[j])
                record = db.query(DrugInteraction).filter_by(ingredient_a_id=id_a, ingredient_b_id=id_b).first()
                if record:
                    ing_a = db.query(ActiveIngredient).filter_by(id=id_a).first()
                    ing_b = db.query(ActiveIngredient).filter_by(id=id_b).first()
                    interactions.append({
                        "ingredient_a": ing_a.name if ing_a else f"ID {id_a}",
                        "ingredient_b": ing_b.name if ing_b else f"ID {id_b}",
                        "severity": record.severity,
                        "interaction_description": record.interaction_description,
                        "clinical_effect": record.clinical_effect,
                        "management_information": record.management_information
                    })

        has_critical = any(item["severity"].lower() in ["major", "severe", "critical"] for item in interactions)
        has_moderate = any(item["severity"].lower() in ["moderate", "warning"] for item in interactions)

        if has_critical:
            safety_status = "DANGER: Serious interaction detected."
        elif has_moderate:
            safety_status = "WARNING: Moderate interaction detected."
        elif interactions:
            safety_status = "INFO: Minor interaction noted."
        else:
            safety_status = "SAFE: No known hazardous interactions found."

        return {
            "filename": file.filename,
            "status": "success",
            "safety_status": safety_status,
            "raw_ocr_lines": raw_lines,
            "detected_medicines": detected_summary,
            "resolved_active_ingredients": [ing.name for ing in resolved_ings],
            "total_interactions_found": len(interactions),
            "interactions": interactions,
            "disclaimer": "MedSafe India clinical decision support tool. Always consult a physician."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing error: {str(e)}")