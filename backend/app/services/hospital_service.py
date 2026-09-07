"""Hospital lookup service using OpenStreetMap + Overpass API."""

import logging
import math
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

OVERPASS_URLS = (
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass-api.de/api/interpreter",
)
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in km between two lat/lon points."""
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _build_overpass_query(lat: float, lon: float, radius_m: int = 5000) -> str:
    """Overpass QL query for hospitals near a point."""
    return f"""
    [out:json][timeout:25];
    (
      node["amenity"~"hospital|clinic|doctors|medical_centre"](around:{radius_m},{lat},{lon});
      way["amenity"~"hospital|clinic|doctors|medical_centre"](around:{radius_m},{lat},{lon});
      relation["amenity"~"hospital|clinic|doctors|medical_centre"](around:{radius_m},{lat},{lon});
    );
    out center tags;
    """


def _build_city_query(city: str) -> str:
    """Overpass QL query for hospitals inside a city boundary."""
    escaped_city = city.replace('"', '\\"').strip()
    return f"""
    [out:json][timeout:25];
    relation["name"~"^{escaped_city}$",i]["boundary"="administrative"]->.cityRelation;
    map_to_area.cityRelation->.searchArea;
    (
      node["amenity"~"hospital|clinic|doctors|medical_centre"](area.searchArea);
      way["amenity"~"hospital|clinic|doctors|medical_centre"](area.searchArea);
      relation["amenity"~"hospital|clinic|doctors|medical_centre"](area.searchArea);
    );
    out center tags;
    """


async def _geocode_city(city: str) -> tuple[Optional[float], Optional[float]]:
    """Resolve a city name to coordinates using Nominatim."""
    if not city:
        return None, None
    try:
        async with httpx.AsyncClient(
            timeout=10,
            headers={
                "Accept": "application/json",
                "User-Agent": "AmanAI/1.0",
            },
        ) as client:
            resp = await client.get(
                NOMINATIM_URL,
                params={
                    "q": city,
                    "format": "jsonv2",
                    "limit": 1,
                },
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError as e:
        logger.error("Nominatim geocoding error: %s", e)
        return None, None

    if not data:
        return None, None

    try:
        return float(data[0]["lat"]), float(data[0]["lon"])
    except (KeyError, TypeError, ValueError):
        return None, None


async def _search_nominatim_hospitals(
    city: Optional[str],
    user_lat: Optional[float],
    user_lon: Optional[float],
    limit: int,
) -> list[dict]:
    """Use Nominatim as a live fallback when Overpass is unavailable."""
    if not city:
        return []

    try:
        async with httpx.AsyncClient(
            timeout=15,
            headers={"Accept": "application/json", "User-Agent": "AmanAI/1.0"},
        ) as client:
            resp = await client.get(
                NOMINATIM_URL,
                params={
                    "q": f"hospital {city}",
                    "format": "jsonv2",
                    "limit": min(max(limit * 3, 10), 50),
                    "addressdetails": 1,
                },
            )
            resp.raise_for_status()
            results = resp.json()
    except httpx.HTTPError as e:
        logger.warning("Nominatim hospital search error: %s", e)
        return []

    hospitals = []
    for result in results:
        try:
            result_lat = float(result["lat"])
            result_lon = float(result["lon"])
        except (KeyError, TypeError, ValueError):
            continue

        distance = None
        if user_lat is not None and user_lon is not None:
            distance = round(_haversine_km(user_lat, user_lon, result_lat, result_lon), 2)

        hospitals.append(
            {
                "name": result.get("name") or "Hospital",
                "address": result.get("display_name", ""),
                "phone": "",
                "latitude": result_lat,
                "longitude": result_lon,
                "distance_km": distance,
                "maps_url": f"https://www.google.com/maps?q={result_lat},{result_lon}",
            }
        )

    hospitals.sort(key=lambda h: h["distance_km"] if h["distance_km"] is not None else float("inf"))
    return hospitals[:limit]


def _parse_element(el: dict, user_lat: Optional[float], user_lon: Optional[float]) -> dict:
    """Normalize an Overpass element into a hospital dict."""
    tags = el.get("tags", {})
    lat = el.get("lat") or el.get("center", {}).get("lat")
    lon = el.get("lon") or el.get("center", {}).get("lon")
    if lat is None or lon is None:
        return None

    distance = None
    if user_lat is not None and user_lon is not None:
        distance = round(_haversine_km(user_lat, user_lon, lat, lon), 2)

    maps_url = f"https://www.google.com/maps?q={lat},{lon}"

    return {
        "name": tags.get("name", "Unnamed Hospital"),
        "address": tags.get("addr:full", tags.get("addr:street", "")),
        "phone": tags.get("phone", tags.get("contact:phone", "")),
        "latitude": lat,
        "longitude": lon,
        "distance_km": distance,
        "maps_url": maps_url,
    }


async def find_hospitals(
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    city: Optional[str] = None,
    radius_m: int = 5000,
    limit: int = 10,
) -> list[dict]:
    """Find nearby hospitals by coordinates or city name."""
    if lat is not None and lon is not None:
        query = _build_overpass_query(lat, lon, radius_m)
    elif city:
        # City boundary relations are inconsistent, so search live city results
        # directly after resolving the city for distance calculations.
        city_lat, city_lon = await _geocode_city(city)
        if city_lat is None or city_lon is None:
            return []
        lat, lon = city_lat, city_lon
        return await _search_nominatim_hospitals(city, lat, lon, limit)
    else:
        return []

    data = None
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(10.0, connect=5.0),
        headers={
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "AmanAI/1.0",
        },
    ) as client:
        for overpass_url in OVERPASS_URLS:
            try:
                resp = await client.post(overpass_url, data={"data": query})
                resp.raise_for_status()
                data = resp.json()
                break
            except httpx.HTTPError as e:
                logger.warning("Overpass server unavailable (%s): %s", overpass_url, e)

    if data is None or not data.get("elements"):
        return await _search_nominatim_hospitals(city, lat, lon, limit)

    hospitals = []
    for el in data.get("elements", []):
        parsed = _parse_element(el, lat, lon)
        if parsed:
            hospitals.append(parsed)

    # Sort by distance if available
    hospitals.sort(key=lambda h: h["distance_km"] if h["distance_km"] is not None else float("inf"))
    return hospitals[:limit]
