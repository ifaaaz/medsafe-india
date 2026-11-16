from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.search_service import search_medicines

router = APIRouter(prefix="/medicines", tags=["Medicines"])

@router.get("/search")
def search_medicines_endpoint(
    q: str = Query(..., min_length=1),
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    return search_medicines(db=db, query=q, skip=skip, limit=limit)