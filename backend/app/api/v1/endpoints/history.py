from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.history import UserMedicationHistory

router = APIRouter(prefix="/api/v1/history", tags=["Medication History"])


class HistoryCreate(BaseModel):
    brand_name: str
    generic_name: Optional[str] = None
    strength: Optional[str] = "Standard"
    active_ingredients: List[str] = []
    source_action: str = "Manual Entry"
    notes: Optional[str] = None


def log_medicine_to_history(
    db: Session,
    brand_name: str,
    generic_name: Optional[str],
    strength: Optional[str],
    active_ingredients: List[str],
    source_action: str,
    notes: Optional[str] = None
):
    """Helper function so Medicine Checker and OCR Scanner can auto-record history."""
    ing_str = ", ".join(active_ingredients) if active_ingredients else (generic_name or "")
    entry = UserMedicationHistory(
        brand_name=brand_name,
        generic_name=generic_name,
        strength=strength or "Standard",
        active_ingredients=ing_str,
        source_action=source_action,
        notes=notes
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/")
def get_medication_history(db: Session = Depends(get_db)):
    records = (
        db.query(UserMedicationHistory)
        .order_by(UserMedicationHistory.recorded_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "brand_name": r.brand_name,
            "generic_name": r.generic_name,
            "strength": r.strength,
            "active_ingredients": [i.strip() for i in r.active_ingredients.split(",") if i.strip()] if r.active_ingredients else [],
            "source_action": r.source_action,
            "notes": r.notes,
            "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None
        }
        for r in records
    ]


@router.post("/")
def add_medication_history(payload: HistoryCreate, db: Session = Depends(get_db)):
    entry = log_medicine_to_history(
        db=db,
        brand_name=payload.brand_name,
        generic_name=payload.generic_name,
        strength=payload.strength,
        active_ingredients=payload.active_ingredients,
        source_action=payload.source_action,
        notes=payload.notes
    )
    return {"status": "saved", "id": entry.id}


@router.delete("/{item_id}")
def delete_history_item(item_id: int, db: Session = Depends(get_db)):
    record = db.query(UserMedicationHistory).filter_by(id=item_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="History record not found.")
    db.delete(record)
    db.commit()
    return {"status": "deleted", "id": item_id}


@router.delete("/")
def clear_all_history(db: Session = Depends(get_db)):
    db.query(UserMedicationHistory).delete()
    db.commit()
    return {"status": "cleared"}