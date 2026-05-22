"""
DefenseOS - FastAPI Application Entry Point
Wires together all routers, middleware, startup/shutdown lifecycle,
and background monitoring tasks.
"""
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.v1 import router as api_v1_router
from app.core.config import get_settings
from app.core.database import init_db, AsyncSessionLocal
from app.core.logging import get_logger, setup_logging
from app.services.auth_service import ensure_admin_exists
from app.services.log_service import log_monitor_loop

setup_logging()
logger = get_logger(__name__)
settings = get_settings()

# ── Background tasks ──────────────────────────────────────────────────────────

_background_tasks: list[asyncio.Task] = []


async def _metrics_broadcast_loop() -> None:
    """Broadcast live metrics to WebSocket clients every METRICS_INTERVAL seconds."""
    from app.services.metrics_service import collect_metrics
    from app.services.ws_manager import ws_manager

    while True:
        try:
            metrics = collect_metrics()
            await ws_manager.broadcast("metrics", metrics.model_dump())
        except Exception as exc:
            logger.warning("metrics_broadcast_error", error=str(exc))
        await asyncio.sleep(settings.METRICS_INTERVAL)


# ── Application lifespan ──────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("defenseos_starting", env=settings.APP_ENV)

    background_tasks: list[asyncio.Task] = []

    # 1. Initialize database tables
    await init_db()

    # 2. Bootstrap admin user
    async with AsyncSessionLocal() as db:
        await ensure_admin_exists(db, settings)
        await db.commit()

    # 3. Start background monitoring tasks
    background_tasks.append(asyncio.create_task(log_monitor_loop()))
    background_tasks.append(asyncio.create_task(_metrics_broadcast_loop()))

    logger.info("defenseos_ready")
    yield

    # Shutdown: cancel background tasks cleanly
    for task in background_tasks:
        task.cancel()
    await asyncio.gather(*background_tasks, return_exceptions=True)
    logger.info("defenseos_shutdown")


# ── FastAPI app factory ───────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        description="Academic Blue Team / SOC monitoring platform",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    # Security: only accept known hosts in production
    if settings.APP_ENV == "production":
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

    # CORS — restrict to frontend origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount API v1
    app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

    @app.get("/health", tags=["Health"])
    async def health():
        return {"status": "ok", "app": settings.APP_NAME}

    return app


app = create_app()
