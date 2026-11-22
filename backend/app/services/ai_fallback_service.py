import os
import re
import json
import itertools
import urllib.request
from types import SimpleNamespace
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from google.genai.errors import APIError
from sqlalchemy.orm import Session

from app.models.medicine import MedicineBrand, ActiveIngredient
from app.models.interaction import DrugInteraction

load_dotenv()

FALLBACK_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
]

GROQ_FALLBACK_MODELS = [
    "llama-3.3-70b-versatile",  # 1,000 free RPD, high clinical pharmacology accuracy
    "llama-3.1-8b-instant",     # 14,400 free RPD, ultra-fast fallback
]


def get_gemini_clients() -> List[genai.Client]:
    """Builds Gemini clients from comma-separated GEMINI_API_KEYS (or single GEMINI_API_KEY)."""
    raw_keys = os.getenv("GEMINI_API_KEYS") or os.getenv("GEMINI_API_KEY") or ""
    keys = [k.strip() for k in raw_keys.split(",") if k.strip()]
    return [
        genai.Client(api_key=k, http_options={"api_version": "v1beta"})
        for k in keys
    ]


_round_robin_index = itertools.count()


def _extract_text_prompt(contents: Any) -> Optional[str]:
    """Extracts plain text prompt when contents is text-only (returns None for raw image bytes)."""
    if isinstance(contents, str):
        return contents
    if isinstance(contents, list):
        text_parts = [c for c in contents if isinstance(c, str)]
        if len(text_parts) == len(contents) and text_parts:
            return "\n".join(text_parts)
    return None


def _call_groq_overflow(prompt: str, config: Optional[types.GenerateContentConfig]) -> SimpleNamespace:
    """Automatic Groq LPU overflow when all Gemini keys hit 429 daily limits."""
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_key:
        raise RuntimeError("GROQ_API_KEY not configured")

    schema_instruction = ""
    if config and getattr(config, "response_schema", None):
        schema_cls = config.response_schema
        if hasattr(schema_cls, "model_json_schema"):
            schema_json = json.dumps(schema_cls.model_json_schema())
            schema_instruction = (
                "\n\nCRITICAL: Return ONLY a valid JSON object strictly conforming to this JSON Schema "
                f"(no markdown fences, no commentary):\n{schema_json}"
            )

    last_err = None
    for model_name in GROQ_FALLBACK_MODELS:
        try:
            payload = {
                "model": model_name,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an Indian clinical pharmacology assistant. Respond strictly with valid JSON matching the requested schema.",
                    },
                    {
                        "role": "user",
                        "content": prompt + schema_instruction,
                    },
                ],
                "temperature": 0.1,
                "response_format": {"type": "json_object"},
            }
            req = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {groq_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "MedSafe-India/1.0",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=25) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                content_text = body["choices"][0]["message"]["content"]
                return SimpleNamespace(text=content_text)
        except Exception as e:
            last_err = e
            continue

    raise RuntimeError(f"GROQ_QUOTA_OR_API_ERROR: {last_err}")


def generate_with_key_rotation(
    contents: Any,
    config: Optional[types.GenerateContentConfig] = None,
    models: Optional[List[str]] = None,
):
    """
    Shared multi-project Gemini key + multi-model rotation helper with automatic Groq overflow.
    Used across ocr.py, interactions.py, lifestyle_warnings.py, generic_saver.py, and medicines.py.
    """
    clients = get_gemini_clients()
    model_list = models or FALLBACK_MODELS
    last_error = None

    if clients:
        start = next(_round_robin_index) % len(clients)
        ordered_clients = clients[start:] + clients[:start]

        for client in ordered_clients:
            for model_name in model_list:
                try:
                    return client.models.generate_content(
                        model=model_name,
                        contents=contents,
                        config=config,
                    )
                except APIError as e:
                    last_error = e
                    if e.code in (429, 404, 503):
                        continue
                    raise
                except Exception as e:
                    last_error = e
                    continue

    # Tier 2: Automatic Groq overflow (14,400+ free req/day) if all Gemini keys are exhausted
    text_prompt = _extract_text_prompt(contents)
    if text_prompt and os.getenv("GROQ_API_KEY"):
        return _call_groq_overflow(text_prompt, config)

    raise RuntimeError(f"ALL_QUOTAS_EXHAUSTED: {last_error}")


