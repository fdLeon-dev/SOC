import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.username == 'admin'))
        u = res.scalar_one_or_none()
        print('exists', bool(u))
        if u:
            print('email', u.email)
            print('role', u.role)
            print('active', u.is_active)
            print('hashed', u.hashed_password)

asyncio.run(main())
