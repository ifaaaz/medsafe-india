from typing import Dict, List, Literal
from pydantic import BaseModel, Field
from google.genai import types
from fastapi import APIRouter

from app.services.ai_fallback_service import generate_with_key_rotation

router = APIRouter(prefix="/api/v1/lifestyle-warnings", tags=["Lifestyle & Condition Warnings"])

# Bump cache version whenever clinical rules update so stale empty results never stick
CACHE_VERSION = "v2"
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


BRAND_TO_GENERIC_MAP = {
    "warf": "warfarin",
    "acitrom": "acenocoumarol",
    "ecosprin": "aspirin",
    "dolo": "paracetamol",
    "crocin": "paracetamol",
    "calpol": "paracetamol",
    "telma": "telmisartan",
    "pan": "pantoprazole",
    "pantop": "pantoprazole",
    "omez": "omeprazole",
    "atorva": "atorvastatin",
    "clopilet": "clopidogrel",
    "flagyl": "metronidazole",
    "azithral": "azithromycin",
}


def _deduplicate_medicines(medicines: List[str]) -> List[str]:
    cleaned = []
    seen_lower = set()
    for m in medicines:
        val = m.strip()
        if val and val.lower() not in seen_lower:
            seen_lower.add(val.lower())
            cleaned.append(val)

    covered_generics = set()
    for med in cleaned:
        m_low = med.lower()
        for brand_prefix, generic_name in BRAND_TO_GENERIC_MAP.items():
            if brand_prefix in m_low and generic_name not in m_low:
                covered_generics.add(generic_name)

    return [med for med in cleaned if med.lower() not in covered_generics]


