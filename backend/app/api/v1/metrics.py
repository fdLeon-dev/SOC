"""
DefenseOS - System Metrics Routes
GET /metrics/system      → CPU, memory, disk, network snapshot
GET /metrics/processes   → top processes by CPU
GET /metrics/ports       → listening ports
GET /metrics/connections → active network connections
WS  /metrics/live        → WebSocket stream of metrics every N seconds
"""
import asyncio
import json

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from app.api.v1.dependencies import get_current_user
from app.schemas.metrics import (
    NetworkConnectionInfo,
    OpenPortInfo,
    ProcessInfo,
    SystemMetrics,
)
from app.services.metrics_service import (
    collect_metrics,
    collect_network_connections,
    collect_open_ports,
    collect_processes,
)
from app.services.ws_manager import ws_manager

router = APIRouter(prefix="/metrics", tags=["System Metrics"])


@router.get("/system", response_model=SystemMetrics)
async def get_system_metrics(_: None = Depends(get_current_user)):
    return collect_metrics()


@router.get("/processes", response_model=list[ProcessInfo])
async def get_processes(_: None = Depends(get_current_user)):
    return collect_processes()


@router.get("/ports", response_model=list[OpenPortInfo])
async def get_open_ports(_: None = Depends(get_current_user)):
    return collect_open_ports()


@router.get("/connections", response_model=list[NetworkConnectionInfo])
async def get_connections(_: None = Depends(get_current_user)):
    return collect_network_connections()


@router.websocket("/live")
async def metrics_live(websocket: WebSocket):
    """
    WebSocket endpoint — streams system metrics every 5 seconds.
    No auth on WebSocket for simplicity; add token query param if needed.
    """
    await ws_manager.connect(websocket)
    try:
        while True:
            metrics = collect_metrics()
            await websocket.send_text(
                json.dumps({"type": "metrics", "data": metrics.model_dump()})
            )
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
