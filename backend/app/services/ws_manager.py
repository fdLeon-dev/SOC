"""
DefenseOS - WebSocket Manager
Manages connected WebSocket clients and broadcasts real-time events/metrics.
"""
import asyncio
import json
from typing import Any

from fastapi import WebSocket
from app.core.logging import get_logger

logger = get_logger(__name__)


class ConnectionManager:
    """
    Thread-safe WebSocket connection registry.
    Broadcasts JSON messages to all connected clients.
    """

    def __init__(self) -> None:
        self._active: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._active.append(websocket)
        logger.info("ws_client_connected", total=len(self._active))

    def disconnect(self, websocket: WebSocket) -> None:
        self._active.discard if hasattr(self._active, "discard") else None
        try:
            self._active.remove(websocket)
        except ValueError:
            pass
        logger.info("ws_client_disconnected", total=len(self._active))

    async def broadcast(self, event_type: str, data: Any) -> None:
        """Send a typed JSON message to all connected clients."""
        message = json.dumps({"type": event_type, "data": data})
        dead = []
        for ws in list(self._active):
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

    @property
    def client_count(self) -> int:
        return len(self._active)


# Application-wide singleton
ws_manager = ConnectionManager()
