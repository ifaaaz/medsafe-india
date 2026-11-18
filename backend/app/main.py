from dotenv import load_dotenv
load_dotenv()  # Load GEMINI_API_KEY and DATABASE_URL from backend/.env

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models.history import UserMedicationHistory
from app.api.v1.endpoints import medicines, interactions, ocr, history, generic_saver, lifestyle_warnings

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedSafe India API",
    description="Backend API for clinical medication safety, OCR prescription parsing, and interaction checking.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(medicines.router)
app.include_router(interactions.router)
app.include_router(ocr.router)
app.include_router(history.router)
app.include_router(generic_saver.router)
app.include_router(lifestyle_warnings.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to MedSafe India API", "docs_url": "/docs"}