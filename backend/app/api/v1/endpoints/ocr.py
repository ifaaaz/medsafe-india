import os
import io
import json
import pytesseract
from PIL import Image, ImageEnhance, ImageOps
from rapidfuzz import process, fuzz
from typing import List, Dict
from pydantic import BaseModel, Field
from google.genai import types

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

from app.core.database import get_db, engine, SessionLocal
from app.models.medicine import MedicineBrand, ActiveIngredient
from app.models.interaction import DrugInteraction
from app.services.ai_fallback_service import (
    resolve_and_learn_from_ocr,
    generate_with_key_rotation,
)
from app.api.v1.endpoints.history import log_medicine_to_history
from app.api.v1.endpoints.interactions import (
    detect_duplicate_ingredients,
    analyze_interactions_with_ai,
)

# Configure Tesseract binary path for Windows
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

router = APIRouter(prefix="/api/v1/prescription", tags=["Prescription & OCR"])


class ExtractedRxItem(BaseModel):
    brand_name: str = Field(
        description="Medicine or brand name as written, e.g., Tab Aspirin 75mg"
    )
    generic_name: str = Field(
        description="Generic salt name, e.g., Aspirin"
    )
    strength: str = Field(
        description="Dosage strength, e.g., 75mg, 400mg, 150mg"
    )
    active_ingredients: List[str] = Field(
        description="Normalized INN active chemical salts"
    )


class PrescriptionVisionResult(BaseModel):
    medicines: List[ExtractedRxItem] = Field(default_factory=list)


def preprocess_image(image_bytes: bytes) -> Image.Image:
    image = Image.open(io.BytesIO(image_bytes))
    # Auto-orient phone camera EXIF rotation so sideways photos read accurately
    image = ImageOps.exif_transpose(image)
    if image.mode != "RGB":
        image = image.convert("RGB")

    # Downscale massive phone photos to 1400px max side for fast cloud inference
    max_dim = 1400
    if max(image.width, image.height) > max_dim:
        image.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

    return image


def extract_medicines_with_vision(image: Image.Image) -> List[ExtractedRxItem]:
    """Uses Gemini Multimodal Vision to read handwritten & printed prescriptions accurately."""
    try:
        prompt = (
            "You are a clinical pharmacist OCR assistant reading an Indian medical prescription. "
            "Extract EVERY prescribed medicine listed under Rx (ignore background watermarks or stamps). "
            "For each medicine, return its brand/medicine name, generic salt name, strength, "
            "and normalized INN active chemical ingredients."
        )
        response = generate_with_key_rotation(
            contents=[image, prompt],
            models=["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PrescriptionVisionResult,
                temperature=0.1,
            ),
        )
        parsed = PrescriptionVisionResult.model_validate_json(response.text)
        return parsed.medicines
    except Exception as e:
        print(f"[PrescriptionVision] Vision extraction fallback triggered: {e}")
        return []


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
        best_match = process.extractOne(
            cleaned, brand_names, scorer=fuzz.partial_ratio, score_cutoff=80
        )
        if best_match:
            matched_obj = brand_map[best_match[0]]
            matched_brands[matched_obj.id] = matched_obj

    return matched_brands


