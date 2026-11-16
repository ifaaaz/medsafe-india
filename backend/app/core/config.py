from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MedSafe India API"
    DATABASE_URL: str = "postgresql://postgres:ifaaz1212844@127.0.0.1:5432/medsafe_db"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()