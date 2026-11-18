import os
from typing import List, Literal
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from google.genai.errors import APIError
from fastapi import APIRouter, HTTPException

load_dotenv()

router = APIRouter(prefix="/api/v1/lifestyle-warnings", tags=["Lifestyle & Condition Warnings"])

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(
    api_key=api_key,
    http_options={"api_version": "v1beta"}
) if api_key else None

FALLBACK_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"]


class LifestyleWarningRequest(BaseModel):
    medicines: List[str] = Field(..., min_length=1, description="Detected medicine brand or generic names")
    conditions: List[str] = Field(
        default_factory=list,
        description="Selected patient factors e.g. ['Alcohol', 'Pregnancy', 'Kidney Disease', 'Liver Disease', 'Gastric Ulcer']"
    )


class FoodTimingTip(BaseModel):
    medicine_name: str
    timing_instruction: str = Field(description="e.g., 'Take 30 mins before breakfast on empty stomach' or 'Take strictly after meals'")
    food_avoidance: str = Field(description="Specific foods/drinks to avoid, e.g., 'Avoid grapefruit, dairy within 2 hrs, or excessive caffeine', or 'None'")


class ConditionAlert(BaseModel):
    medicine_name: str
    factor: str = Field(description="e.g., 'Alcohol', 'Pregnancy', 'Kidney Disease', 'Liver Disease', 'Gastric Ulcer'")
    severity: Literal["CONTRAINDICATED", "HIGH_RISK", "MODERATE_CAUTION"]
    warning_summary: str = Field(description="Concise clinical explanation of the risk")
    actionable_advice: str = Field(description="Practical guidance for the patient/doctor")


class LifestyleWarningResponse(BaseModel):
    condition_alerts: List[ConditionAlert]
    food_timing_tips: List[FoodTimingTip]
    overall_lifestyle_note: str


@router.post("/check", response_model=LifestyleWarningResponse)
def check_lifestyle_and_conditions(payload: LifestyleWarningRequest):
    if not client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

    selected_factors = payload.conditions if payload.conditions else ["General Food & Drink Interactions"]

    prompt = f"""
    You are an Indian clinical pharmacology safety assistant.
    Analyze these prescribed medicines: {payload.medicines}
    Against these patient lifestyle/medical factors: {selected_factors}

    Instructions:
    1. 'condition_alerts': Evaluate EVERY selected factor in {payload.conditions} against the medicines. Only include genuine clinical risks (e.g. Alcohol + Paracetamol/Metronidazole/NSAIDs; Pregnancy + Telmisartan/Atorvastatin/Aceclofenac; Gastric Ulcer + Aspirin/NSAIDs; Kidney/Liver impairment + renally/hepatically cleared drugs). If none of the selected conditions pose a risk, return an empty list [].
    2. 'food_timing_tips': For EVERY medicine in {payload.medicines}, provide accurate Indian meal-timing guidance (before food vs. after food) and any specific food/beverage interactions (dairy, citrus, caffeine, high-fat meals).
    3. 'overall_lifestyle_note': One crisp 1-sentence summary for the patient.
    """

    last_error = None
    for model_name in FALLBACK_MODELS:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=LifestyleWarningResponse,
                    temperature=0.1,
                ),
            )
            return LifestyleWarningResponse.model_validate_json(response.text)
        except APIError as e:
            if e.code in (429, 404, 503):
                last_error = e
                continue
            raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

    raise HTTPException(status_code=429, detail=f"All fallback models exhausted: {str(last_error)}")