"""
DefenseOS - Users Routes (Admin only)
GET    /users       → list all users
POST   /users       → create a new user
PATCH  /users/{id} → update role/status
DELETE /users/{id} → deactivate
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import require_roles
from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.services.auth_service import create_user
from app.services.audit_service import log_audit

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("/", response_model=list[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN)),
):
    result = await db.execute(select(User))
    return result.scalars().all()


@router.post("/", response_model=UserOut, status_code=201)
async def create_new_user(
    body: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN)),
):
    # Check for duplicate username / email
    dup = await db.execute(
        select(User).where(
            (User.username == body.username) | (User.email == body.email)
        )
    )
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Username or email already exists")
    
    user = await create_user(db, body)
    
    # Log to audit trail
    await log_audit(
        db, current_user.username, "user", user.id, "create",
        f"User created: {user.username} (role={user.role.value})"
    )
    
    return user


@router.patch("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    body: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN)),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Track changes
    changes = []
    for field, value in body.model_dump(exclude_none=True).items():
        old_value = getattr(user, field, None)
        if field == "password":
            from app.core.security import hash_password
            user.hashed_password = hash_password(value)
            changes.append(f"{field}: (changed)")
        else:
            if old_value != value:
                changes.append(f"{field}: {old_value} → {value}")
            setattr(user, field, value)
    
    db.add(user)
    await db.flush()
    await db.refresh(user)
    
    # Log to audit trail if there were changes
    if changes:
        await log_audit(
            db, current_user.username, "user", user.id, "update",
            ", ".join(changes)
        )
    
    return user


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.ADMIN)),
):
    """Deactivate a user account."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log deletion before deactivating
    await log_audit(
        db, current_user.username, "user", user.id, "delete",
        f"User deactivated: {user.username}"
    )
    
    user.is_active = False
    db.add(user)
    await db.flush()
