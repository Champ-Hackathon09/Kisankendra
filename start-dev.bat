@echo off
cd /d "%~dp0"
title KisanKendra App Runner
echo ======================================================================
echo                 Starting KisanKendra Fullstack App
echo ======================================================================
echo.
echo  [1] Website Link (Frontend):  http://localhost:5173
echo  [2] API Link (Backend):      http://localhost:5000
echo.
echo ======================================================================
echo Opening your browser automatically at http://localhost:5173 in 3 sec...
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:5173"
echo ======================================================================
echo.

npm run dev
pause
