from pydantic import BaseModel
from typing import List, Optional

class InteractionCheckRequest(BaseModel):
    medicine_ids: List[int]

class InteractionFinding(BaseModel):
    ingredient_a: str
    ingredient_b: str
    severity: str
    interaction_description: str
    clinical_effect: Optional[str] = None
    management_information: Optional[str] = None
    source_name: Optional[str] = None

class InteractionCheckResponse(BaseModel):
    has_interactions: bool
    interactions: List[InteractionFinding]
    disclaimer: str = "Please verify this medication combination with a doctor or pharmacist where appropriate. This tool does not replace professional medical advice."