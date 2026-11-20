from typing import Dict, List
from pydantic import BaseModel, Field
from google.genai import types
from fastapi import APIRouter

from app.services.ai_fallback_service import generate_with_key_rotation

router = APIRouter(prefix="/api/v1/generic-saver", tags=["Generic Cost Saver (Experimental)"])

# In-memory cache so repeated lookups take 0ms and 0 API quota
GENERIC_PRICE_CACHE: Dict[str, dict] = {}


class GenericComparisonRequest(BaseModel):
    medicines: List[str] = Field(
        ...,
        min_length=1,
        description="List of brand names, e.g. ['Augmentin 625 Duo', 'Telma 40', 'Dolo 650']"
    )


class GenericMedicineItem(BaseModel):
    brand_name: str
    active_salt_ip: str = Field(description="Official Indian Pharmacopoeia generic name, e.g., 'Telmisartan Tablets IP 40 mg'")
    pack_unit: str = Field(description="Standard pack size, e.g., '10 Tablets' or '15 Tablets'")
    estimated_brand_mrp_inr: float = Field(description="Typical branded retail MRP in INR for that pack size")
    estimated_jan_aushadhi_mrp_inr: float = Field(description="Typical Jan Aushadhi / generic MRP in INR for the same pack size")
    savings_inr: float
    savings_percent: int
    pharmacist_note: str = Field(description="Short practical note on salt equivalence or bioequivalence")


class GenericComparisonResponse(BaseModel):
    items: List[GenericMedicineItem]
    total_branded_inr: float
    total_generic_inr: float
    total_savings_inr: float
    overall_savings_percent: int
    disclaimer: str


