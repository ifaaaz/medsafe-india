from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from itertools import combinations

from app.core.database import get_db
from app.models.medicine import MedicineBrand, ActiveIngredient
from app.models.interaction import DrugInteraction
from app.schemas.interaction import InteractionCheckRequest, InteractionCheckResponse, InteractionFinding

router = APIRouter(prefix="/api/v1/interactions", tags=["Interactions"])


@router.post("/check", response_model=InteractionCheckResponse)
def check_drug_interactions(payload: InteractionCheckRequest, db: Session = Depends(get_db)):
    # 1. Fetch requested medicine brands
    medicines = db.query(MedicineBrand).filter(MedicineBrand.id.in_(payload.medicine_ids)).all()
    
    if not medicines:
        raise HTTPException(status_code=404, detail="No matching medicines found for the provided IDs.")

    # 2. Extract unique active ingredient IDs across all selected medicines
    ingredient_ids = set()
    for med in medicines:
        for ing in med.ingredients:
            ingredient_ids.add(ing.id)
    
    ingredient_list = list(ingredient_ids)
    interactions_found = []

    # 3. Pairwise check all active ingredients with bidirectional normalization (min < max)
    for i in range(len(ingredient_list)):
        for j in range(i + 1, len(ingredient_list)):
            id_a = min(ingredient_list[i], ingredient_list[j])
            id_b = max(ingredient_list[i], ingredient_list[j])

            match = db.query(DrugInteraction).filter_by(
                ingredient_a_id=id_a,
                ingredient_b_id=id_b
            ).first()

            if match:
                ing_a_obj = db.query(ActiveIngredient).get(id_a)
                ing_b_obj = db.query(ActiveIngredient).get(id_b)

                interactions_found.append(
                    InteractionFinding(
                        ingredient_a=ing_a_obj.name if ing_a_obj else "Unknown",
                        ingredient_b=ing_b_obj.name if ing_b_obj else "Unknown",
                        severity=match.severity,
                        interaction_description=match.interaction_description,
                        clinical_effect=match.clinical_effect,
                        management_information=match.management_information,
                        source_name=match.source_name
                    )
                )

    return InteractionCheckResponse(
        has_interactions=len(interactions_found) > 0,
        interactions=interactions_found
    )


# --- Cross-Prescription Regimen Endpoint ---
class RegimenCheckRequest(BaseModel):
    active_ingredients: List[str]


@router.post("/check-regimen")
def check_combined_regimen(payload: RegimenCheckRequest, db: Session = Depends(get_db)):
    # Deduplicate ingredient names
    unique_names = list({name.strip() for name in payload.active_ingredients if name.strip()})
    
    # Fetch ingredient records from DB
    ingredients = db.query(ActiveIngredient).filter(
        ActiveIngredient.name.in_(unique_names)
    ).all()

    found_interactions = []
    # Check every unique pair across all prescriptions
    for ing1, ing2 in combinations(ingredients, 2):
        id_a, id_b = sorted([ing1.id, ing2.id])
        interaction = db.query(DrugInteraction).filter_by(
            ingredient_a_id=id_a,
            ingredient_b_id=id_b
        ).first()

        if interaction:
            found_interactions.append({
                "ingredient_a": ing1.name,
                "ingredient_b": ing2.name,
                "severity": interaction.severity,
                "interaction_description": interaction.interaction_description,
                "clinical_effect": interaction.clinical_effect,
                "management_information": interaction.management_information
            })

    safety_status = (
        "Danger - Major Interaction"
        if any(i["severity"].lower() == "major" for i in found_interactions)
        else ("Caution - Moderate Interaction" if found_interactions else "Safe")
    )

    return {
        "total_ingredients_checked": len(ingredients),
        "total_interactions_found": len(found_interactions),
        "safety_status": safety_status,
        "interactions": found_interactions
    }