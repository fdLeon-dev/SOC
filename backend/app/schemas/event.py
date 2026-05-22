"""DefenseOS - Security Event Schemas (Pydantic v2)."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.event import EventCategory, EventSeverity


class EventCreate(BaseModel):
    category: EventCategory = EventCategory.OTHER
    severity: EventSeverity = EventSeverity.INFO
    source_host: str = "localhost"
    source_ip: Optional[str] = None
    title: str
    description: Optional[str] = None
    raw_data: Optional[str] = None
    mitre_technique: Optional[str] = None


class EventOut(EventCreate):
    id: int
    timestamp: datetime
    is_processed: bool

    model_config = {"from_attributes": True}


class EventFilter(BaseModel):
    category: Optional[EventCategory] = None
    severity: Optional[EventSeverity] = None
    source_host: Optional[str] = None
    since: Optional[datetime] = None
    until: Optional[datetime] = None
    limit: int = 100
    offset: int = 0
