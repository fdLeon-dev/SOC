"""
DefenseOS - Incidents Routes
CRUD for security incident management with PICERL lifecycle.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_user, require_roles
from app.core.database import get_db
from app.models.incident import Incident, IncidentStatus
from app.models.user import UserRole
from app.schemas.incident import IncidentCreate, IncidentOut, IncidentUpdate
from app.services.audit_service import log_audit

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("/", response_model=list[IncidentOut])
async def list_incidents(
    status: Optional[IncidentStatus] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(get_current_user),
):
    query = select(Incident).order_by(Incident.created_at.desc())
    if status:
        query = query.where(Incident.status == status)
    result = await db.execute(query.limit(limit).offset(offset))
    return result.scalars().all()


@router.post("/", response_model=IncidentOut, status_code=201)
async def create_incident(
    body: IncidentCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST)),
):
    incident = Incident(**body.model_dump())
    db.add(incident)
    await db.flush()
    await db.refresh(incident)
    
    # Log to audit trail
    await log_audit(
        db, current_user.username, "incident", incident.id, "create",
        f"Incident created with status={incident.status.value}"
    )
    
    return incident


@router.get("/{incident_id}", response_model=IncidentOut)
async def get_incident(
    incident_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(get_current_user),
):
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    inc = result.scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc


@router.patch("/{incident_id}", response_model=IncidentOut)
async def update_incident(
    incident_id: int,
    body: IncidentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST)),
):
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    inc = result.scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Track changes
    changes = []
    for field, value in body.model_dump(exclude_none=True).items():
        old_value = getattr(inc, field, None)
        if old_value != value:
            changes.append(f"{field}: {old_value} → {value}")
        setattr(inc, field, value)
    
    db.add(inc)
    await db.flush()
    await db.refresh(inc)
    
    # Log to audit trail if there were changes
    if changes:
        await log_audit(
            db, current_user.username, "incident", inc.id, "update",
            ", ".join(changes)
        )
    
    return inc


@router.delete("/{incident_id}", status_code=204)
async def delete_incident(
    incident_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN)),
):
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    inc = result.scalar_one_or_none()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Log deletion before removing
    await log_audit(
        db, current_user.username, "incident", inc.id, "delete",
        f"Incident deleted (was in status {inc.status.value})"
    )
    
    await db.delete(inc)
