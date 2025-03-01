from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Stock Market API"
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",  # Frontend development server
        "http://localhost:3000"   # Alternative frontend port
    ]
    
    # Database Configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/stockmarket"
    )
    
    # Stock API Configuration
    STOCK_UPDATE_INTERVAL: int = 60  # seconds
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Redis
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    
    # Stock API
    STOCK_API_KEY: str = os.getenv("STOCK_API_KEY", "")
    STOCK_API_BASE_URL: str = os.getenv("STOCK_API_BASE_URL", "")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Cache
    CACHE_EXPIRY: int = int(os.getenv("CACHE_EXPIRY", "300"))

    class Config:
        case_sensitive = True

settings = Settings() 