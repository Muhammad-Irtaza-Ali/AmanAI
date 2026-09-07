"""Nigehban AI — FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routes import all_routers
from app.schemas import HealthCheck

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Nigehban AI backend ready (v%s, provider=%s)", settings.APP_VERSION, settings.AI_PROVIDER)
    yield
    logger.info("Shutting down Nigehban AI backend.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Multilingual AI Emergency Assistant",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers under /api prefix
for router in all_routers:
    app.include_router(router, prefix="/api")


@app.get("/", tags=["health"])
async def root():
    return {
        "message": "Nigehban AI Backend is running!",
        "status": "ok"
    }


@app.get("/health", response_model=HealthCheck, tags=["health"])
async def health_check():
    return HealthCheck(
        status="ok",
        version=settings.APP_VERSION,
        ai_provider=settings.AI_PROVIDER,
    )