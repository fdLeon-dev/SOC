"""
DefenseOS - Authentication Routes
POST /auth/login   → returns access + refresh tokens
POST /auth/refresh → exchanges refresh token for new access token
GET  /auth/me      → returns current user profile
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.user import LoginRequest, TokenPair, UserOut
from app.services.auth_service import (
    authenticate_user,
    get_current_user_from_token,
    issue_tokens,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
bearer = HTTPBearer()


@router.post("/login", response_model=TokenPair)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with username + password, receive JWT tokens."""
    user = await authenticate_user(db, body.username, body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    return issue_tokens(user)


@router.get("/me", response_model=UserOut)
async def me(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db),
):
    """Return the profile of the currently authenticated user."""
    user = await get_current_user_from_token(db, credentials.credentials)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return user
