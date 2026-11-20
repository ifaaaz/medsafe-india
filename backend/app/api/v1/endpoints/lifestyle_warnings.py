from typing import Dict, List, Literal
from pydantic import BaseModel, Field
from google.genai import types
from fastapi import APIRouter

from app.services.ai_fallback_service import generate_with_key_rotation

router = APIRouter(prefix="/api/v1/lifestyle-warnings", tags=["Lifestyle & Condition Warnings"])

# In-memory cache so toggling condition pills back and forth is instant (0ms, 0 API quota)
LIFESTYLE_CACHE: Dict[str, dict] = {}


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


def _deterministic_clinical_fallback(medicines: List[str], conditions: List[str]) -> LifestyleWarningResponse:
    """Instant clinical pharmacology fallback if all 9 key/model buckets hit a rate limit."""
    alerts: List[ConditionAlert] = []
    tips: List[FoodTimingTip] = []
    cond_set = {c.lower() for c in conditions}

    for med in medicines:
        m_low = med.lower()

        # 1. Alcohol interactions
        if any("alcohol" in c for c in cond_set):
            if any(k in m_low for k in ["flagyl", "metronidazole", "tinidazole"]):
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Alcohol",
                        severity="CONTRAINDICATED",
                        warning_summary="Severe disulfiram-like reaction causing flushing, violent nausea, vomiting, and palpitations.",
                        actionable_advice="Strictly avoid alcohol during treatment and for at least 48–72 hours after the last dose.",
                    )
                )
            elif any(k in m_low for k in ["dolo", "paracetamol", "combiflam", "zerodol", "aceclofenac", "ibuprofen", "ecosprin", "aspirin"]):
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Alcohol",
                        severity="HIGH_RISK",
                        warning_summary="Alcohol compounds hepatotoxicity (Paracetamol) and significantly raises gastrointestinal bleeding risk (NSAIDs/Aspirin).",
                        actionable_advice="Avoid alcohol while taking analgesics or anti-inflammatory medications.",
                    )
                )

        # 2. Pregnancy / Breastfeeding interactions
        if any("pregnancy" in c for c in cond_set):
            if any(k in m_low for k in ["telma", "telmisartan", "losartan", "enalapril", "ramipril", "atorva", "atorvastatin", "rosuva", "acitrom", "combiflam", "ibuprofen", "zerodol", "aceclofenac", "ecosprin", "aspirin"]):
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Pregnancy / Breastfeeding",
                        severity="CONTRAINDICATED",
                        warning_summary="Potential fetal toxicity, teratogenicity, or third-trimester ductus arteriosus/bleeding complications.",
                        actionable_advice="Consult an obstetrician immediately before taking this medication during pregnancy.",
                    )
                )

        # 3. Gastric Ulcer / Acidity
        if any("gastric" in c or "ulcer" in c for c in cond_set):
            if any(k in m_low for k in ["combiflam", "ibuprofen", "zerodol", "aceclofenac", "ecosprin", "aspirin", "diclofenac"]):
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Gastric Ulcer",
                        severity="CONTRAINDICATED",
                        warning_summary="NSAIDs/Salicylates inhibit protective gastric prostaglandins and can trigger severe ulcer bleeding or perforation.",
                        actionable_advice="Avoid systemic NSAIDs in active peptic ulcer disease; ask your doctor about Paracetamol or gastroprotection.",
                    )
                )

        # 4. Kidney Disease
        if any("kidney" in c for c in cond_set):
            if any(k in m_low for k in ["combiflam", "ibuprofen", "zerodol", "aceclofenac", "telma", "telmisartan"]):
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Kidney Disease",
                        severity="HIGH_RISK",
                        warning_summary="May reduce renal prostaglandin blood flow or elevate serum potassium/creatinine in impaired kidneys.",
                        actionable_advice="Requires renal dose review and serum creatinine/potassium monitoring by a physician.",
                    )
                )

        # 5. Liver Disease
        if any("liver" in c for c in cond_set):
            if any(k in m_low for k in ["dolo", "paracetamol", "combiflam", "zerodol", "atorva", "atorvastatin"]):
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Liver Disease",
                        severity="HIGH_RISK",
                        warning_summary="Hepatically metabolized; elevated risk of drug accumulation or transaminase elevation in liver impairment.",
                        actionable_advice="Restrict total daily Paracetamol below 2g/day or consult your hepatologist for safe alternatives.",
                    )
                )

        # Meal timing guidance for every medicine
        if any(k in m_low for k in ["pan", "pantop", "omez", "omeprazole", "rabeprazole"]):
            tips.append(
                FoodTimingTip(
                    medicine_name=med,
                    timing_instruction="Take 30–45 minutes before breakfast on an empty stomach.",
                    food_avoidance="Spicy, acidic foods and excessive caffeine.",
                )
            )
        elif any(k in m_low for k in ["combiflam", "ibuprofen", "zerodol", "aceclofenac", "ecosprin", "aspirin", "augmentin"]):
            tips.append(
                FoodTimingTip(
                    medicine_name=med,
                    timing_instruction="Take immediately after a full meal or snack with a glass of water.",
                    food_avoidance="Alcohol and empty-stomach dosing.",
                )
            )
        else:
            tips.append(
                FoodTimingTip(
                    medicine_name=med,
                    timing_instruction="Take after food at the same time each day.",
                    food_avoidance="Alcohol.",
                )
            )

    return LifestyleWarningResponse(
        condition_alerts=alerts,
        food_timing_tips=tips,
        overall_lifestyle_note="Always follow prescribed meal timings and verify condition-specific warnings with your physician.",
    )


@router.post("/check", response_model=LifestyleWarningResponse)
def check_lifestyle_and_conditions(payload: LifestyleWarningRequest):
    meds_key = ",".join(sorted(m.strip().lower() for m in payload.medicines))
    cond_key = ",".join(sorted(c.strip().lower() for c in payload.conditions))
    cache_key = f"{meds_key}|{cond_key}"

    if cache_key in LIFESTYLE_CACHE:
        return LifestyleWarningResponse(**LIFESTYLE_CACHE[cache_key])

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

    try:
        response = generate_with_key_rotation(
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=LifestyleWarningResponse,
                temperature=0.1,
            ),
        )
        result = LifestyleWarningResponse.model_validate_json(response.text)
        LIFESTYLE_CACHE[cache_key] = result.model_dump()
        return result
    except Exception:
        fallback_result = _deterministic_clinical_fallback(payload.medicines, payload.conditions)
        LIFESTYLE_CACHE[cache_key] = fallback_result.model_dump()
        return fallback_result