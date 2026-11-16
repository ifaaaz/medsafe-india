from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.duplicates import check_duplicate_ingredients

router = APIRouter(prefix="/medicines", tags=["Duplicate Detection"])

class DuplicateCheckRequest(BaseModel):
    medicine_ids: List[int] = Field(..., description="List of selected medicine IDs")

@router.post("/check-duplicates")
def api_check_duplicates(payload: DuplicateCheckRequest, db: Session = Depends(get_db)):
    if not payload.medicine_ids:
        raise HTTPException(status_code=400, detail="At least one medicine ID must be provided.")
    
    result = check_duplicate_ingredients(db, payload.medicine_ids)
    return result