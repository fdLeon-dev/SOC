"""
DefenseOS - Alert Service
Creates alerts from events, applies basic correlation rules,
and broadcasts to connected WebSocket clients.
"""
import json
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.event import EventSeverity, SecurityEvent
from app.schemas.alert import AlertCreate, AlertStats, AlertUpdate
from app.services.audit_service import log_audit

logger = get_logger(__name__)

# ── Correlation Rules ─────────────────────────────────────────────────────────
# Simple rule: map event severity to alert severity
_SEVERITY_MAP = {
    EventSeverity.INFO: None,                # Don't alert on INFO events
    EventSeverity.LOW: AlertSeverity.LOW,
    EventSeverity.MEDIUM: AlertSeverity.MEDIUM,
    EventSeverity.HIGH: AlertSeverity.HIGH,
    EventSeverity.CRITICAL: AlertSeverity.CRITICAL,
}


async def create_alert(db: AsyncSession, data: AlertCreate, username: str = "system") -> Alert:
    """Persist a new alert."""
    alert = Alert(
        title=data.title,
        description=data.description,
        severity=data.severity,
        rule_name=data.rule_name,
        source_event_id=data.source_event_id,
    )
    db.add(alert)
    await db.flush()
    await db.refresh(alert)
    logger.info("alert_created", alert_id=alert.id, severity=alert.severity)
    
    # Log to audit trail
    await log_audit(
        db, username, "alert", alert.id, "create",
        f"Alert created with severity={alert.severity.value}, rule={alert.rule_name}"
    )
    return alert


async def maybe_create_alert_from_event(
    db: AsyncSession, event: SecurityEvent
) -> Optional[Alert]:
    """
    Apply correlation rules to a SecurityEvent.
    Returns a new Alert if a rule fires, else None.
    """
    alert_severity = _SEVERITY_MAP.get(event.severity)
    if alert_severity is None:
        return None

    data = AlertCreate(
        title=f"[{event.category.upper()}] {event.title}",
        description=event.description,
        severity=alert_severity,
        rule_name="auto_severity_correlation",
        source_event_id=event.id,
    )
    alert = await create_alert(db, data)

    # Mark event as processed
    event.is_processed = True
    db.add(event)
    return alert


async def update_alert(
    db: AsyncSession, alert_id: int, data: AlertUpdate, username: str = "system"
) -> Optional[Alert]:
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        return None
    
    # Track what changed
    changes = []
    for field, value in data.model_dump(exclude_none=True).items():
        old_value = getattr(alert, field, None)
        if old_value != value:
            changes.append(f"{field}: {old_value} → {value}")
        setattr(alert, field, value)
    
    alert.updated_at = datetime.now(timezone.utc)
    db.add(alert)
    await db.flush()
    await db.refresh(alert)
    
    # Log to audit trail if there were changes
    if changes:
        await log_audit(
            db, username, "alert", alert.id, "update",
            ", ".join(changes)
        )
    
    return alert


async def get_alert_stats(db: AsyncSession) -> AlertStats:
    """Compute alert statistics for the dashboard."""
    result = await db.execute(select(Alert))
    alerts = result.scalars().all()

    by_status = {s.value: 0 for s in AlertStatus}
    by_severity = {s.value: 0 for s in AlertSeverity}

    for a in alerts:
        by_status[a.status.value] += 1
        by_severity[a.severity.value] += 1

    return AlertStats(
        total=len(alerts),
        open=by_status["open"],
        investigating=by_status["investigating"],
        resolved=by_status["resolved"],
        false_positive=by_status["false_positive"],
        by_severity=by_severity,
    )
