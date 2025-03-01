import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.endpoints import stocks
from .core.database import engine, Base
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis
from fastapi_cache.decorator import cache
from .core.scheduler import StockDataScheduler
import logging

logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Real-time stock market data API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(stocks.router, prefix=f"{settings.API_V1_STR}/stocks", tags=["stocks"])

# Initialize scheduler
scheduler = StockDataScheduler()

@app.on_event("startup")
async def startup():
    # Initialize Redis cache
    redis = aioredis.from_url(
        f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}",
        encoding="utf8",
        decode_responses=True
    )
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")

    # Start the stock data scheduler
    logger.info("Starting stock data scheduler...")
    scheduler.start()

@app.on_event("shutdown")
async def shutdown():
    # Stop the stock data scheduler
    logger.info("Stopping stock data scheduler...")
    scheduler.stop()

@app.get("/")
async def root():
    return {
        "message": "Welcome to Stock Market API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True
    ) 