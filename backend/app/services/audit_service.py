"""
DefenseOS - Audit Service
Logs all security-relevant state changes.
"""
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog


async def log_audit(
    db: AsyncSession,
    username: str,
    resource_type: str,
    resource_id: int,
    action: str,
    details: str = None,
) -> AuditLog:
    """
    Create an audit log entry.
    
    resource_type: 'alert', 'incident', 'user'
    action: 'create', 'update', 'delete', 'status_change', 'severity_change'
    details: Description of what changed
    """
    entry = AuditLog(
        username=username,
        resource_type=resource_type,
        resource_id=resource_id,
        action=action,
        details=details,
        created_at=datetime.now(timezone.utc),
    )
    db.add(entry)
    await db.flush()
    return entry
