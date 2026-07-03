"""
DefenseOS - Audit Log Model
Track all state changes in alerts, incidents, and users.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AuditLog(Base):
    """
    Audit trail for security-sensitive actions.
    Tracks: alert/incident state changes, user management.
    """
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # WHO: User performing the action
    username: Mapped[str] = mapped_column(index=True)
    
    # WHAT: Resource type (alert, incident, user)
    resource_type: Mapped[str] = mapped_column(index=True)
    
    # WHICH: Resource ID
    resource_id: Mapped[int] = mapped_column(index=True)
    
    # ACTION: create, update, delete, state_change
    action: Mapped[str] = mapped_column(index=True)
    
    # DETAILS: JSON or text description of change
    details: Mapped[str] = mapped_column(Text, nullable=True)
    
    # WHEN
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        index=True
    )

    def __repr__(self):
        return f"<AuditLog {self.id}: {self.action} {self.resource_type}#{self.resource_id} by {self.username}>"
