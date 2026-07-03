"""DefenseOS - Audit Log Schemas (Pydantic v2)."""
from datetime import datetime
from pydantic import BaseModel


class AuditLogOut(BaseModel):
    """Audit log response schema."""
    id: int
    username: str
    resource_type: str
    resource_id: int
    action: str
    details: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
