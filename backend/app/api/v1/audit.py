"""
DefenseOS - Audit Logs Routes (Admin only)
GET /audit/logs → list audit logs with filters
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import require_roles
from app.core.database import get_db
from app.models.audit import AuditLog
from app.models.user import UserRole
from app.schemas.audit import AuditLogOut

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("/logs", response_model=list[AuditLogOut])
async def list_audit_logs(
    resource_type: str | None = Query(None),
    action: str | None = Query(None),
    username: str | None = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN)),
):
    """
    List audit logs with optional filters.
    Admin-only access.
    
    Query parameters:
    - resource_type: Filter by 'alert', 'incident', 'user'
    - action: Filter by 'create', 'update', 'delete', 'status_change'
    - username: Filter by user who performed action
    - limit: Number of results (max 1000)
    - offset: Pagination offset
    """
    query = select(AuditLog)
    
    # Apply filters
    filters = []
    if resource_type:
        filters.append(AuditLog.resource_type == resource_type)
    if action:
        filters.append(AuditLog.action == action)
    if username:
        filters.append(AuditLog.username == username)
    
    if filters:
        query = query.where(and_(*filters))
    
    # Order by most recent first, then paginate
    query = query.order_by(AuditLog.created_at.desc()).limit(limit).offset(offset)
    
    result = await db.execute(query)
    return result.scalars().all()
