"""Incident / Report CRUD endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import IncidentCreate, IncidentOut, IncidentListOut
from app.services.incident_service import (
    create_incident,
    get_incident_by_id,
    list_incidents,
    count_incidents,
)

router = APIRouter()


@router.post("/incident", response_model=IncidentOut, status_code=201)
async def create_incident_route(payload: IncidentCreate, db: Session = Depends(get_db)):
    """Create a new incident report."""
    incident = create_incident(db, payload.model_dump())
    return incident


@router.get("/incident/{incident_id}", response_model=IncidentOut)
async def get_incident_route(incident_id: str, db: Session = Depends(get_db)):
    """Fetch a single incident by ID."""
    incident = get_incident_by_id(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.get("/reports", response_model=IncidentListOut)
async def list_reports(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List all incident reports, newest first."""
    incidents = list_incidents(db, skip=skip, limit=limit)
    total = count_incidents(db)
    return IncidentListOut(total=total, incidents=incidents)
