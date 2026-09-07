"""Air quality service using OpenWeather Air Pollution API."""

import logging

import httpx
from fastapi import HTTPException

from app.config import settings

logger = logging.getLogger(__name__)

AIR_QUALITY_URL = "https://api.openweathermap.org/data/2.5/air_pollution"

AQI_CATEGORIES = {
    1: ("Good", "Air quality is satisfactory. Enjoy outdoor activities."),
    2: ("Fair", "Air quality is acceptable. Unusually sensitive people should limit prolonged outdoor exertion."),
    3: ("Moderate", "Sensitive groups should reduce outdoor activities."),
    4: ("Poor", "Avoid prolonged outdoor activities. Consider wearing a mask."),
    5: ("Very Poor", "Avoid all outdoor activities. Wear a mask. Stay indoors if possible."),
}


async def get_air_quality(lat: float, lon: float, city: str = "") -> dict:
    """Fetch current air quality for given coordinates."""
    if not settings.OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Air quality service is not configured because the OpenWeather API key is missing.",
        )

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                AIR_QUALITY_URL,
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": settings.OPENWEATHER_API_KEY,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        air_data = data.get("list", [{}])[0]
        aqi = air_data.get("main", {}).get("aqi", 0)
        components = air_data.get("components", {})

        # Map 1-5 scale to US AQI approximate scale
        aqi_approx = {1: 50, 2: 100, 3: 150, 4: 200, 5: 300}.get(aqi, aqi * 50)
        category, recommendation = AQI_CATEGORIES.get(
            aqi, ("Unknown", "Unable to determine air quality.")
        )

        return {
            "city": city or "Unknown",
            "aqi": aqi_approx,
            "category": category,
            "health_recommendation": recommendation,
            "pollutants": {
                "pm2_5": components.get("pm2_5"),
                "pm10": components.get("pm10"),
                "co": components.get("co"),
                "no2": components.get("no2"),
                "so2": components.get("so2"),
                "o3": components.get("o3"),
            },
        }
    except httpx.HTTPError as e:
        logger.error("Air quality API error: %s", e)
        raise HTTPException(
            status_code=503,
            detail="Unable to fetch air quality data from the provider.",
        ) from e
