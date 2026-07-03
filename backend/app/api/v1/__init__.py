"""DefenseOS - API v1 router aggregator."""
from fastapi import APIRouter

from app.api.v1 import auth, events, alerts, incidents, metrics, users, audit

router = APIRouter()

router.include_router(auth.router)
router.include_router(events.router)
router.include_router(alerts.router)
router.include_router(incidents.router)
router.include_router(metrics.router)
router.include_router(users.router)
router.include_router(audit.router)
