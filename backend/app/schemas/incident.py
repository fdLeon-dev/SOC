"""DefenseOS - Incident Schemas (Pydantic v2)."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.incident import IncidentSeverity, IncidentStatus
from app.schemas.alert import AlertOut


class IncidentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    severity: IncidentSeverity = IncidentSeverity.MEDIUM
    assigned_to_id: Optional[int] = None
    timeline_notes: Optional[str] = None


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[IncidentSeverity] = None
    status: Optional[IncidentStatus] = None
    assigned_to_id: Optional[int] = None
    timeline_notes: Optional[str] = None


class IncidentOut(IncidentCreate):
    id: int
    status: IncidentStatus
    created_at: datetime
    updated_at: datetime
    alerts: list[AlertOut] = []

    model_config = {"from_attributes": True}
