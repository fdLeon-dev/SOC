"""
DefenseOS - Alerts Routes
GET    /alerts         → list with status/severity filters
PATCH  /alerts/{id}   → update status (open→investigating→resolved)
GET    /alerts/stats   → summary counters for dashboard
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_user, require_roles
from app.core.database import get_db
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.user import UserRole
from app.schemas.alert import AlertOut, AlertStats, AlertUpdate
from app.services.alert_service import get_alert_stats, update_alert

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/stats", response_model=AlertStats)
async def alert_stats(
    db: AsyncSession = Depends(get_db),
    _: None = Depends(get_current_user),
):
    return await get_alert_stats(db)


@router.get("/", response_model=list[AlertOut])
async def list_alerts(
    status: Optional[AlertStatus] = None,
    severity: Optional[AlertSeverity] = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(get_current_user),
):
    query = select(Alert).order_by(Alert.created_at.desc())
    if status:
        query = query.where(Alert.status == status)
    if severity:
        query = query.where(Alert.severity == severity)
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/{alert_id}", response_model=AlertOut)
async def patch_alert(
    alert_id: int,
    body: AlertUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST)),
):
    alert = await update_alert(db, alert_id, body, username=current_user.username)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
