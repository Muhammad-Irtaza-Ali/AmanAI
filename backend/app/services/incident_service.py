"""Incident CRUD operations."""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models import Incident


def create_incident(db: Session, data: dict) -> Incident:
    """Create a new incident record."""
    incident = Incident(
        id=uuid.uuid4(),
        category=data["category"],
        severity=data["severity"],
        confidence=data.get("confidence", 0.0),
        location=data.get("location", ""),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        description=data["description"],
        ai_summary=data.get("ai_summary", ""),
        recommended_action=data.get("recommended_action", ""),
        language=data.get("language", "en"),
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


def get_incident_by_id(db: Session, incident_id: str) -> Optional[Incident]:
    """Fetch a single incident by ID."""
    try:
        uid = uuid.UUID(str(incident_id))
    except ValueError:
        return None
    return db.query(Incident).filter(Incident.id == uid).first()


def list_incidents(db: Session, skip: int = 0, limit: int = 50) -> list[Incident]:
    """Return a paginated list of incidents, newest first."""
    return (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_incidents(db: Session) -> int:
    """Return total number of incidents."""
    return db.query(Incident).count()
