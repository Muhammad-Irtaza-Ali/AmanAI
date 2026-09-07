"""Weather endpoint."""

from typing import Optional

from fastapi import APIRouter, Query

from app.schemas import WeatherOut
from app.services.weather_service import get_weather

router = APIRouter()


@router.get("/weather", response_model=WeatherOut)
async def weather(
    city: str = Query("Karachi", description="City name"),
    lat: Optional[float] = Query(None, description="Latitude (overrides city)"),
    lon: Optional[float] = Query(None, description="Longitude (overrides city)"),
):
    """Get current weather and alerts for a city or coordinates."""
    data = await get_weather(city=city, lat=lat, lon=lon)
    return WeatherOut(**data)
