from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "TryRack API"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = "TryRack Backend API"
    
    # Database
    DATABASE_URL: str = "postgresql://splenwilz@localhost:5432/tryrack"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # Short-lived access tokens (industry standard: 15-60 min)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # Long-lived refresh tokens (industry standard: 7-30 days)
    ALGORITHM: str = "HS256"
    
    # WorkOS OAuth Configuration
    WORKOS_API_KEY: Optional[str] = None
    WORKOS_CLIENT_ID: Optional[str] = None
    WORKOS_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/oauth/callback"
    
    # Frontend Configuration
    FRONTEND_BASE_URL: str = "http://172.20.10.2:8081"  # Expo dev server IP
    FRONTEND_SCHEME: str = "frontend"  # Mobile app scheme
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000", 
        "http://localhost:8081",
        "exp://172.20.10.2:8081",  # Expo dev server
        "frontend://auth/callback"  # Mobile app scheme
    ]
    
    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET_NAME: Optional[str] = None
    
    # Gemini API Configuration
    GEMINI_API_KEY: Optional[str] = None
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
