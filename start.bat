@echo off
echo ========================================================
echo   Starting ApexSRE: Autonomous Chaos ^& Cascade Predictor
echo ========================================================
echo.
echo Starting FastAPI Backend on http://localhost:8000...
start "ApexSRE Backend" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

echo Starting Next.js Frontend on http://localhost:3000...
cd frontend
start "ApexSRE Frontend" cmd /k "npm run dev -- -p 3000"

echo.
echo ========================================================
echo   Both services launched!
echo   Open your browser at: http://localhost:3000
echo ========================================================
pause