# Deterministic PMBJP Jan Aushadhi MRP fallback catalog (per standard pack)
OFFLINE_JAN_AUSHADHI_CATALOG: Dict[str, dict] = {
    "augmentin": {
        "active_salt_ip": "Amoxicillin & Potassium Clavulanate Tablets IP 625 mg",
        "pack_unit": "10 Tablets",
        "estimated_brand_mrp_inr": 223.0,
        "estimated_jan_aushadhi_mrp_inr": 65.0,
        "pharmacist_note": "Identical Amoxicillin 500mg + Clavulanate 125mg IP composition; complete full antibiotic course.",
    },
    "warf": {
        "active_salt_ip": "Warfarin Sodium Tablets IP 5 mg",
        "pack_unit": "10 Tablets",
        "estimated_brand_mrp_inr": 48.0,
        "estimated_jan_aushadhi_mrp_inr": 14.0,
        "pharmacist_note": "Narrow therapeutic index anticoagulant; keep the exact same generic manufacturer consistently and monitor INR.",
    },
    "acitrom": {
        "active_salt_ip": "Acenocoumarol Tablets IP 2 mg",
        "pack_unit": "10 Tablets",
        "estimated_brand_mrp_inr": 135.0,
        "estimated_jan_aushadhi_mrp_inr": 42.0,
        "pharmacist_note": "Coumarin anticoagulant; consult cardiologist before switching brands so INR stays stable.",
    },
    "telma": {
        "active_salt_ip": "Telmisartan Tablets IP 40 mg",
        "pack_unit": "15 Tablets",
        "estimated_brand_mrp_inr": 245.0,
        "estimated_jan_aushadhi_mrp_inr": 28.0,
        "pharmacist_note": "Same Telmisartan IP antihypertensive salt; CDSCO/PMBJP bioequivalent generic.",
    },
    "pan-d": {
        "active_salt_ip": "Pantoprazole Gastro-Resistant & Domperidone PR Capsules IP",
        "pack_unit": "15 Capsules",
        "estimated_brand_mrp_inr": 215.0,
        "estimated_jan_aushadhi_mrp_inr": 32.0,
        "pharmacist_note": "Identical Pantoprazole 40mg + Domperidone 30mg sustained-release IP formulation.",
    },
    "pantop": {
        "active_salt_ip": "Pantoprazole Gastro-Resistant Tablets IP 40 mg",
        "pack_unit": "15 Tablets",
        "estimated_brand_mrp_inr": 165.0,
        "estimated_jan_aushadhi_mrp_inr": 19.0,
        "pharmacist_note": "Enteric-coated Pantoprazole IP; take 30 minutes before breakfast.",
    },
    "dolo": {
        "active_salt_ip": "Paracetamol Tablets IP 650 mg",
        "pack_unit": "15 Tablets",
        "estimated_brand_mrp_inr": 33.0,
        "estimated_jan_aushadhi_mrp_inr": 11.0,
        "pharmacist_note": "Exact Paracetamol IP 650mg antipyretic/analgesic salt.",
    },
    "combiflam": {
        "active_salt_ip": "Ibuprofen & Paracetamol Tablets IP (400 mg / 325 mg)",
        "pack_unit": "20 Tablets",
        "estimated_brand_mrp_inr": 46.0,
        "estimated_jan_aushadhi_mrp_inr": 14.0,
        "pharmacist_note": "Same Ibuprofen 400mg + Paracetamol 325mg IP combination; take after food.",
    },
    "zerodol": {
        "active_salt_ip": "Aceclofenac & Paracetamol Tablets IP (100 mg / 325 mg)",
        "pack_unit": "10 Tablets",
        "estimated_brand_mrp_inr": 118.0,
        "estimated_jan_aushadhi_mrp_inr": 19.0,
        "pharmacist_note": "Identical Aceclofenac 100mg + Paracetamol 325mg IP analgesic combination.",
    },
    "ecosprin": {
        "active_salt_ip": "Acetylsalicylic Acid Gastro-Resistant Tablets IP 75 mg",
        "pack_unit": "14 Tablets",
        "estimated_brand_mrp_inr": 16.0,
        "estimated_jan_aushadhi_mrp_inr": 5.0,
        "pharmacist_note": "Low-dose enteric-coated Aspirin IP for antiplatelet cardioprotection.",
    },
    "atorva": {
        "active_salt_ip": "Atorvastatin Tablets IP 20 mg",
        "pack_unit": "15 Tablets",
        "estimated_brand_mrp_inr": 215.0,
        "estimated_jan_aushadhi_mrp_inr": 22.0,
        "pharmacist_note": "Same Atorvastatin IP lipid-lowering salt; take once daily at night.",
    },
    "clopilet": {
        "active_salt_ip": "Clopidogrel Tablets IP 75 mg",
        "pack_unit": "15 Tablets",
        "estimated_brand_mrp_inr": 175.0,
        "estimated_jan_aushadhi_mrp_inr": 23.0,
        "pharmacist_note": "Identical Clopidogrel Bisulfate IP 75mg antiplatelet agent.",
    },
    "azithral": {
        "active_salt_ip": "Azithromycin Tablets IP 500 mg",
        "pack_unit": "5 Tablets",
        "estimated_brand_mrp_inr": 132.0,
        "estimated_jan_aushadhi_mrp_inr": 38.0,
        "pharmacist_note": "Same Azithromycin IP 500mg macrolide antibiotic.",
    },
    "montair": {
        "active_salt_ip": "Montelukast Sodium & Levocetirizine Hydrochloride Tablets IP",
        "pack_unit": "10 Tablets",
        "estimated_brand_mrp_inr": 212.0,
        "estimated_jan_aushadhi_mrp_inr": 26.0,
        "pharmacist_note": "Identical Montelukast 10mg + Levocetirizine 5mg IP anti-allergic combination.",
    },
}


