"""Air quality endpoint."""

from fastapi import APIRouter, Query

from app.schemas import AirQualityOut
from app.services.air_quality_service import get_air_quality

router = APIRouter()


@router.get("/air-quality", response_model=AirQualityOut)
async def air_quality(
    lat: float = Query(24.8607, description="Latitude"),
    lon: float = Query(67.0011, description="Longitude"),
    city: str = Query("", description="City name for display"),
):
    """Get current air quality index and health recommendations."""
    data = await get_air_quality(lat, lon, city)
    return AirQualityOut(**data)
