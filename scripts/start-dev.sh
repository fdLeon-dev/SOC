#!/usr/bin/env bash
# ============================================================
# DefenseOS - Start all services in development mode
# Usage: bash scripts/start-dev.sh
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV="$ROOT/backend/.venv"

if [[ ! -f "$ROOT/.env" ]]; then
  echo "Error: .env not found. Run scripts/setup.sh first."
  exit 1
fi

# Load env vars
set -a; source "$ROOT/.env"; set +a

# Start backend in background
echo "→ Starting backend on :8000"
cd "$ROOT/backend"
"$VENV/bin/python" -m uvicorn app.main:app \
  --host 0.0.0.0 --port 8000 --reload \
  --log-level info &
BACKEND_PID=$!

# Start frontend
echo "→ Starting frontend on :5173"
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "DefenseOS is running:"
echo "  Backend  → http://localhost:8000/api/docs"
echo "  Frontend → http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait and clean up on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" INT TERM
wait
