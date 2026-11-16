# MedSafe India

MedSafe India is a patient-facing medicine safety application tailored for Indian pharmaceuticals. It helps users verify medicine names, check drug interactions, detect duplicate active ingredients, and manage personal medication reminders safely, backed by verified structured data rather than unchecked LLM inferences.

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, Lucide React
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic
- **Database:** PostgreSQL

## Project Structure

- `/frontend` - React + Vite TypeScript application
- `/backend` - FastAPI Python server
- `/docs` - Architectural guidelines and safety documentation

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL

### Running the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000