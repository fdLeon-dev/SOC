"""DefenseOS - Alert Schemas (Pydantic v2)."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.alert import AlertSeverity, AlertStatus


class AlertCreate(BaseModel):
    title: str
    description: Optional[str] = None
    severity: AlertSeverity = AlertSeverity.MEDIUM
    rule_name: Optional[str] = None
    source_event_id: Optional[int] = None


class AlertUpdate(BaseModel):
    status: Optional[AlertStatus] = None
    description: Optional[str] = None
    incident_id: Optional[int] = None


class AlertOut(AlertCreate):
    id: int
    status: AlertStatus
    created_at: datetime
    updated_at: datetime
    incident_id: Optional[int] = None

    model_config = {"from_attributes": True}


class AlertStats(BaseModel):
    total: int
    open: int
    investigating: int
    resolved: int
    false_positive: int
    by_severity: dict[str, int]
