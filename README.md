# DefenseOS

[English](README.md) | [Espanol](README.es.md)

<!-- Replace OWNER/REPO with your GitHub values after publishing -->
[![Backend CI](https://github.com/OWNER/REPO/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/OWNER/REPO/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/frontend-ci.yml)

End-to-end SOC and Blue Team lab built for practical security engineering.

DefenseOS ingests host signals, normalizes them into security events, correlates events into alerts, and tracks incidents from a single web console.

## Overview

This project is designed to demonstrate full defensive workflow ownership, not isolated scripts:

1. Collect host telemetry and logs
2. Triage and persist security events
3. Correlate events into actionable alerts
4. Manage incident lifecycle
5. Operate through a live SOC dashboard

## GitHub About (copy/paste)

Use this in the repository About field:

`End-to-end SOC lab: host telemetry, event triage, alert correlation, and incident management with FastAPI + React.`

Suggested topics:

`soc` `blue-team` `detection-engineering` `incident-response` `fastapi` `react` `cybersecurity` `purple-team`

## Why this project matters

Many security portfolios show separate tools without showing operational flow. DefenseOS proves you can build and connect the complete detection-to-response loop.

## Core features

- FastAPI backend with async SQLAlchemy
- React dashboard with role-aware routing
- JWT authentication and role-based access control
- Background tasks for log monitoring and metrics broadcast
- REST API for events, alerts, incidents, metrics, and users
- SQLite default database for easy local usage

## Demo value in 60 seconds

1. Login as analyst/admin
2. Watch system metrics update live
3. Inspect event feed with severity/category filters
4. Triage alerts by status
5. Create and update incidents

Use [docs/DEMO_RUNBOOK.md](docs/DEMO_RUNBOOK.md) for a full interview-ready walkthrough.

## Screenshots

> Replace placeholders in `docs/media` with real screenshots from your running app.

Login

![DefenseOS Login](docs/media/login.svg)

Dashboard

![DefenseOS Dashboard](docs/media/dashboard.svg)

Alerts

![DefenseOS Alerts](docs/media/alerts.svg)

Incidents

![DefenseOS Incidents](docs/media/incidents.svg)

## Tech stack

### Backend

- Python 3.13
- FastAPI
- SQLAlchemy 2.x (async)
- Pydantic v2
- Structlog
- Psutil
- Pytest + pytest-asyncio

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Query
- Axios
- Recharts

## Quick start

### Option A: local scripts (recommended)

```bash
cd /home/safe/pentest/tools/def
bash scripts/setup.sh
bash scripts/start-dev.sh
```

Endpoints:

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/api/docs

Default bootstrap user:

- Username: admin
- Password: Admin1234!

### Option B: Docker

```bash
cd /home/safe/pentest/tools/def
docker-compose up --build
```

- Frontend: http://localhost:80
- Backend API docs: http://localhost:8000/api/docs

## Testing

```bash
cd backend
.venv/bin/python -m pytest tests -v
```

## CI status

GitHub Actions workflows included:

- Backend CI: test suite
- Frontend CI: production build

## Repository structure

```text
backend/         FastAPI app, models, services, tests
frontend/        React app, pages, UI components
scripts/         Local setup and start scripts
docs/            Architecture, demo runbook, portfolio docs
.github/         CI workflows and collaboration templates
```

## Documentation map

- Architecture: docs/ARCHITECTURE.md
- Demo runbook: docs/DEMO_RUNBOOK.md
- Roadmap: ROADMAP.md
- Contributing guide: CONTRIBUTING.md
- Portfolio checklist: docs/PORTFOLIO_CHECKLIST.md
- GitHub profile template: docs/PROFILE_README_TEMPLATE.md
- GitHub overview kit: docs/GITHUB_OVERVIEW.md

## Portfolio talking points

Use these points in interviews and GitHub descriptions:

- Built an end-to-end SOC workflow, not only isolated scripts
- Implemented event to alert correlation logic
- Added role-based API authorization and protected frontend routes
- Designed background jobs for live telemetry and log ingestion
- Maintained automated tests and reproducible developer setup

## Known improvements (next milestones)

- Add refresh token endpoint implementation to match auth docs
- Add frontend Users page route for admin navigation
- Add auth validation for metrics websocket endpoint

## Security and ethics notice

DefenseOS is for educational and defensive use in authorized environments only.

Do not deploy in production without hardening, secret rotation, stronger authentication controls, and proper monitoring boundaries.

## License

Add a license file before public release (MIT or Apache-2.0 recommended for portfolio projects).
