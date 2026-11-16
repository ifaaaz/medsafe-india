from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.medicine import MedicineBrand

def check_duplicate_ingredients(db: Session, medicine_ids: List[int]) -> Dict[str, Any]:
    medicines = db.query(MedicineBrand).filter(MedicineBrand.id.in_(medicine_ids)).all()
    
    # Map ingredient ID -> list of medicines containing it
    ingredient_map: Dict[int, Dict[str, Any]] = {}

    for med in medicines:
        for ing in med.ingredients:
            if ing.id not in ingredient_map:
                ingredient_map[ing.id] = {
                    "ingredient_id": ing.id,
                    "ingredient_name": ing.name,
                    "medicines": []
                }
            ingredient_map[ing.id]["medicines"].append({
                "medicine_id": med.id,
                "brand_name": med.brand_name,
                "strength": med.strength,
                "dosage_form": med.dosage_form,
                "manufacturer": med.manufacturer
            })

    # Filter for duplicates (ingredients present in more than 1 selected medicine)
    duplicates = []
    for ing_id, data in ingredient_map.items():
        if len(data["medicines"]) > 1:
            duplicates.append(data)

    has_duplicates = len(duplicates) > 0

    return {
        "has_duplicates": has_duplicates,
        "duplicate_findings": duplicates,
        "disclaimer": "Please verify this medication combination with a doctor or pharmacist where appropriate."
    }