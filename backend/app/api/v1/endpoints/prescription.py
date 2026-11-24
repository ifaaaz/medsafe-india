from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.ocr_service import process_prescription_image

router = APIRouter(prefix="/api/v1/prescription", tags=["Prescription & OCR"])


@router.post("/upload")
async def upload_and_extract_prescription(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename.lower().endswith((".png", ".jpg", ".jpeg", ".pdf", ".webp")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a valid image or PDF.",
        )

    # Run real 3-tier OCR + RxNorm/OpenFDA auto-resolution + PostgreSQL caching
    ocr_result = process_prescription_image(db, file)
    candidates = ocr_result.get("candidates", [])

    detected_medicines = []
    seen = set()

    for cand in candidates:
        brand_name = (cand.get("brand_name") or cand.get("brand") or "").strip()
        if not brand_name or brand_name.lower() == "sample medicine":
            continue

        key = brand_name.lower()
        if key in seen:
            continue
        seen.add(key)

        generic_name = cand.get("generic_name") or brand_name
        active_ingredients = cand.get("active_ingredients") or [
            s.strip() for s in generic_name.split("+") if s.strip()
        ]

        detected_medicines.append(
            {
                "brand_name": brand_name,
                "generic_name": generic_name,
                "strength": cand.get("strength", "Standard"),
                "dosage_form": cand.get("dosage_form", "Tablet"),
                "manufacturer": cand.get("manufacturer", "Registered Pharma"),
                "active_ingredients": active_ingredients,
                "match_type": cand.get("match_type", "resolved"),
            }
        )

    return {
        "filename": file.filename,
        "status": "success",
        "extracted_text": ocr_result.get("extracted_text", ""),
        "candidates": candidates,
        "detected_medicines": detected_medicines,
        "extracted_medicines": [m["brand_name"] for m in detected_medicines],
        "message": f"Successfully extracted and verified {len(detected_medicines)} medicine(s).",
        "disclaimer": "Please verify this medication combination with a doctor or pharmacist where appropriate.",
    }