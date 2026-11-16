import csv
import json
import io
import re
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.medicine import MedicineBrand, ActiveIngredient, DataSource

def normalize_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text.strip().lower())

def normalize_dosage_form(form: str) -> str:
    if not form:
        return "Unknown"
    f = form.strip().lower()
    if f in ["tab", "tablets", "tablet"]:
        return "Tablet"
    if f in ["cap", "caps", "capsule", "capsules"]:
        return "Capsule"
    if f in ["syrup", "syr", "liquid"]:
        return "Syrup"
    if f in ["inj", "injection", "vial"]:
        return "Injection"
    return form.strip().title()

def normalize_strength(strength: str) -> str:
    if not strength:
        return ""
    # Standardize spaces around units
    s = strength.strip().lower()
    s = re.sub(r'\s*(mg|g|ml|mcg|iu)\b', r'\1', s)
    return s

def normalize_manufacturer(mfg: str) -> str:
    if not mfg:
        return "Unknown Manufacturer"
    return mfg.strip().title()

class IngestionPipeline:
    def __init__(self, db: Session):
        self.db = db

    def process_payload(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        records = []
        warnings = []

        try:
            if filename.endswith('.csv'):
                decoded = file_content.decode('utf-8-sig')
                reader = csv.DictReader(io.StringIO(decoded))
                records = list(reader)
            elif filename.endswith('.json'):
                decoded = file_content.decode('utf-8')
                data = json.loads(decoded)
                if isinstance(data, list):
                    records = data
                elif isinstance(data, dict) and 'records' in data:
                    records = data['records']
                else:
                    raise ValueError("JSON must be a list of records or contain a 'records' key.")
            else:
                raise ValueError("Unsupported file format. Please upload CSV or JSON.")
        except Exception as e:
            return {
                "total_records": 0,
                "successful_records": 0,
                "rejected_records": 0,
                "duplicates": 0,
                "missing_fields": 0,
                "conflicts": 0,
                "warnings": [f"File parsing error: {str(e)}"]
            }

        total_records = len(records)
        successful_records = 0
        rejected_records = 0
        duplicates = 0
        missing_fields_count = 0
        conflicts = 0
        pipeline_warnings = []

        for idx, row in enumerate(records, start=1):
            # 1. Field Extraction & Mapping (supporting multiple key variants)
            brand_name = row.get('brand_name') or row.get('brand') or row.get('name')
            generic_name = row.get('generic_name') or row.get('generic') or row.get('composition')
            ingredient_str = row.get('ingredient') or row.get('composition') or generic_name
            strength = row.get('strength') or ''
            dosage_form = row.get('dosage_form') or row.get('form') or ''
            manufacturer = row.get('manufacturer') or row.get('mfg') or ''
            source = row.get('source') or 'Uploaded Dataset'
            source_record_id = row.get('source_record_id') or row.get('id') or f"row-{idx}"

            # 2. Validation
            if not brand_name or not (generic_name or ingredient_str):
                missing_fields_count += 1
                rejected_records += 1
                pipeline_warnings.append(f"Row {idx}: Missing required brand_name or generic/ingredient fields.")
                continue

            # 3. Normalization
            norm_brand = normalize_text(brand_name)
            norm_form = normalize_dosage_form(dosage_form)
            norm_strength = normalize_strength(strength)
            norm_mfg = normalize_manufacturer(manufacturer)

            # 4. Duplicate & Conflict Detection
            existing_record = None
            if source_record_id:
                existing_record = self.db.query(MedicineBrand).filter_by(source_record_id=str(source_record_id)).first()
            
            if not existing_record:
                # Check by brand name + manufacturer + strength combo
                existing_record = self.db.query(MedicineBrand).filter(
                    MedicineBrand.normalized_brand_name == norm_brand,
                    MedicineBrand.manufacturer == norm_mfg,
                    MedicineBrand.strength == norm_strength
                ).first()

            if existing_record:
                # Check if data conflicts (e.g., different generic composition for same brand/strength/mfg)
                if normalize_text(existing_record.generic_name) != normalize_text(generic_name):
                    conflicts += 1
                    rejected_records += 1
                    pipeline_warnings.append(f"Row {idx} ('{brand_name}'): Conflict detected with existing verified record (Different generic composition). Not overwritten.")
                    continue
                else:
                    duplicates += 1
                    pipeline_warnings.append(f"Row {idx} ('{brand_name}'): Exact duplicate match found. Skipped.")
                    continue

            # 5. Save Verified Record
            try:
                new_medicine = MedicineBrand(
                    brand_name=brand_name.strip(),
                    generic_name=generic_name.strip(),
                    normalized_brand_name=norm_brand,
                    manufacturer=norm_mfg,
                    dosage_form=norm_form,
                    strength=norm_strength,
                    source_reference=source.strip(),
                    source_record_id=str(source_record_id)
                )

                # Link or create active ingredients
                ing_list = [i.strip() for i in ingredient_str.replace('+', ',').split(',')]
                for ing_name in ing_list:
                    if not ing_name:
                        continue
                    db_ing = self.db.query(ActiveIngredient).filter_by(name=ing_name.strip().title()).first()
                    if not db_ing:
                        db_ing = ActiveIngredient(name=ing_name.strip().title(), description="Imported active ingredient")
                        self.db.add(db_ing)
                        self.db.flush()
                    new_medicine.ingredients.append(db_ing)

                self.db.add(new_medicine)
                self.db.commit()
                successful_records += 1

            except Exception as db_err:
                self.db.rollback()
                rejected_records += 1
                pipeline_warnings.append(f"Row {idx} ('{brand_name}'): Database commit error - {str(db_err)}")

        return {
            "total_records": total_records,
            "successful_records": successful_records,
            "rejected_records": rejected_records,
            "duplicates": duplicates,
            "missing_fields": missing_fields_count,
            "conflicts": conflicts,
            "warnings": pipeline_warnings[:50]  # Limit warning list length
        }