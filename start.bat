@echo off
echo ========================================================
echo Starting Unified Career Intelligence Platform...
echo (GoalMind AI + AI Resume Analyzer + Interview Simulator)
echo ========================================================

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0start.ps1"

echo ========================================================
echo Platform is ready! Access your dashboard at:
echo   - http://localhost:3000
echo ========================================================
pause
