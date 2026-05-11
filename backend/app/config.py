from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/ai_singing_db"
    SQLALCHEMY_ECHO: bool = True
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Server
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Files
    MAX_FILE_SIZE: int = 52428800  # 50MB
    ALLOWED_AUDIO_FORMATS: list = ["mp3", "wav", "m4a", "flac", "ogg"]
    UPLOAD_DIR: str = "uploads/audio"
    
    # ACRCloud Song Recognition
    ACR_HOST: str = "identify-eu-west-1.acrcloud.com"
    ACR_ACCESS_KEY: str = "your-acrcloud-access-key"
    ACR_ACCESS_SECRET: str = "your-acrcloud-access-secret"

    # Groq AI
    GROQ_API_KEY: str = ""  # Set via environment variable
    # Audd API
    AUDD_API_KEY: str = ""  # Set via environment variable 
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()