"""
DefenseOS - Basic API Tests
Run with: pytest tests/ -v
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
async def client():
    async with app.router.lifespan_context(app):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            yield ac


@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_login_wrong_credentials(client):
    r = await client.post(
        "/api/v1/auth/login",
        json={"username": "nobody", "password": "wrong"},
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_login_and_me(client):
    # Login as bootstrap admin
    r = await client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "Admin1234!"},
    )
    assert r.status_code == 200
    tokens = r.json()
    assert "access_token" in tokens

    # Get own profile
    r2 = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert r2.status_code == 200
    assert r2.json()["username"] == "admin"


@pytest.mark.asyncio
async def test_metrics_requires_auth(client):
    r = await client.get("/api/v1/metrics/system")
    assert r.status_code == 403  # No bearer token
