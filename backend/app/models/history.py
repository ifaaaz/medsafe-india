from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base


class UserMedicationHistory(Base):
    __tablename__ = "user_medication_history"

    id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String, nullable=False, index=True)
    generic_name = Column(String, nullable=True)
    strength = Column(String, nullable=True)
    active_ingredients = Column(Text, nullable=True)  # Stored as comma-separated string, e.g. "Paracetamol, Caffeine"
    source_action = Column(String, nullable=False, default="Manual Entry")  # "Medicine Lookup", "Prescription Scan", or "Manual Entry"
    notes = Column(String, nullable=True)  # e.g. "Daily at 9:00 AM" or "Scanned via Rx"
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))