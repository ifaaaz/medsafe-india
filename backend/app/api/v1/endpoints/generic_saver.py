import os
from typing import List
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from google.genai.errors import APIError
from fastapi import APIRouter, HTTPException

load_dotenv()

router = APIRouter(prefix="/api/v1/generic-saver", tags=["Generic Cost Saver (Experimental)"])

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(
    api_key=api_key,
    http_options={"api_version": "v1beta"}
) if api_key else None

FALLBACK_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"]


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


@router.post("/compare", response_model=GenericComparisonResponse)
def compare_jan_aushadhi_prices(payload: GenericComparisonRequest):
    if not client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

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

    last_error = None
    for model_name in FALLBACK_MODELS:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=GenericComparisonResponse,
                    temperature=0.1,
                ),
            )
            data = GenericComparisonResponse.model_validate_json(response.text)

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
            data.disclaimer = "Indicative MRP comparison based on PMBJP Jan Aushadhi & retail averages. Confirm exact pack size with a licensed pharmacist."
            return data
        except APIError as e:
            if e.code in (429, 404, 503):
                last_error = e
                continue
            raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

    raise HTTPException(status_code=429, detail=f"All fallback models exhausted: {str(last_error)}")