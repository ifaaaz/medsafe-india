from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base  # Adjust import based on your base setup

class CanonicalIngredient(Base):
    __tablename__ = "canonical_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    synonyms = relationship("IngredientSynonym", back_populates="canonical_ingredient", cascade="all, delete-orphan")


class IngredientSynonym(Base):
    __tablename__ = "ingredient_synonyms"

    id = Column(Integer, primary_key=True, index=True)
    canonical_id = Column(Integer, ForeignKey("canonical_ingredients.id", ondelete="CASCADE"), nullable=False)
    synonym_text = Column(String(255), unique=True, index=True, nullable=False)
    source = Column(String(100), default="manual_admin")  # e.g., 'manual_admin', 'system_seed', 'fda_import'
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    canonical_ingredient = relationship("CanonicalIngredient", back_populates="synonyms")