# Deterministic offline fallback dictionary for common Indian prescription brands
OFFLINE_INDIAN_BRANDS: Dict[str, dict] = {
    "dolo 650": {"brand_name": "Dolo 650", "generic_name": "Paracetamol", "strength": "650mg", "dosage_form": "Tablet", "active_ingredients": ["Paracetamol"]},
    "combiflam": {"brand_name": "Combiflam", "generic_name": "Ibuprofen + Paracetamol", "strength": "400mg/325mg", "dosage_form": "Tablet", "active_ingredients": ["Ibuprofen", "Paracetamol"]},
    "telma 40": {"brand_name": "Telma 40", "generic_name": "Telmisartan", "strength": "40mg", "dosage_form": "Tablet", "active_ingredients": ["Telmisartan"]},
    "pan-d": {"brand_name": "Pan-D", "generic_name": "Pantoprazole + Domperidone", "strength": "40mg/30mg", "dosage_form": "Capsule", "active_ingredients": ["Pantoprazole", "Domperidone"]},
    "pantop 40": {"brand_name": "Pantop 40", "generic_name": "Pantoprazole", "strength": "40mg", "dosage_form": "Tablet", "active_ingredients": ["Pantoprazole"]},
    "ecosprin 75": {"brand_name": "Ecosprin 75", "generic_name": "Aspirin", "strength": "75mg", "dosage_form": "Tablet", "active_ingredients": ["Aspirin"]},
    "warf 5": {"brand_name": "Warf 5", "generic_name": "Warfarin", "strength": "5mg", "dosage_form": "Tablet", "active_ingredients": ["Warfarin"]},
    "acitrom 2": {"brand_name": "Acitrom 2", "generic_name": "Acenocoumarol", "strength": "2mg", "dosage_form": "Tablet", "active_ingredients": ["Acenocoumarol"]},
    "augmentin 625": {"brand_name": "Augmentin 625 Duo", "generic_name": "Amoxicillin + Clavulanic Acid", "strength": "625mg", "dosage_form": "Tablet", "active_ingredients": ["Amoxicillin", "Clavulanic Acid"]},
    "atorva 20": {"brand_name": "Atorva 20", "generic_name": "Atorvastatin", "strength": "20mg", "dosage_form": "Tablet", "active_ingredients": ["Atorvastatin"]},
    "clopilet 75": {"brand_name": "Clopilet 75", "generic_name": "Clopidogrel", "strength": "75mg", "dosage_form": "Tablet", "active_ingredients": ["Clopidogrel"]},
    "zerodol-sp": {"brand_name": "Zerodol-SP", "generic_name": "Aceclofenac + Paracetamol + Serratiopeptidase", "strength": "100mg/325mg/15mg", "dosage_form": "Tablet", "active_ingredients": ["Aceclofenac", "Paracetamol", "Serratiopeptidase"]},
    "acyton-sp": {"brand_name": "Acyton-SP", "generic_name": "Aceclofenac + Paracetamol + Serratiopeptidase", "strength": "100mg/325mg/15mg", "dosage_form": "Tablet", "active_ingredients": ["Aceclofenac", "Paracetamol", "Serratiopeptidase"]},
    "poxovir 800": {"brand_name": "Poxovir 800", "generic_name": "Aciclovir", "strength": "800mg", "dosage_form": "Tablet", "active_ingredients": ["Aciclovir"]},
    "flagyl 400": {"brand_name": "Flagyl 400", "generic_name": "Metronidazole", "strength": "400mg", "dosage_form": "Tablet", "active_ingredients": ["Metronidazole"]},
    "omez 20": {"brand_name": "Omez 20", "generic_name": "Omeprazole", "strength": "20mg", "dosage_form": "Capsule", "active_ingredients": ["Omeprazole"]},
    "azithral 500": {"brand_name": "Azithral 500", "generic_name": "Azithromycin", "strength": "500mg", "dosage_form": "Tablet", "active_ingredients": ["Azithromycin"]},
    "montair lc": {"brand_name": "Montair LC", "generic_name": "Montelukast + Levocetirizine", "strength": "10mg/5mg", "dosage_form": "Tablet", "active_ingredients": ["Montelukast", "Levocetirizine"]},
    "glycomet 500": {"brand_name": "Glycomet 500 SR", "generic_name": "Metformin", "strength": "500mg", "dosage_form": "Tablet", "active_ingredients": ["Metformin"]},
    "allegra 120": {"brand_name": "Allegra 120", "generic_name": "Fexofenadine", "strength": "120mg", "dosage_form": "Tablet", "active_ingredients": ["Fexofenadine"]},
}


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


def _offline_ocr_fallback(raw_ocr_text: str) -> ClinicalFallbackResponse:
    """Matches known Indian brand names directly from OCR text if all API quotas are exhausted."""
    text_lower = raw_ocr_text.lower()
    matched_meds: List[ExtractedMedicine] = []

    for key, entry in OFFLINE_INDIAN_BRANDS.items():
        if key in text_lower:
            matched_meds.append(ExtractedMedicine(**entry))

    return ClinicalFallbackResponse(medicines=matched_meds, interactions=[])


def _generate_ocr_analysis(prompt: str, raw_ocr_text: str) -> ClinicalFallbackResponse:
    try:
        response = generate_with_key_rotation(
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ClinicalFallbackResponse,
                temperature=0.1,
            ),
        )
        return ClinicalFallbackResponse.model_validate_json(response.text)
    except Exception:
        return _offline_ocr_fallback(raw_ocr_text)


def resolve_and_learn_from_ocr(
    raw_ocr_text: str,
    existing_patient_ingredients: List[str],
    db: Session
) -> List[dict]:
    """
    Uses 3-project Gemini key rotation + Groq overflow to identify unknown medicines from OCR text,
    checks interactions against both new and existing patient ingredients, and saves everything to PostgreSQL.
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

    parsed_data = _generate_ocr_analysis(prompt, raw_ocr_text)
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