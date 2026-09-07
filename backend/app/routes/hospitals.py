"""Nearby hospitals endpoint."""

from typing import Optional, List

from fastapi import APIRouter, Query

from app.schemas import HospitalOut
from app.services.hospital_service import find_hospitals

router = APIRouter()


@router.get("/hospitals", response_model=List[HospitalOut])
async def hospitals(
    lat: Optional[float] = Query(None, description="User latitude"),
    lon: Optional[float] = Query(None, description="User longitude"),
    city: Optional[str] = Query(None, description="City name (fallback)"),
    radius: int = Query(5000, description="Search radius in meters"),
    limit: int = Query(10, description="Max results"),
):
    """Find nearby hospitals using OpenStreetMap Overpass API."""
    results = await find_hospitals(lat=lat, lon=lon, city=city, radius_m=radius, limit=limit)
    return [HospitalOut(**h) for h in results]
