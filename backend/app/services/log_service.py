"""
DefenseOS - Log Monitoring Service
Reads system log files and ingests new lines as SecurityEvents.
Runs as a background asyncio task.
"""
import asyncio
import re
from pathlib import Path
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import AsyncSessionLocal
from app.core.logging import get_logger
from app.models.event import EventCategory, EventSeverity
from app.schemas.event import EventCreate
from app.services.alert_service import maybe_create_alert_from_event

logger = get_logger(__name__)
settings = get_settings()

# Simple keyword → (severity, category) mapping for triage
_TRIAGE_RULES: list[tuple[re.Pattern, EventSeverity, EventCategory]] = [
    (re.compile(r"(failed password|authentication failure|invalid user)", re.I),
     EventSeverity.MEDIUM, EventCategory.AUTHENTICATION),
    (re.compile(r"(accepted password|session opened for user)", re.I),
     EventSeverity.LOW, EventCategory.AUTHENTICATION),
    (re.compile(r"(sudo|su:)", re.I),
     EventSeverity.LOW, EventCategory.AUTHENTICATION),
    (re.compile(r"(kernel:|oops|panic|segfault)", re.I),
     EventSeverity.HIGH, EventCategory.SYSTEM),
    (re.compile(r"(oom|out of memory)", re.I),
     EventSeverity.MEDIUM, EventCategory.SYSTEM),
    (re.compile(r"(iptables|nftables|firewalld)", re.I),
     EventSeverity.LOW, EventCategory.NETWORK),
    (re.compile(r"(connection refused|connection reset|port scan)", re.I),
     EventSeverity.MEDIUM, EventCategory.NETWORK),
]


def _triage_line(line: str) -> tuple[EventSeverity, EventCategory]:
    """Return severity and category by matching keywords in a log line."""
    for pattern, severity, category in _TRIAGE_RULES:
        if pattern.search(line):
            return severity, category
    return EventSeverity.INFO, EventCategory.LOG


class LogTailer:
    """
    Asynchronously tails a single log file.
    Seeks to EOF on startup, then reads new lines as they appear.
    """
    def __init__(self, path: Path):
        self.path = path
        self._offset = 0

    def initialize(self) -> None:
        """Seek to end of file so we only process new entries."""
        try:
            self._offset = self.path.stat().st_size
        except OSError:
            self._offset = 0

    def read_new_lines(self) -> list[str]:
        """Return any lines added since last read."""
        try:
            with self.path.open("r", encoding="utf-8", errors="replace") as fh:
                fh.seek(self._offset)
                lines = fh.readlines()
                self._offset = fh.tell()
            return [l.rstrip("\n") for l in lines if l.strip()]
        except OSError:
            return []


# ── Background Task ───────────────────────────────────────────────────────────

_tailers: list[LogTailer] = []


async def _persist_log_event(line: str, source: str) -> None:
    """Create a SecurityEvent (and possibly an Alert) for a log line."""
    severity, category = _triage_line(line)
    data = EventCreate(
        category=category,
        severity=severity,
        source_host="localhost",
        title=line[:200],
        description=line,
        raw_data=None,
    )
    async with AsyncSessionLocal() as db:
        from app.models.event import SecurityEvent  # local import to avoid circular
        event = SecurityEvent(**data.model_dump())
        db.add(event)
        await db.flush()
        await db.refresh(event)
        await maybe_create_alert_from_event(db, event)
        await db.commit()


async def log_monitor_loop() -> None:
    """Main loop: poll log files every LOG_WATCH_INTERVAL seconds."""
    global _tailers
    log_paths = settings.log_paths_list
    if not log_paths:
        logger.warning("log_monitor_no_files_found")
        return

    _tailers = [LogTailer(p) for p in log_paths]
    for t in _tailers:
        t.initialize()
        logger.info("log_tailer_started", path=str(t.path))

    while True:
        for tailer in _tailers:
            lines = tailer.read_new_lines()
            for line in lines:
                await _persist_log_event(line, str(tailer.path))
        await asyncio.sleep(settings.LOG_WATCH_INTERVAL)
