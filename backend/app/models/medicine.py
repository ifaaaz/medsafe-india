import re
from sqlalchemy import Column, Integer, String, Text, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

medicine_ingredient_association = Table(
    'medicine_ingredient_association',
    Base.metadata,
    Column('medicine_id', Integer, ForeignKey('medicines.id'), primary_key=True),
    Column('ingredient_id', Integer, ForeignKey('active_ingredients.id'), primary_key=True)
)


class ActiveIngredient(Base):
    __tablename__ = 'active_ingredients'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)


class MedicineBrand(Base):
    __tablename__ = 'medicines'

    id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String, nullable=False, index=True)
    normalized_brand_name = Column(String, nullable=False, index=True)
    generic_name = Column(String, nullable=True)
    manufacturer = Column(String, nullable=True)
    strength = Column(String, nullable=True)
    dosage_form = Column(String, nullable=False, default="Tablet")
    therapeutic_uses = Column(Text, nullable=True)

    ingredients = relationship(
        'ActiveIngredient',
        secondary=medicine_ingredient_association,
        backref='medicines'
    )


# Alias Medicine to MedicineBrand for compatibility across services
Medicine = MedicineBrand