def _run_clinical_rules(medicines: List[str], conditions: List[str]) -> LifestyleWarningResponse:
    """Deterministic Indian clinical pharmacology rules across common drugs & patient conditions."""
    alerts: List[ConditionAlert] = []
    tips: List[FoodTimingTip] = []
    cond_set = {c.lower() for c in conditions}

    for med in medicines:
        m_low = med.lower()
        is_warfarin = any(k in m_low for k in ["warf", "acitrom", "acenocoumarol"])
        is_nsaid_or_aspirin = any(
            k in m_low for k in ["combiflam", "ibuprofen", "zerodol", "aceclofenac", "ecosprin", "aspirin", "diclofenac", "naproxen", "voveran"]
        )
        is_paracetamol = any(k in m_low for k in ["dolo", "paracetamol", "crocin", "calpol"])
        is_arb_or_acei = any(k in m_low for k in ["telma", "telmisartan", "losartan", "olmesartan", "enalapril", "ramipril"])
        is_statin = any(k in m_low for k in ["atorva", "atorvastatin", "rosuva", "rosuvastatin"])
        is_metronidazole = any(k in m_low for k in ["flagyl", "metronidazole", "tinidazole", "ornidazole"])
        is_antibiotic = any(k in m_low for k in ["augmentin", "amoxicillin", "clavulanate", "azithral", "azithromycin", "cipro", "oflox"])

        # 1. Alcohol Use
        if any("alcohol" in c for c in cond_set):
            if is_metronidazole:
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Alcohol",
                        severity="CONTRAINDICATED",
                        warning_summary="Causes an acute disulfiram-like reaction with severe nausea, vomiting, flushing, headache, and palpitations.",
                        actionable_advice="Strictly avoid all alcohol during treatment and for at least 72 hours after completing the course.",
                    )
                )
            elif is_warfarin:
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Alcohol",
                        severity="HIGH_RISK",
                        warning_summary="Alcohol disrupts hepatic Warfarin metabolism, causing unpredictable INR spikes and major hemorrhage risk.",
                        actionable_advice="Avoid alcohol completely while stabilized on Warfarin/Acenocoumarol therapy.",
                    )
                )
            elif is_nsaid_or_aspirin or is_paracetamol:
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Alcohol",
                        severity="HIGH_RISK",
                        warning_summary="Alcohol amplifies liver toxicity (Paracetamol) and sharply increases stomach ulcer/bleeding risk (NSAIDs/Aspirin).",
                        actionable_advice="Do not consume alcohol while taking analgesics or anti-inflammatory medicines.",
                    )
                )
            elif is_antibiotic:
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Alcohol",
                        severity="MODERATE_CAUTION",
                        warning_summary="Alcohol worsens antibiotic-associated nausea, dehydration, and hepatic stress while slowing recovery.",
                        actionable_advice="Avoid alcohol until your antibiotic course is finished.",
                    )
                )

        # 2. Pregnancy / Breastfeeding
        if any("pregnancy" in c for c in cond_set):
            if is_warfarin:
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Pregnancy / Breastfeeding",
                        severity="CONTRAINDICATED",
                        warning_summary="Crosses the placenta and causes fetal warfarin syndrome (teratogenicity) and severe fetal/maternal hemorrhage.",
                        actionable_advice="Strictly contraindicated in pregnancy; consult an obstetrician/cardiologist for Low Molecular Weight Heparin (LMWH).",
                    )
                )
            elif is_arb_or_acei or is_statin or is_nsaid_or_aspirin:
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Pregnancy / Breastfeeding",
                        severity="CONTRAINDICATED",
                        warning_summary="Known teratogenic or fetal renal/cardiovascular toxicity risk during pregnancy.",
                        actionable_advice="Discontinue only under immediate obstetric guidance and switch to a pregnancy-safe alternative.",
                    )
                )
            elif is_antibiotic:
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Pregnancy / Breastfeeding",
                        severity="MODERATE_CAUTION",
                        warning_summary="Generally compatible in pregnancy when clinically indicated, but clavulanate/macrolide choice requires OB-GYN confirmation.",
                        actionable_advice="Confirm trimester-specific dosing with your obstetrician before taking.",
                    )
                )

        # 3. Gastric Ulcer / Acidity
        if any("gastric" in c or "ulcer" in c for c in cond_set):
            if is_warfarin or is_nsaid_or_aspirin:
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Gastric Ulcer",
                        severity="CONTRAINDICATED",
                        warning_summary="High risk of life-threatening upper gastrointestinal bleeding or ulcer perforation.",
                        actionable_advice="Avoid systemic NSAIDs and seek urgent physician review + PPI gastroprotection.",
                    )
                )

        # 4. Kidney Disease
        if any("kidney" in c for c in cond_set):
            if is_nsaid_or_aspirin or is_arb_or_acei:
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Kidney Disease",
                        severity="HIGH_RISK",
                        warning_summary="Can reduce renal blood flow, worsen eGFR, or trigger hyperkalemia in chronic kidney disease.",
                        actionable_advice="Requires renal function (creatinine/potassium) check and dose adjustment by your doctor.",
                    )
                )
            elif is_antibiotic:
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Kidney Disease",
                        severity="MODERATE_CAUTION",
                        warning_summary="Renally excreted antibiotics may require interval adjustment if eGFR is below 30 mL/min.",
                        actionable_advice="Verify eGFR-adjusted dosing frequency with your prescribing physician.",
                    )
                )

        # 5. Liver Disease
        if any("liver" in c for c in cond_set):
            if is_warfarin or is_paracetamol or is_nsaid_or_aspirin or is_statin:
                alerts.append(
                    ConditionAlert(
                        medicine_name=med,
                        factor="Liver Disease",
                        severity="HIGH_RISK",
                        warning_summary="Hepatically cleared; impaired liver metabolism increases bleeding/INR instability or hepatotoxicity risk.",
                        actionable_advice="Requires reduced dosing (e.g., Paracetamol < 2g/day) and liver function/INR monitoring.",
                    )
                )

        # Meal timing guidance
        if is_warfarin:
            tips.append(
                FoodTimingTip(
                    medicine_name=med,
                    timing_instruction="Take at the exact same time every evening (with or without food).",
                    food_avoidance="Sudden spikes in Vitamin K leafy greens (palak/spinach, broccoli, cabbage, green tea), cranberry juice, and alcohol.",
                )
            )
        elif any(k in m_low for k in ["pan", "pantop", "omez", "omeprazole", "rabeprazole"]):
            tips.append(
                FoodTimingTip(
                    medicine_name=med,
                    timing_instruction="Take 30–45 minutes before breakfast on an empty stomach.",
                    food_avoidance="Spicy, acidic foods and excessive caffeine.",
                )
            )
        elif "augmentin" in m_low or "amoxicillin" in m_low:
            tips.append(
                FoodTimingTip(
                    medicine_name=med,
                    timing_instruction="Take at the start of a meal to optimize Clavulanate absorption and prevent gastric upset.",
                    food_avoidance="Alcohol and skipping scheduled doses.",
                )
            )
        elif is_nsaid_or_aspirin:
            tips.append(
                FoodTimingTip(
                    medicine_name=med,
                    timing_instruction="Take immediately after a full meal or glass of milk to protect the stomach lining.",
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
        overall_lifestyle_note="Follow exact meal-timing instructions, maintain dietary consistency, and review all flagged condition alerts with your doctor.",
    )


@router.post("/check", response_model=LifestyleWarningResponse)
def check_lifestyle_and_conditions(payload: LifestyleWarningRequest):
    clean_medicines = _deduplicate_medicines(payload.medicines)
    if not clean_medicines:
        return LifestyleWarningResponse(
            condition_alerts=[],
            food_timing_tips=[],
            overall_lifestyle_note="Add medicines to view food timing and condition warnings.",
        )

    meds_key = ",".join(sorted(m.strip().lower() for m in clean_medicines))
    cond_key = ",".join(sorted(c.strip().lower() for c in payload.conditions))
    cache_key = f"{CACHE_VERSION}|{meds_key}|{cond_key}"

    if cache_key in LIFESTYLE_CACHE:
        return LifestyleWarningResponse(**LIFESTYLE_CACHE[cache_key])

    # Always compute deterministic clinical rules first so known high-risk drugs NEVER miss an alert
    rule_based = _run_clinical_rules(clean_medicines, payload.conditions)

    selected_factors = payload.conditions if payload.conditions else ["General Food & Drink Interactions"]
    prompt = f"""
    You are an Indian clinical pharmacology safety assistant.
    Analyze these prescribed medicines: {clean_medicines}
    Against these patient lifestyle/medical factors: {selected_factors}

    Instructions:
1. 'condition_alerts': Evaluate EVERY selected factor in {payload.conditions} against {clean_medicines}. Include ALL genuine clinical risks (e.g. Warfarin + Alcohol/Pregnancy/Gastric Ulcer/Liver Disease; NSAIDs + Alcohol/Gastric Ulcer/Pregnancy/Kidney; Antibiotics + Alcohol/Pregnancy).
2. 'food_timing_tips': For EVERY medicine in {clean_medicines}, provide accurate Indian meal-timing guidance and specific food/beverage interactions (e.g. Vitamin K leafy greens for Warfarin).
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
        ai_result = LifestyleWarningResponse.model_validate_json(response.text)

        # Merge deterministic alerts if AI missed any selected condition-medicine risk
        existing_pairs = {(a.medicine_name.lower(), a.factor.lower()) for a in ai_result.condition_alerts}
        merged_alerts = list(ai_result.condition_alerts)
        for r_alert in rule_based.condition_alerts:
            if (r_alert.medicine_name.lower(), r_alert.factor.lower()) not in existing_pairs:
                merged_alerts.append(r_alert)

        final_result = LifestyleWarningResponse(
            condition_alerts=merged_alerts,
            food_timing_tips=ai_result.food_timing_tips if ai_result.food_timing_tips else rule_based.food_timing_tips,
            overall_lifestyle_note=ai_result.overall_lifestyle_note or rule_based.overall_lifestyle_note,
        )
        LIFESTYLE_CACHE[cache_key] = final_result.model_dump()
        return final_result
    except Exception:
        LIFESTYLE_CACHE[cache_key] = rule_based.model_dump()
        return rule_based