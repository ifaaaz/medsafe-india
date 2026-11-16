from fastapi import APIRouter, UploadFile, File, Header, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.ingestion import IngestionPipeline

router = APIRouter(prefix="/admin", tags=["Admin Ingestion"])

# Simple secure admin token check (in production, use JWT or OAuth2 scopes)
ADMIN_SECRET_KEY = "medsafe-admin-secure-token"

def verify_admin(x_admin_token: str = Header(...)):
    if x_admin_token != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized: Admin access required.")
    return True

@router.post("/import-medicines")
async def import_medicines(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _ = Depends(verify_admin)
):
    """
    Admin-only endpoint to import medicine data via CSV or JSON files.
    Validates, normalizes, detects duplicates/conflicts, and generates an import report.
    """
    content = await file.read()
    pipeline = IngestionPipeline(db)
    report = pipeline.process_payload(content, file.filename or "")
    
    return {
        "filename": file.filename,
        "status": "completed",
        "report": report
    }