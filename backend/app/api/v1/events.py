"""
DefenseOS - Events Routes
GET  /events         → paginated list with filters
POST /events         → ingest a new security event manually
GET  /events/{id}    → single event detail
"""
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_user
from app.core.database import get_db
from app.models.event import EventCategory, EventSeverity, SecurityEvent
from app.schemas.event import EventCreate, EventOut
from app.services.alert_service import maybe_create_alert_from_event

router = APIRouter(prefix="/events", tags=["Security Events"])


@router.get("/", response_model=list[EventOut])
async def list_events(
    category: Optional[EventCategory] = None,
    severity: Optional[EventSeverity] = None,
    since: Optional[datetime] = None,
    limit: int = Query(default=100, le=500),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(get_current_user),
):
    query = select(SecurityEvent).order_by(SecurityEvent.timestamp.desc())
    if category:
        query = query.where(SecurityEvent.category == category)
    if severity:
        query = query.where(SecurityEvent.severity == severity)
    if since:
        query = query.where(SecurityEvent.timestamp >= since)
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=EventOut, status_code=201)
async def create_event(
    body: EventCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(get_current_user),
):
    """Manually ingest a security event (e.g. from an external agent)."""
    event = SecurityEvent(**body.model_dump())
    db.add(event)
    await db.flush()
    await db.refresh(event)
    await maybe_create_alert_from_event(db, event)
    return event


@router.get("/{event_id}", response_model=EventOut)
async def get_event(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(get_current_user),
):
    result = await db.execute(
        select(SecurityEvent).where(SecurityEvent.id == event_id)
    )
    event = result.scalar_one_or_none()
    if not event:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Event not found")
    return event
