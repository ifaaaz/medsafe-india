import os
import re
from typing import List
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from sqlalchemy.orm import Session

from app.models.medicine import MedicineBrand, ActiveIngredient
from app.models.interaction import DrugInteraction

load_dotenv()

# Initialize Gemini client with v1beta so JSON structured output is enabled
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    http_options={"api_version": "v1beta"}
)


# --- Structured Output Schemas ---
class ExtractedMedicine(BaseModel):
    brand_name: str = Field(description="Commercial brand name of the medicine, e.g., Augmentin 625")
    generic_name: str = Field(description="Generic composition name")
    strength: str = Field(description="Dosage strength, e.g., 625mg, or 'Unknown'")
    dosage_form: str = Field(description="Tablet, Capsule, Syrup, Injection, etc.")
    active_ingredients: List[str] = Field(
        description="List of standard INN active chemical ingredients, e.g., ['Amoxicillin', 'Clavulanic Acid']"
    )


class ExtractedInteraction(BaseModel):
    ingredient_a: str
    ingredient_b: str
    severity: str = Field(description="Major, Moderate, or Minor")
    interaction_description: str
    clinical_effect: str
    management_information: str


class ClinicalFallbackResponse(BaseModel):
    medicines: List[ExtractedMedicine]
    interactions: List[ExtractedInteraction]


def normalize_name(text: str) -> str:
    return re.sub(r'[^a-z0-9]', '', text.lower()) if text else ""


def resolve_and_learn_from_ocr(
    raw_ocr_text: str,
    existing_patient_ingredients: List[str],
    db: Session
) -> List[dict]:
    """
    Uses Gemini to identify unknown medicines from OCR text, checks interactions
    against both new and existing patient ingredients, and saves everything to PostgreSQL.
    """
    prompt = f"""
    You are a clinical pharmacology assistant for Indian prescriptions.
    Analyze the following raw OCR text from a medical prescription:
    ---
    {raw_ocr_text}
    ---
    
    1. Identify all valid pharmaceutical medicines prescribed in the text (ignore doctor names, hospital addresses, and patient details).
    2. For each medicine, provide its standardized active chemical ingredients (e.g., convert 'Acetaminophen' to 'Paracetamol', 'Dolo 650' -> ['Paracetamol']).
    3. Check for clinically significant drug-drug interactions among ALL extracted active ingredients AND this list of existing medications the patient is already taking: {existing_patient_ingredients}.
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ClinicalFallbackResponse,
            temperature=0.1,
        ),
    )

    parsed_data = ClinicalFallbackResponse.model_validate_json(response.text)
    saved_medicines_output = []

    # 1. Auto-save newly discovered Active Ingredients & Medicine Brands
    for med in parsed_data.medicines:
        norm_name = normalize_name(med.brand_name)
        if not norm_name:
            continue

        db_brand = db.query(MedicineBrand).filter_by(normalized_brand_name=norm_name).first()
        if not db_brand:
            db_brand = MedicineBrand(
                brand_name=med.brand_name,
                normalized_brand_name=norm_name,
                generic_name=med.generic_name,
                strength=med.strength,
                dosage_form=med.dosage_form or "Tablet",
                manufacturer="Auto-Indexed via Clinical AI"
            )
            db.add(db_brand)
            db.flush()

        ing_names_for_response = []
        for ing_name in med.active_ingredients:
            clean_ing = ing_name.strip().title()
            db_ing = db.query(ActiveIngredient).filter_by(name=clean_ing).first()
            if not db_ing:
                db_ing = ActiveIngredient(name=clean_ing)
                db.add(db_ing)
                db.flush()

            if db_ing not in db_brand.ingredients:
                db_brand.ingredients.append(db_ing)
            ing_names_for_response.append(clean_ing)

        saved_medicines_output.append({
            "brand_name": db_brand.brand_name,
            "generic_name": db_brand.generic_name,
            "strength": db_brand.strength,
            "active_ingredients": ing_names_for_response,
            "source": "AI Auto-Indexed"
        })

    db.commit()

    # 2. Auto-save newly discovered Drug-Drug Interactions
    for inter in parsed_data.interactions:
        ing_a = db.query(ActiveIngredient).filter_by(name=inter.ingredient_a.strip().title()).first()
        ing_b = db.query(ActiveIngredient).filter_by(name=inter.ingredient_b.strip().title()).first()

        if ing_a and ing_b and ing_a.id != ing_b.id:
            id_a, id_b = sorted([ing_a.id, ing_b.id])
            existing_rule = db.query(DrugInteraction).filter_by(
                ingredient_a_id=id_a,
                ingredient_b_id=id_b
            ).first()

            if not existing_rule:
                new_rule = DrugInteraction(
                    ingredient_a_id=id_a,
                    ingredient_b_id=id_b,
                    severity=inter.severity.capitalize(),
                    interaction_description=inter.interaction_description,
                    clinical_effect=inter.clinical_effect,
                    management_information=inter.management_information,
                    evidence_level="AI-Verified Clinical Reference",
                    source_name="MedSafe Dynamic Knowledge Engine"
                )
                db.add(new_rule)

    db.commit()
    return saved_medicines_output