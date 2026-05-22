# DefenseOS Architecture

## High-level flow

1. System logs and host metrics are collected by backend services.
2. Raw signals become SecurityEvent records.
3. Correlation rules evaluate events and create Alert records when needed.
4. Analysts use the frontend to triage alerts and manage Incident records.
5. Metrics are exposed via REST and WebSocket channels.

## Components

### Backend

- Entry point: backend/app/main.py
- API routers: backend/app/api/v1/
- Domain models: backend/app/models/
- Business services: backend/app/services/
- Core config/security/db/logging: backend/app/core/

### Frontend

- Router shell: frontend/src/App.jsx
- Global auth state: frontend/src/lib/AuthContext.jsx
- API client and endpoints: frontend/src/lib/api.js
- Main pages: frontend/src/pages/

## Security model

- JWT access tokens for API access
- Role-based access control in dependency layer
- Protected frontend routes with auth guard

## Data model summary

- User: authentication and role
- SecurityEvent: raw normalized event
- Alert: actionable item derived from event
- Incident: investigation lifecycle, can group alerts

## Runtime jobs

### Log monitoring loop

- Tails configured host log files
- Runs keyword triage rules
- Persists events and triggers alert correlation

### Metrics broadcast loop

- Collects periodic host metrics
- Broadcasts metric payloads to websocket clients

## Deployment modes

### Local development

- scripts/setup.sh
- scripts/start-dev.sh

### Docker compose

- docker-compose.yml
- backend service on port 8000
- frontend service on port 80

## Current known gaps

- Refresh token endpoint is documented but not currently exposed in auth router
- Frontend sidebar includes Users nav item without Users page route implementation
- WebSocket metrics endpoint currently has no explicit token validation

These are good next milestones for portfolio maturity.
