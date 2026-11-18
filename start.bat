@echo off
title WASTELENS AI Launcher
echo ========================================================
echo   Launching WASTELENS AI (Backend + Frontend)
echo ========================================================
echo.

:: Start Backend in a new window
start "WASTELENS Backend (Port 3001)" cmd /k "cd /d %~dp0server && node --experimental-fetch src/index.js"

:: Start Frontend in a new window
start "WASTELENS Frontend (Port 5173)" cmd /k "cd /d %~dp0client && npx vite --port 5173"

:: Wait 2 seconds and open browser
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo [DONE] Both servers started!
echo - Backend:  http://localhost:3001
echo - Frontend: http://localhost:5173
echo ========================================================
pause
