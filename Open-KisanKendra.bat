@echo off
cd /d "%~dp0"
title KisanKendra - Smart Launcher
cls
echo ======================================================================
echo                     KISAN KENDRA PORTAL
echo ======================================================================
echo.
echo  Checking KisanKendra Server status...
echo.

powershell -Command "$status = try { (Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing -TimeoutSec 2).StatusCode } catch { 0 }; if ($status -eq 200) { exit 0 } else { exit 1 }" >nul 2>&1

if %ERRORLEVEL% equ 0 (
    echo  [OK] KisanKendra Server pehle se ACTIVE hai!
    echo  [OK] Browser khul raha hai: http://localhost:5173
    start http://localhost:5173
    timeout /t 3 >nul
    exit
)

echo  [*] Server band tha. KisanKendra start ho raha hai...
echo  [*] Kripya is window ko minimize rakhein (band na karein).
echo.
echo  Opening browser at http://localhost:5173 in 4 seconds...
start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:5173"
echo.
echo ======================================================================
echo.
npm run dev
pause
