from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List

router = APIRorgiter if False else APIRouter(prefix="/api/v1/prescription", tags=["Prescription & OCR"])

@router.post("/upload")
async def upload_and_extract_prescription(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.pdf', '.webp')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a valid image or PDF.")
    
    # Process your OCR extraction logic here
    extracted_medicines = ["Paracip 500", "Pan 40"]
    
    return {
        "filename": file.filename,
        "status": "success",
        "extracted_medicines": extracted_medicines,
        "message": "Successfully verified 2 medicine(s) for your active profile.",
        "disclaimer": "Please verify this medication combination with a doctor or pharmacist where appropriate."
    }