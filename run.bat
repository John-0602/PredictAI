@echo off
echo ============================================================
echo   Starting PredictAI - Smart Predictive Maintenance System
echo ============================================================
echo.
echo Launching Backend (FastAPI on port 8000)...
start "PredictAI Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo Launching Frontend (Vite React on port 5173)...
start "PredictAI Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Waiting 3 seconds for services to initialize...
timeout /t 3 /nobreak >nul

echo Opening browser at http://127.0.0.1:5173 ...
start http://127.0.0.1:5173

echo.
echo ============================================================
echo   PredictAI is running!
echo   Frontend: http://127.0.0.1:5173
echo   Backend:  http://127.0.0.1:8000
echo   API Docs: http://127.0.0.1:8000/docs
echo ============================================================
pause
