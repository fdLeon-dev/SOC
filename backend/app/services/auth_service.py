"""
DefenseOS - Authentication Service
Handles login, token generation, and current-user resolution.
"""
from datetime import datetime, timezone
from typing import Optional

from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserRole
from app.schemas.user import TokenPair, UserCreate


async def authenticate_user(
    db: AsyncSession, username: str, password: str
) -> Optional[User]:
    """Return user if credentials are valid, else None."""
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    # Update last_login timestamp
    user.last_login = datetime.now(timezone.utc)
    db.add(user)
    return user


async def create_user(db: AsyncSession, data: UserCreate) -> User:
    """Create and persist a new user."""
    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


def issue_tokens(user: User) -> TokenPair:
    """Issue an access + refresh token pair for the given user."""
    access = create_access_token(
        subject=str(user.id),
        extra={"username": user.username, "role": user.role.value},
    )
    refresh = create_refresh_token(subject=str(user.id))
    return TokenPair(access_token=access, refresh_token=refresh)


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_current_user_from_token(
    db: AsyncSession, token: str
) -> Optional[User]:
    """Decode JWT and load the corresponding user from DB."""
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None
    return await get_user_by_id(db, user_id)


async def refresh_access_token(
    db: AsyncSession, refresh_token: str
) -> Optional[TokenPair]:
    """
    Validate refresh_token and issue new access + refresh tokens.
    Returns None if refresh_token is invalid or expired.
    """
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            return None
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None
    
    user = await get_user_by_id(db, user_id)
    if not user or not user.is_active:
        return None
    
    # Issue new token pair (rotate refresh token for security)
    return issue_tokens(user)


async def ensure_admin_exists(db: AsyncSession, settings) -> None:
    """Create the bootstrap admin account if no users exist."""
    result = await db.execute(select(User).where(User.username == settings.FIRST_ADMIN_USERNAME))
    admin = result.scalar_one_or_none()
    if admin is not None:
        updated = False
        if admin.email != settings.FIRST_ADMIN_EMAIL:
            admin.email = settings.FIRST_ADMIN_EMAIL
            updated = True
        if not verify_password(settings.FIRST_ADMIN_PASSWORD, admin.hashed_password):
            admin.hashed_password = hash_password(settings.FIRST_ADMIN_PASSWORD)
            updated = True
        if updated:
            db.add(admin)
        return
    admin = User(
        username=settings.FIRST_ADMIN_USERNAME,
        email=settings.FIRST_ADMIN_EMAIL,
        hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
        role=UserRole.ADMIN,
    )
    db.add(admin)
    await db.flush()
