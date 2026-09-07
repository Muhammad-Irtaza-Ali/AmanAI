"""Pydantic request / response schemas for all API endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field


# ─── Chat ──────────────────────────────────────────────────────────────────────

class ChatMessageIn(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    session_id: Optional[str] = None
    language: Optional[str] = "auto"  # auto-detect or en/ur/sd


class ChatMessageOut(BaseModel):
    reply: str
    language_detected: str
    classification: Optional[ClassificationOut] = None
    first_aid: Optional[FirstAidOut] = None
    disclaimer: str = (
        "This AI guidance does not replace professional emergency responders. "
        "Always call local emergency services for serious situations."
    )


# ─── Classification ─────────────────────────────────────────────────────────────

class ClassifyRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language: Optional[str] = "auto"


class ClassificationOut(BaseModel):
    category: str
    confidence: float
    severity: str  # Low / Medium / High / Critical
    description: str = ""


# ─── First Aid ──────────────────────────────────────────────────────────────────

class FirstAidRequest(BaseModel):
    category: str
    description: str = ""
    language: Optional[str] = "en"


class FirstAidStep(BaseModel):
    title: str
    steps: List[str]


class FirstAidOut(BaseModel):
    category: str
    immediate_actions: List[str]
    do_not: List[str]
    seek_medical_help: str
    disclaimer: str = (
        "AI-generated guidance. Seek professional medical help immediately "
        "for serious emergencies."
    )


# ─── Weather ────────────────────────────────────────────────────────────────────

class WeatherOut(BaseModel):
    city: str
    temperature: float
    condition: str
    humidity: int
    wind_speed: float
    alerts: List[str] = []
    icon: Optional[str] = None


# ─── Air Quality ────────────────────────────────────────────────────────────────

class AirQualityOut(BaseModel):
    city: str
    aqi: int
    category: str
    health_recommendation: str
    pollutants: Optional[dict] = None


# ─── Hospital ───────────────────────────────────────────────────────────────────

class HospitalOut(BaseModel):
    name: str
    address: str = ""
    phone: str = ""
    latitude: float
    longitude: float
    distance_km: Optional[float] = None
    maps_url: str = ""


# ─── Incident / Report ─────────────────────────────────────────────────────────

class IncidentCreate(BaseModel):
    category: str
    severity: str
    confidence: float = 0.0
    location: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str
    ai_summary: str = ""
    recommended_action: str = ""
    language: str = "en"


class IncidentOut(BaseModel):
    id: UUID
    category: str
    severity: str
    confidence: float
    location: str
    latitude: Optional[float]
    longitude: Optional[float]
    description: str
    ai_summary: str
    recommended_action: str
    language: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class IncidentListOut(BaseModel):
    total: int
    incidents: List[IncidentOut]


# ─── Generic ────────────────────────────────────────────────────────────────────

class HealthCheck(BaseModel):
    status: str = "ok"
    version: str
    ai_provider: str
