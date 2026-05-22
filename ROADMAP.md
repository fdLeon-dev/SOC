# Roadmap

This roadmap is organized for portfolio impact and engineering maturity.

## v0.2 - Detection quality and API completeness

- Add auth refresh endpoint and token rotation flow
- Add Users page route and admin user management UI
- Add audit trail for alert and incident state transitions
- Add pagination metadata for list endpoints

## v0.3 - Correlation and response depth

- Add rule packs by source type (auth, network, process, file)
- Add deduplication and cooldown windows for noisy alerts
- Add incident timeline events and operator notes feed
- Add export options for incident reports

## v0.4 - Hardening and production readiness

- Add websocket auth and connection authorization checks
- Add environment-specific secure defaults
- Add structured audit logging for security-sensitive actions
- Add stricter CORS/host settings and deploy profiles

## v0.5 - Portfolio excellence

- Publish architecture diagram assets in docs/media
- Add benchmark scenario and measurable detection outcomes
- Add CI quality gates (lint, tests, basic security checks)
- Tag release notes with notable engineering milestones
