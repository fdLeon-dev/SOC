# Contributing

Thanks for contributing to DefenseOS.

## Development setup

1. Run setup script:

```bash
bash scripts/setup.sh
```

2. Start local development:

```bash
bash scripts/start-dev.sh
```

## Local checks before PR

### Backend tests

```bash
cd backend
.venv/bin/python -m pytest tests -v
```

### Frontend build

```bash
cd frontend
npm run build
```

## Pull request expectations

- Keep PR scope focused
- Explain security impact in the PR description
- Add or update tests for behavior changes
- Update docs when endpoints or setup steps change

## Code style

- Backend: follow existing FastAPI + SQLAlchemy async patterns
- Frontend: keep route guards and API layer consistent
- Avoid adding unreviewed dependencies unless clearly justified

## Security and ethics

This project is defensive and educational.

Do not add offensive payloads, unauthorized scanning logic, or unsafe defaults in shared examples.