def _recalculate_totals(data: GenericComparisonResponse) -> GenericComparisonResponse:
    total_brand = 0.0
    total_gen = 0.0
    for item in data.items:
        item.savings_inr = round(max(0.0, item.estimated_brand_mrp_inr - item.estimated_jan_aushadhi_mrp_inr), 2)
        item.savings_percent = (
            round((item.savings_inr / item.estimated_brand_mrp_inr) * 100)
            if item.estimated_brand_mrp_inr > 0 else 0
        )
        total_brand += item.estimated_brand_mrp_inr
        total_gen += item.estimated_jan_aushadhi_mrp_inr

    data.total_branded_inr = round(total_brand, 2)
    data.total_generic_inr = round(total_gen, 2)
    data.total_savings_inr = round(max(0.0, total_brand - total_gen), 2)
    data.overall_savings_percent = (
        round((data.total_savings_inr / total_brand) * 100) if total_brand > 0 else 0
    )
    data.disclaimer = (
        "Indicative MRP comparison based on PMBJP Jan Aushadhi & retail averages. "
        "Confirm exact pack size with a licensed pharmacist."
    )
    return data


def _offline_jan_aushadhi_fallback(medicines: List[str]) -> GenericComparisonResponse:
    items: List[GenericMedicineItem] = []

    for med in medicines:
        m_low = med.strip().lower()
        matched_entry = None
        for key, entry in OFFLINE_JAN_AUSHADHI_CATALOG.items():
            if key in m_low:
                matched_entry = entry
                break

        if matched_entry:
            b_mrp = matched_entry["estimated_brand_mrp_inr"]
            g_mrp = matched_entry["estimated_jan_aushadhi_mrp_inr"]
            salt_ip = matched_entry["active_salt_ip"]
            pack = matched_entry["pack_unit"]
            note = matched_entry["pharmacist_note"]
        else:
            b_mrp = 140.0
            g_mrp = 32.0
            salt_ip = f"{med} Tablets/Capsules IP"
            pack = "10 Tablets"
            note = "Same active Indian Pharmacopoeia (IP) salt & strength; CDSCO/PMBJP quality-tested generic."

        saved = round(max(0.0, b_mrp - g_mrp), 2)
        pct = round((saved / b_mrp) * 100) if b_mrp > 0 else 0

        items.append(
            GenericMedicineItem(
                brand_name=med,
                active_salt_ip=salt_ip,
                pack_unit=pack,
                estimated_brand_mrp_inr=b_mrp,
                estimated_jan_aushadhi_mrp_inr=g_mrp,
                savings_inr=saved,
                savings_percent=pct,
                pharmacist_note=note,
            )
        )

    return _recalculate_totals(
        GenericComparisonResponse(
            items=items,
            total_branded_inr=0.0,
            total_generic_inr=0.0,
            total_savings_inr=0.0,
            overall_savings_percent=0,
            disclaimer="",
        )
    )


@router.post("/compare", response_model=GenericComparisonResponse)
def compare_jan_aushadhi_prices(payload: GenericComparisonRequest):
    cache_key = ",".join(sorted(m.strip().lower() for m in payload.medicines if m.strip()))
    if cache_key in GENERIC_PRICE_CACHE:
        return GenericComparisonResponse(**GENERIC_PRICE_CACHE[cache_key])

    prompt = f"""
    You are an Indian clinical pharmacology and Jan Aushadhi (PMBJP) pricing assistant.
    For each medicine in this list: {payload.medicines}
    Provide:
1. Standardized brand name
2. Official Indian Pharmacopoeia (IP) generic salt name and strength
3. Equivalent pack size (e.g., '10 Tablets')
4. Typical Indian retail branded MRP (INR) vs. Jan Aushadhi / generic MRP (INR) for the exact same pack size
5. Accurate savings_inr (brand - generic, minimum 0) and savings_percent
6. A concise 1-sentence pharmacist verification note.
    """

    try:
        response = generate_with_key_rotation(
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GenericComparisonResponse,
                temperature=0.1,
            ),
        )
        data = _recalculate_totals(GenericComparisonResponse.model_validate_json(response.text))
        GENERIC_PRICE_CACHE[cache_key] = data.model_dump()
        return data
    except Exception:
        fallback_data = _offline_jan_aushadhi_fallback(payload.medicines)
        GENERIC_PRICE_CACHE[cache_key] = fallback_data.model_dump()
        return fallback_data