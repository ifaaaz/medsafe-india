import os
from collections import Counter
from typing import List
from itertools import combinations
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from google.genai.errors import APIError
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.medicine import MedicineBrand, ActiveIngredient
from app.models.interaction import DrugInteraction
from app.schemas.interaction import InteractionCheckRequest, InteractionCheckResponse, InteractionFinding

load_dotenv()

router = APIRouter(prefix="/api/v1/interactions", tags=["Interactions"])

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(
    api_key=api_key,
    http_options={"api_version": "v1beta"}
) if api_key else None

FALLBACK_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"]


class AIInteractionItem(BaseModel):
    ingredient_a: str
    ingredient_b: str
    severity: str = Field(description="Major, Moderate, or Minor")
    interaction_description: str
    clinical_effect: str
    management_information: str


class AIInteractionList(BaseModel):
    interactions: List[AIInteractionItem]


def analyze_interactions_with_ai(ingredient_names: List[str]) -> List[AIInteractionItem]:
    if not client or len(ingredient_names) < 2:
        return []

    prompt = f"""
    You are a clinical pharmacology safety checker.
    Analyze this list of active pharmaceutical ingredients being taken together: {", ".join(ingredient_names)}.
    Identify ALL clinically significant drug-drug interactions (especially Major or Moderate risks such as bleeding, hepatotoxicity, QT prolongation, serotonin syndrome, or additive toxicity).
    If there are no clinically significant interactions, return an empty list.
    """

    for model_name in FALLBACK_MODELS:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AIInteractionList,
                    temperature=0.1,
                ),
            )
            parsed = AIInteractionList.model_validate_json(response.text)
            return parsed.interactions
        except APIError as e:
            if e.code in (429, 404, 503):
                continue
            return []
        except Exception:
            return []
    return []


def detect_duplicate_ingredients(raw_names: List[str]) -> List[dict]:
    cleaned = [n.strip().title() for n in raw_names if n and n.strip()]
    counts = Counter(cleaned)
    duplicates = []
    for ing_name, count in counts.items():
        if count >= 2:
            duplicates.append({
                "ingredient_a": ing_name,
                "ingredient_b": f"{ing_name} (Duplicate in {count} medicines)",
                "severity": "Major",
                "interaction_description": f"Therapeutic duplication: {ing_name} is present in {count} prescribed medications simultaneously.",
                "clinical_effect": f"Additive dose exposure to {ing_name}, increasing the risk of organ toxicity or overdose (e.g., hepatotoxicity with Paracetamol).",
                "management_information": "Review all brand compositions and eliminate duplicate active ingredients unless explicitly directed by a physician.",
                "source_name": "MedSafe Duplicate Ingredient Engine"
            })
    return duplicates


@router.post("/check", response_model=InteractionCheckResponse)
def check_drug_interactions(payload: InteractionCheckRequest, db: Session = Depends(get_db)):
    medicines = db.query(MedicineBrand).filter(MedicineBrand.id.in_(payload.medicine_ids)).all()
    if not medicines:
        raise HTTPException(status_code=404, detail="No matching medicines found for the provided IDs.")

    all_ing_names = []
    ingredient_map = {}
    for med in medicines:
        for ing in med.ingredients:
            all_ing_names.append(ing.name)
            ingredient_map[ing.id] = ing.name

    interactions_found = [
        InteractionFinding(**dup) for dup in detect_duplicate_ingredients(all_ing_names)
    ]

    ingredient_list = list(ingredient_map.keys())
    checked_pairs = set()

    for i in range(len(ingredient_list)):
        for j in range(i + 1, len(ingredient_list)):
            id_a = min(ingredient_list[i], ingredient_list[j])
            id_b = max(ingredient_list[i], ingredient_list[j])
            checked_pairs.add(tuple(sorted([ingredient_map[id_a].lower(), ingredient_map[id_b].lower()])))

            match = db.query(DrugInteraction).filter_by(
                ingredient_a_id=id_a,
                ingredient_b_id=id_b
            ).first()

            if match:
                interactions_found.append(
                    InteractionFinding(
                        ingredient_a=ingredient_map[id_a],
                        ingredient_b=ingredient_map[id_b],
                        severity=match.severity,
                        interaction_description=match.interaction_description,
                        clinical_effect=match.clinical_effect,
                        management_information=match.management_information,
                        source_name=match.source_name
                    )
                )

    # AI Clinical Fallback if local DB didn't flag anything for 2+ unique ingredients
    unique_names = list(set(ingredient_map.values()))
    if not interactions_found and len(unique_names) >= 2:
        for ai_item in analyze_interactions_with_ai(unique_names):
            interactions_found.append(
                InteractionFinding(
                    ingredient_a=ai_item.ingredient_a,
                    ingredient_b=ai_item.ingredient_b,
                    severity=ai_item.severity,
                    interaction_description=ai_item.interaction_description,
                    clinical_effect=ai_item.clinical_effect,
                    management_information=ai_item.management_information,
                    source_name="MedSafe Clinical AI Analyzer"
                )
            )

    return InteractionCheckResponse(
        has_interactions=len(interactions_found) > 0,
        interactions=interactions_found
    )


class RegimenCheckRequest(BaseModel):
    active_ingredients: List[str]


@router.post("/check-regimen")
def check_combined_regimen(payload: RegimenCheckRequest, db: Session = Depends(get_db)):
    # 1. Flag duplicate active ingredients BEFORE deduplicating
    found_interactions = detect_duplicate_ingredients(payload.active_ingredients)

    # 2. Case-insensitive lookup for unique ingredients
    unique_names_lower = list({name.strip().lower() for name in payload.active_ingredients if name.strip()})
    ingredients = db.query(ActiveIngredient).filter(
        func.lower(ActiveIngredient.name).in_(unique_names_lower)
    ).all()

    db_pair_found = False
    for ing1, ing2 in combinations(ingredients, 2):
        id_a, id_b = sorted([ing1.id, ing2.id])
        interaction = db.query(DrugInteraction).filter_by(
            ingredient_a_id=id_a,
            ingredient_b_id=id_b
        ).first()

        if interaction:
            db_pair_found = True
            found_interactions.append({
                "ingredient_a": ing1.name,
                "ingredient_b": ing2.name,
                "severity": interaction.severity,
                "interaction_description": interaction.interaction_description,
                "clinical_effect": interaction.clinical_effect,
                "management_information": interaction.management_information
            })

    # 3. AI fallback for unseeded pairs (e.g., Acenocoumarol + Ibuprofen + Aspirin)
    unique_clean_names = list({name.strip().title() for name in payload.active_ingredients if name.strip()})
    if not db_pair_found and len(unique_clean_names) >= 2:
        for ai_item in analyze_interactions_with_ai(unique_clean_names):
            found_interactions.append({
                "ingredient_a": ai_item.ingredient_a,
                "ingredient_b": ai_item.ingredient_b,
                "severity": ai_item.severity,
                "interaction_description": ai_item.interaction_description,
                "clinical_effect": ai_item.clinical_effect,
                "management_information": ai_item.management_information
            })

    safety_status = (
        "Danger - Major Interaction"
        if any(i["severity"].lower() == "major" for i in found_interactions)
        else ("Caution - Moderate Interaction" if found_interactions else "Safe")
    )

    return {
        "total_ingredients_checked": len(unique_clean_names),
        "total_interactions_found": len(found_interactions),
        "safety_status": safety_status,
        "interactions": found_interactions
    }