@router.post("/upload")
async def upload_and_analyze_prescription(
    file: UploadFile = File(...),
    existing_ingredients: str = Form("[]"),
    db: Session = Depends(get_db),
):
    if not file.filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".pdf")):
        raise HTTPException(status_code=400, detail="Invalid file format.")

    try:
        contents = await file.read()
        color_img = preprocess_image(contents)

        # 1. Run Multimodal Vision OCR first so handwritten prescriptions are read completely
        vision_items = extract_medicines_with_vision(color_img)

        # 2. Also run local Tesseract OCR as secondary/offline backup
        gray = ImageOps.grayscale(color_img)
        enhanced = ImageEnhance.Contrast(gray).enhance(2.0)
        try:
            extracted_text = pytesseract.image_to_string(enhanced)
        except Exception:
            extracted_text = ""

        raw_lines = [line.strip() for line in extracted_text.split("\n") if line.strip()]
        for item in vision_items:
            raw_lines.append(f"{item.brand_name} ({', '.join(item.active_ingredients)})")

        # 3. Ensure DB session is healthy (reconnect if Neon dropped idle socket)
        try:
            db.query(MedicineBrand).first()
        except OperationalError:
            db.rollback()
            db.close()
            engine.dispose()
            db = SessionLocal()

        matched_brands: Dict[int, MedicineBrand] = {}

        # 4. Sync every Vision-extracted medicine into PostgreSQL & collect its Brand + Ingredients
        for item in vision_items:
            clean_brand = item.brand_name.strip()
            norm_brand = "".join(c for c in clean_brand.lower() if c.isalnum())
            if not norm_brand:
                continue

            db_brand = (
                db.query(MedicineBrand)
                .filter(
                    (MedicineBrand.normalized_brand_name == norm_brand)
                    | (MedicineBrand.brand_name.ilike(f"%{clean_brand}%"))
                    | (MedicineBrand.generic_name.ilike(f"%{item.generic_name.strip()}%"))
                )
                .first()
            )
            if not db_brand:
                db_brand = MedicineBrand(
                    brand_name=clean_brand,
                    normalized_brand_name=norm_brand,
                    generic_name=item.generic_name.strip() or clean_brand,
                    strength=item.strength.strip() or "Standard",
                    dosage_form="Tablet",
                    manufacturer="Auto-Indexed via Prescription Vision",
                )
                db.add(db_brand)
                db.flush()

            for ing_name in item.active_ingredients:
                clean_ing = ing_name.strip().title()
                if not clean_ing:
                    continue
                db_ing = db.query(ActiveIngredient).filter_by(name=clean_ing).first()
                if not db_ing:
                    db_ing = ActiveIngredient(name=clean_ing)
                    db.add(db_ing)
                    db.flush()
                if db_ing not in db_brand.ingredients:
                    db_brand.ingredients.append(db_ing)

            db.commit()
            matched_brands[db_brand.id] = db_brand

        # 5. Fallback to Tesseract fuzzy matching if Vision returned nothing
        if not matched_brands and raw_lines:
            matched_brands.update(match_brands_from_lines(raw_lines, db))

        if not matched_brands and extracted_text.strip():
            try:
                current_ings = json.loads(existing_ingredients)
            except Exception:
                current_ings = []
            resolve_and_learn_from_ocr(
                raw_ocr_text=extracted_text,
                existing_patient_ingredients=current_ings,
                db=db,
            )
            db.expire_all()
            matched_brands = match_brands_from_lines(raw_lines, db)

        matched_list = list(matched_brands.values())
        active_ingredients_map = {}
        all_scanned_ingredient_names = []
        detected_summary = []

        for brand in matched_list:
            brand_ings = [ing.name for ing in brand.ingredients]
            if not brand_ings and brand.generic_name:
                brand_ings = [brand.generic_name]

            all_scanned_ingredient_names.extend(brand_ings)

            detected_summary.append(
                {
                    "brand_name": brand.brand_name,
                    "generic_name": brand.generic_name,
                    "strength": brand.strength,
                    "active_ingredients": brand_ings,
                }
            )

            log_medicine_to_history(
                db=db,
                brand_name=brand.brand_name,
                generic_name=brand.generic_name,
                strength=brand.strength,
                active_ingredients=brand_ings,
                source_action="Prescription Scan",
                notes=f"File: {file.filename}",
            )

            for ing in brand.ingredients:
                active_ingredients_map[ing.id] = ing

        resolved_ings = list(active_ingredients_map.values())

        # 6a. Flag duplicate active ingredients across scanned brands
        interactions = detect_duplicate_ingredients(all_scanned_ingredient_names)

        # 6b. Check pairwise interactions in local PostgreSQL DB
        db_pair_found = False
        ing_ids = [ing.id for ing in resolved_ings]
        for i in range(len(ing_ids)):
            for j in range(i + 1, len(ing_ids)):
                id_a = min(ing_ids[i], ing_ids[j])
                id_b = max(ing_ids[i], ing_ids[j])
                record = (
                    db.query(DrugInteraction)
                    .filter_by(ingredient_a_id=id_a, ingredient_b_id=id_b)
                    .first()
                )
                if record:
                    db_pair_found = True
                    ing_a = db.query(ActiveIngredient).filter_by(id=id_a).first()
                    ing_b = db.query(ActiveIngredient).filter_by(id=id_b).first()
                    interactions.append(
                        {
                            "ingredient_a": ing_a.name if ing_a else f"ID {id_a}",
                            "ingredient_b": ing_b.name if ing_b else f"ID {id_b}",
                            "severity": record.severity,
                            "interaction_description": record.interaction_description,
                            "clinical_effect": record.clinical_effect,
                            "management_information": record.management_information,
                        }
                    )

        # 6c. AI Clinical Interaction Fallback for pairs not seeded in local SQL table
        unique_ingredient_names = list(
            {name.strip().title() for name in all_scanned_ingredient_names if name.strip()}
        )
        if not db_pair_found and len(unique_ingredient_names) >= 2:
            for ai_item in analyze_interactions_with_ai(unique_ingredient_names):
                interactions.append(
                    {
                        "ingredient_a": ai_item.ingredient_a,
                        "ingredient_b": ai_item.ingredient_b,
                        "severity": ai_item.severity,
                        "interaction_description": ai_item.interaction_description,
                        "clinical_effect": ai_item.clinical_effect,
                        "management_information": ai_item.management_information,
                    }
                )

        has_critical = any(
            item["severity"].lower() in ["major", "severe", "critical"]
            for item in interactions
        )
        has_moderate = any(
            item["severity"].lower() in ["moderate", "warning"]
            for item in interactions
        )

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
            "resolved_active_ingredients": unique_ingredient_names,
            "total_interactions_found": len(interactions),
            "interactions": interactions,
            "disclaimer": "MedSafe India clinical decision support tool. Always consult a physician.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing error: {str(e)}")