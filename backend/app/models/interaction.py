from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class DrugInteraction(Base):
    __tablename__ = 'drug_interactions'

    id = Column(Integer, primary_key=True, index=True)
    ingredient_a_id = Column(Integer, ForeignKey('active_ingredients.id'), nullable=False)
    ingredient_b_id = Column(Integer, ForeignKey('active_ingredients.id'), nullable=False)
    severity = Column(String, nullable=False)
    interaction_description = Column(String, nullable=True)
    clinical_effect = Column(String, nullable=True)
    management_information = Column(String, nullable=True)
    evidence_level = Column(String, nullable=True)
    source_name = Column(String, nullable=True)