#!/usr/bin/env bash
# ============================================================
# DefenseOS - Local Development Setup Script
# Usage: bash scripts/setup.sh
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
VENV="$BACKEND/.venv"

echo "╔══════════════════════════════════════╗"
echo "║     DefenseOS — Dev Setup            ║"
echo "╚══════════════════════════════════════╝"

# ── .env ──────────────────────────────────────────────────────────────────────
if [[ ! -f "$ROOT/.env" ]]; then
  cp "$ROOT/.env.example" "$ROOT/.env"
  # Generate a random SECRET_KEY
  SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
  sed -i "s/CHANGE_ME_USE_openssl_rand_hex_32/$SECRET/" "$ROOT/.env"
  echo "✓ .env created with generated SECRET_KEY"
else
  echo "✓ .env already exists — skipping"
fi

# ── Python venv ────────────────────────────────────────────────────────────────
echo ""
echo "→ Setting up Python virtual environment…"
python3 -m venv "$VENV"
"$VENV/bin/pip" install --upgrade pip --quiet
"$VENV/bin/pip" install -r "$BACKEND/requirements.txt" --quiet
echo "✓ Python dependencies installed"

# ── Node.js ───────────────────────────────────────────────────────────────────
echo ""
echo "→ Installing Node.js dependencies…"
cd "$FRONTEND"
npm install --silent
echo "✓ Node dependencies installed"

# ── Reports dir ───────────────────────────────────────────────────────────────
mkdir -p "$ROOT/reports"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Setup complete!                                      ║"
echo "║                                                       ║"
echo "║  Start backend:                                       ║"
echo "║    cd backend && .venv/bin/python -m uvicorn \\      ║"
echo "║      app.main:app --reload                            ║"
echo "║                                                       ║"
echo "║  Start frontend:                                      ║"
echo "║    cd frontend && npm run dev                         ║"
echo "║                                                       ║"
echo "║  OR use Docker:                                       ║"
echo "║    docker-compose up --build                          ║"
echo "╚══════════════════════════════════════════════════════╝"
