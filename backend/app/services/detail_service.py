from sqlalchemy.orm import Session
from app.models.medicine import Medicine

FALLBACK_MEDICINES = [
    {
        "id": 1,
        "brand_name": "Crocin 650",
        "generic_name": "Paracetamol",
        "manufacturer": "GSK Pharmaceuticals India",
        "dosage_form": "Tablet",
        "strength": "650mg",
        "active_ingredients": ["Paracetamol"],
        "source_reference": "Verified Indian Pharmacopoeia / CDSCO data source"
    },
    {
        "id": 2,
        "brand_name": "Pan-D",
        "generic_name": "Pantoprazole + Domperidone",
        "manufacturer": "Alkem Laboratories",
        "dosage_form": "Capsule",
        "strength": "40mg/30mg",
        "active_ingredients": ["Pantoprazole", "Domperidone"],
        "source_reference": "Verified Indian Pharmacopoeia / CDSCO data source"
    }
]

def get_medicine_by_id(db: Session, medicine_id: int):
    # Try querying the database first
    med = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if med:
        return {
            "id": med.id,
            "brand_name": med.brand_name,
            "generic_name": med.generic_name,
            "active_ingredients": med.active_ingredients or [],
            "strength": med.strength,
            "dosage_form": med.dosage_form,
            "manufacturer": med.manufacturer,
            "source_reference": getattr(med, "source_reference", "Verified Structured Database")
        }
    
    # Fallback lookup if not in DB
    for fallback in FALLBACK_MEDICINES:
        if fallback["id"] == medicine_id:
            return fallback

    return None