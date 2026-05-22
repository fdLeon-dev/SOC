# DefenseOS Demo Runbook

Use this runbook to present DefenseOS in interviews, portfolio videos, or live demos.

## Demo objective

Show an end-to-end SOC cycle:

1. Authenticate
2. Observe host telemetry
3. Ingest or observe events
4. Verify alert generation
5. Update incident status

## Pre-demo checklist

- Project setup completed
- Backend and frontend running
- Browser tabs ready:
  - Frontend dashboard
  - API docs at /api/docs
- Use default admin credentials or prepared analyst account

## Demo script (5 to 8 minutes)

### Step 1: Login and orientation

- Open frontend
- Login as admin
- Explain dashboard areas: alerts, events, incidents, metrics, network, processes

### Step 2: Metrics visibility

- Open Metrics page
- Point to CPU and memory live graph
- Open Network and Processes pages
- Explain suspicious process flagging strategy

### Step 3: Event pipeline

- Open Events page
- Show categories and severity filters
- Mention event schema and MITRE field support

### Step 4: Alert operations

- Open Alerts page
- Filter by status and severity
- Change alert status open -> investigating -> resolved

### Step 5: Incident workflow

- Open Incidents page
- Create a new incident
- Move incident state to in_progress or contained
- Explain investigation lifecycle usage

## Suggested narration points

- This is a practical defensive engineering lab, not only UI.
- Correlation turns noisy events into actionable alerts.
- Incident state handling mirrors real SOC operations.
- Architecture is intentionally reproducible for portfolio review.

## Optional advanced demo

- Trigger synthetic events via API
- Show resulting alert creation
- Discuss how to expand rules into Sigma or SIEM detections

## Post-demo follow-up assets

- 60 to 90 second screen capture GIF/video
- Architecture diagram screenshot
- README section with measurable outcomes and next milestones
