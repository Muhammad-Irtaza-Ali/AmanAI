"""User and Incident SQLAlchemy models."""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Text, Float, Integer, Uuid
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    category = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False)
    confidence = Column(Float, default=0.0)
    location = Column(String(500), default="")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    description = Column(Text, nullable=False)
    ai_summary = Column(Text, default="")
    recommended_action = Column(Text, default="")
    language = Column(String(10), default="en")
    status = Column(String(50), default="open")  # open, resolved, escalated
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    session_id = Column(String(255), index=True, nullable=False)
    role = Column(String(20), nullable=False)  # user / assistant / system
    content = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
