"""
DefenseOS - Security Event Model
Represents any raw security event collected by monitoring agents
(system log entry, suspicious process, network connection, etc.).
"""
import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EventCategory(str, enum.Enum):
    AUTHENTICATION = "authentication"
    NETWORK = "network"
    PROCESS = "process"
    FILE = "file"
    SYSTEM = "system"
    LOG = "log"
    OTHER = "other"


class EventSeverity(str, enum.Enum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
    category: Mapped[EventCategory] = mapped_column(
        Enum(EventCategory), default=EventCategory.OTHER, index=True
    )
    severity: Mapped[EventSeverity] = mapped_column(
        Enum(EventSeverity), default=EventSeverity.INFO, index=True
    )
    source_host: Mapped[str] = mapped_column(String(255), default="localhost")
    source_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)
    title: Mapped[str] = mapped_column(String(512))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_data: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    mitre_technique: Mapped[str | None] = mapped_column(String(32), nullable=True)  # e.g. T1059
    is_processed: Mapped[bool] = mapped_column(default=False)
