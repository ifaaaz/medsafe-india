from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db  # Adjust to your dependency injection
from app.models.ingredient import CanonicalIngredient, IngredientSynonym

router = APIRouter(prefix="/api/v1/admin/ingredients", tags=["Admin Normalization"])

class CanonicalCreate(BaseModel):
    name: str
    description: str = None

class SynonymCreate(BaseModel):
    canonical_id: int
    synonym_text: str
    source: str = "manual_admin"

@router.post("/canonical", status_code=201)
def create_canonical_ingredient(data: CanonicalCreate, db: Session = Depends(get_db)):
    existing = db.query(CanonicalIngredient).filter(CanonicalIngredient.name.ilike(data.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Canonical ingredient already exists.")
    
    canonical = CanonicalIngredient(name=data.name.strip().title(), description=data.description)
    db.add(canonical)
    db.commit()
    db.refresh(canonical)
    return {"status": "success", "canonical_id": canonical.id, "name": canonical.name}

@router.post("/synonyms", status_code=201)
def add_synonym(data: SynonymCreate, db: Session = Depends(get_db)):
    canonical = db.query(CanonicalIngredient).filter(CanonicalIngredient.id == data.canonical_id).first()
    if not canonical:
        raise HTTPException(status_code=404, detail="Canonical ingredient not found.")
    
    cleaned_synonym = data.synonym_text.lower().strip()
    existing_synonym = db.query(IngredientSynonym).filter(IngredientSynonym.synonym_text == cleaned_synonym).first()
    if existing_synonym:
        raise HTTPException(status_code=400, detail="Synonym already mapped to an ingredient.")

    synonym = IngredientSynonym(
        canonical_id=canonical.id,
        synonym_text=cleaned_synonym,
        source=data.source,
        is_verified=True
    )
    db.add(synonym)
    db.commit()
    return {"status": "success", "synonym": cleaned_synonym, "canonical_name": canonical.name}