@echo off
rem ============================================================
rem DefenseOS - Start all services in development mode (Windows)
rem Usage: scripts\start-dev.bat
rem ============================================================

pushd "%~dp0\.."

echo Starting DefenseOS backend on http://127.0.0.1:8000
start "DefenseOS Backend" cmd /k "cd /d "%~dp0\..\backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting DefenseOS frontend on http://127.0.0.1:5173
start "DefenseOS Frontend" cmd /k "cd /d "%~dp0\..\frontend" && npm start"

echo.
echo DefenseOS launched.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:5173

echo Press any key to return to the terminal.
pause > nul

popd
