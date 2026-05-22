"""
DefenseOS - Core Configuration
Centralized settings via Pydantic BaseSettings.
Reads from environment variables and .env file.
"""
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application ---
    APP_NAME: str = "DefenseOS"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "insecure-default-change-in-production"
    API_V1_PREFIX: str = "/api/v1"

    # --- JWT ---
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # --- Database ---
    DATABASE_URL: str = "sqlite+aiosqlite:///./defenseos.db"

    # --- CORS ---
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    # --- Bootstrap Admin ---
    FIRST_ADMIN_EMAIL: str = "admin@example.com"
    FIRST_ADMIN_PASSWORD: str = "Admin1234!"
    FIRST_ADMIN_USERNAME: str = "admin"

    # --- Monitoring Intervals (seconds) ---
    METRICS_INTERVAL: int = 5
    LOG_WATCH_INTERVAL: int = 2
    NETWORK_SCAN_INTERVAL: int = 30
    PROCESS_SCAN_INTERVAL: int = 10
    FILE_INTEGRITY_INTERVAL: int = 60

    # --- Log Paths ---
    LOG_PATHS: str = "/var/log/syslog,/var/log/auth.log"

    @property
    def log_paths_list(self) -> List[Path]:
        paths = []
        for p in self.LOG_PATHS.split(","):
            path = Path(p.strip())
            if path.exists():
                paths.append(path)
        return paths

    # --- Alert Thresholds ---
    CPU_ALERT_THRESHOLD: float = 85.0
    MEMORY_ALERT_THRESHOLD: float = 90.0
    DISK_ALERT_THRESHOLD: float = 90.0

    # --- Export ---
    REPORT_OUTPUT_DIR: str = "./reports"


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance — call this everywhere."""
    return Settings()
