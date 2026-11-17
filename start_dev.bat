@echo off
echo ========================================================
echo  Starting WebInsight - AI Website Summarizer
echo ========================================================
echo.
echo Starting Flask backend on http://127.0.0.1:5000...
start "WebInsight Backend" cmd /k "cd backend && python app.py"

echo Starting Vite frontend on http://localhost:5173...
start "WebInsight Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting up!
echo Frontend: http://localhost:5173
echo Backend:  http://127.0.0.1:5000
echo ========================================================
pause
