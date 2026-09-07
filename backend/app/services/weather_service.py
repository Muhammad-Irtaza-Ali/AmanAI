"""Weather service using OpenWeatherMap API."""

import logging
from typing import Optional

import httpx
from fastapi import HTTPException

from app.config import settings

logger = logging.getLogger(__name__)

OWM_BASE = "https://api.openweathermap.org/data/2.5"


def _generate_alerts(data: dict) -> list[str]:
    """Generate weather alerts based on conditions."""
    alerts = []
    weather_id = data.get("weather", [{}])[0].get("id", 0)
    temp = data.get("main", {}).get("temp", 0)  # Kelvin
    temp_c = temp - 273.15
    wind = data.get("wind", {}).get("speed", 0)
    rain = data.get("rain", {})

    # Thunderstorm (200-232)
    if 200 <= weather_id <= 232:
        alerts.append("⛈️ Thunderstorm warning — seek shelter immediately.")

    # Heavy rain (502-531) or any rain (500-501)
    if 500 <= weather_id <= 531 or rain:
        alerts.append("🌧️ Rain alert — carry an umbrella and drive carefully.")

    # Flood-risk conditions (extreme rain)
    if 502 <= weather_id <= 531:
        alerts.append("🌊 Flood risk — avoid low-lying areas.")

    # Snow (600-622)
    if 600 <= weather_id <= 622:
        alerts.append("❄️ Snow alert — roads may be slippery.")

    # Heatwave
    if temp_c >= 40:
        alerts.append("🔥 Heatwave warning — stay hydrated, avoid direct sun.")

    # High wind
    if wind > 15:
        alerts.append("💨 High wind advisory — secure loose objects outdoors.")

    return alerts


async def get_weather(
    city: str = "Karachi",
    lat: float = None,
    lon: float = None,
) -> dict:
    """Fetch current weather for a city or coordinates and return a normalized dict."""
    if not settings.OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Weather service is not configured because the OpenWeather API key is missing.",
        )

    # Build params for either city name or coordinates
    params = {"appid": settings.OPENWEATHER_API_KEY, "units": "metric"}
    if lat is not None and lon is not None:
        params["lat"] = lat
        params["lon"] = lon
    else:
        params["q"] = city

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(f"{OWM_BASE}/weather", params=params)
            resp.raise_for_status()
            data = resp.json()

            temp_c = data["main"]["temp"]
            alerts = _generate_alerts(data)

            return {
                "city": data.get("name", city),
                "temperature": round(temp_c, 1),
                "condition": data["weather"][0]["description"].title(),
                "humidity": data["main"].get("humidity", 0),
                "wind_speed": data.get("wind", {}).get("speed", 0),
                "alerts": alerts,
                "icon": data["weather"][0].get("icon"),
            }
        except httpx.HTTPError as e:
            logger.error("OpenWeather API error: %s", e)
            raise HTTPException(
                status_code=503,
                detail="Unable to fetch weather data from the provider.",
            ) from e
