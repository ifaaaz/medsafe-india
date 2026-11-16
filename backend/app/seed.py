import sys
import os
import re

# Allow script to import app modules cleanly
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.medicine import MedicineBrand, ActiveIngredient
from app.models.interaction import DrugInteraction

def normalize_name(text: str) -> str:
    return re.sub(r'[^a-z0-9]', '', text.lower()) if text else ""

def get_or_create_ingredient(db, name):
    existing = db.query(ActiveIngredient).filter_by(name=name).first()
    if existing:
        return existing
    new_ing = ActiveIngredient(name=name)
    db.add(new_ing)
    db.flush()
    return new_ing

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Seeding/checking active ingredients...")
        paracetamol = get_or_create_ingredient(db, "Paracetamol")
        ibuprofen = get_or_create_ingredient(db, "Ibuprofen")
        pantoprazole = get_or_create_ingredient(db, "Pantoprazole")
        domperidone = get_or_create_ingredient(db, "Domperidone")
        warfarin = get_or_create_ingredient(db, "Warfarin")
        aspirin = get_or_create_ingredient(db, "Aspirin")
        db.commit()

        print("Seeding/checking medicine brands...")
        brands_data = [
            {
                "brand_name": "Paracip 500",
                "generic_name": "Paracetamol Tablet",
                "manufacturer": "Cipla Ltd",
                "strength": "500mg",
                "ingredients": [paracetamol]
            },
            {
                "brand_name": "Combiflam",
                "generic_name": "Ibuprofen + Paracetamol",
                "manufacturer": "Sanofi India",
                "strength": "400mg / 325mg",
                "ingredients": [ibuprofen, paracetamol]
            },
            {
                "brand_name": "Pan-D",
                "generic_name": "Pantoprazole + Domperidone",
                "manufacturer": "Alkem Laboratories",
                "strength": "40mg / 30mg",
                "ingredients": [pantoprazole, domperidone]
            },
            {
                "brand_name": "Ecosprin 75",
                "generic_name": "Aspirin",
                "manufacturer": "USV Ltd",
                "strength": "75mg",
                "ingredients": [aspirin]
            }
        ]

        for b_data in brands_data:
            existing_brand = db.query(MedicineBrand).filter_by(brand_name=b_data["brand_name"]).first()
            if not existing_brand:
                brand = MedicineBrand(
                    brand_name=b_data["brand_name"],
                    normalized_brand_name=normalize_name(b_data["brand_name"]),
                    generic_name=b_data["generic_name"],
                    manufacturer=b_data["manufacturer"],
                    strength=b_data["strength"]
                )
                brand.ingredients.extend(b_data["ingredients"])
                db.add(brand)
        db.commit()

        print("Seeding/checking drug-drug interactions...")
        id_a, id_b = sorted([ibuprofen.id, aspirin.id])
        existing_interaction = db.query(DrugInteraction).filter_by(
            ingredient_a_id=id_a,
            ingredient_b_id=id_b
        ).first()

        if not existing_interaction:
            interaction1 = DrugInteraction(
                ingredient_a_id=id_a,
                ingredient_b_id=id_b,
                severity="Major",
                interaction_description="Aspirin combined with Ibuprofen increases risk of severe GI bleeding and reduces cardioprotective effect of Aspirin.",
                clinical_effect="Increased bleeding risk and decreased aspirin efficiency.",
                management_information="Avoid concomitant use; consult prescribing physician for alternative analgesics.",
                evidence_level="Established",
                source_name="MedSafe Clinical Knowledgebase"
            )
            db.add(interaction1)
            db.commit()

        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()