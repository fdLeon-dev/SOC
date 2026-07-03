# DefenseOS

[English](README.md) | [Espanol](README.es.md)

A small project I built to explore how a SOC workflow can feel when the pieces are connected instead of split apart. It takes host signals, turns them into events, groups them into alerts, and helps keep incident work in one place.

## What it does

The app is meant to feel like a practical lab rather than a polished product. It lets you:

- collect basic host activity and logs
- organize those signals into security events
- raise alerts when something stands out
- keep incident notes and status in one place

## A quick look

It is designed to be simple to follow. You can log in, watch the dashboard update, review alerts, and move through incident work without switching between separate tools.

## Running locally

If you want to try it out, the easiest path is:

```bash
bash scripts/setup.sh
bash scripts/start-dev.sh
```

On Windows:

```bat
scripts\start-dev.bat
```

The local app is usually available at:

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/api/docs

Default login:

- Username: admin
- Password: Admin1234!

## Notes

This project was built as a learning and practice space for defensive workflows. It is not meant to replace a real security operations setup, but it is useful for getting a better feel for how the pieces fit together.
