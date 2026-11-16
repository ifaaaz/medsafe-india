from sqlalchemy.orm import Session
from difflib import SequenceMatcher
import re
from app.models.medicine import Medicine

FALLBACK_MEDICINES = [
    {
        "id": 1,
        "brand_name": "Crocin 650",
        "generic_name": "Paracetamol",
        "manufacturer": "GSK Pharmaceuticals India",
        "dosage_form": "Tablet",
        "strength": "650mg",
        "active_ingredients": ["Paracetamol"],
        "aliases": ["Crocin", "Crocin Advance"]
    },
    {
        "id": 2,
        "brand_name": "Crocin 500",
        "generic_name": "Paracetamol",
        "manufacturer": "GSK Pharmaceuticals India",
        "dosage_form": "Tablet",
        "strength": "500mg",
        "active_ingredients": ["Paracetamol"],
        "aliases": ["Crocin"]
    },
    {
        "id": 3,
        "brand_name": "Pan-D",
        "generic_name": "Pantoprazole + Domperidone",
        "manufacturer": "Alkem Laboratories",
        "dosage_form": "Capsule",
        "strength": "40mg/30mg",
        "active_ingredients": ["Pantoprazole", "Domperidone"],
        "aliases": ["Pantocid D", "Pan D Capsule"]
    }
]

def normalize_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r'[^a-zA-Z0-9\s]', '', text).lower().strip()

def calculate_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()

def search_medicines(db: Session, query: str, skip: int = 0, limit: int = 10):
    query_raw = query.strip()
    query_norm = normalize_text(query_raw)
    
    if not query_norm:
        return {"items": [], "total": 0, "skip": skip, "limit": limit}

    # Fetch from DB, fallback to static list if empty
    medicines = db.query(Medicine).all()
    source_list = []
    
    if medicines:
        for med in medicines:
            source_list.append({
                "id": med.id,
                "brand_name": med.brand_name,
                "generic_name": med.generic_name,
                "manufacturer": med.manufacturer,
                "dosage_form": med.dosage_form,
                "strength": med.strength,
                "active_ingredients": getattr(med, "active_ingredients", []),
                "aliases": getattr(med, "aliases", []) or []
            })
    else:
        source_list = FALLBACK_MEDICINES

    scored_results = []

    for med in source_list:
        brand_name = med.get("brand_name", "")
        generic_name = med.get("generic_name", "")
        manufacturer = med.get("manufacturer", "")
        aliases = med.get("aliases", [])
        if isinstance(aliases, str):
            aliases = [aliases]

        fields_to_check = [
            ("brand", brand_name),
            ("generic", generic_name),
            ("manufacturer", manufacturer),
        ] + [("alias", a) for a in aliases]

        best_match_type = None
        best_confidence = 0.0

        for field_key, field_val in fields_to_check:
            if not field_val:
                continue
            
            val_raw = str(field_val).strip()
            val_norm = normalize_text(val_raw)

            if query_raw.lower() == val_raw.lower():
                match_type = "exact"
                confidence = 1.0
            elif query_norm == val_norm:
                match_type = "normalized"
                confidence = 0.95
            elif val_norm.startswith(query_norm):
                match_type = "prefix"
                confidence = 0.85
            else:
                sim = calculate_similarity(query_norm, val_norm)
                word_sims = [calculate_similarity(query_norm, normalize_text(w)) for w in val_raw.split() if w]
                max_word_sim = max(word_sims) if word_sims else 0.0
                
                effective_sim = max(sim, max_word_sim)
                if effective_sim >= 0.45:  # generous threshold for fuzzy matching
                    match_type = "fuzzy"
                    confidence = round(0.50 + (effective_sim - 0.50) * 0.8, 2)
                else:
                    continue

            if confidence > best_confidence:
                best_confidence = confidence
                best_match_type = f"{match_type} ({field_key})"

        if best_confidence > 0.0:
            scored_results.append({
                "medicine": med,
                "match_type": best_match_type,
                "match_confidence": best_confidence
            })

    scored_results.sort(key=lambda x: x["match_confidence"], reverse=True)

    total = len(scored_results)
    paginated = scored_results[skip : skip + limit]

    items = []
    for res in paginated:
        med = res["medicine"]
        items.append({
            "id": med["id"],
            "medicine_name": med["brand_name"],
            "brand_name": med["brand_name"],
            "generic_name": med["generic_name"],
            "active_ingredients": med["active_ingredients"],
            "strength": med["strength"],
            "dosage_form": med["dosage_form"],
            "manufacturer": med["manufacturer"],
            "match_type": res["match_type"],
            "match_confidence": res["match_confidence"]
        })

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }