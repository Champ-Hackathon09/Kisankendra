@echo off
title Push KisanKendra to GitHub
cd /d "%~dp0"
echo ======================================================================
echo          KISANKENDRA - GITHUB REPOSITORY PUSH
echo ======================================================================
echo.
echo  Pushing code to https://github.com/Champ-Hackathon09/kisankendra.git...
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ======================================================================
    echo  [SUCCESS] Code successfully pushed to GitHub!
    echo  Ab Render dashboard pe jakar Blueprint ya Web Service deploy karein.
    echo ======================================================================
) else (
    echo ======================================================================
    echo  [ERROR] Push me koi dikkat aayi. Kripya upar ka message check karein.
    echo ======================================================================
)
echo.
pause
