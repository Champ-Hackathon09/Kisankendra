@echo off
title Push KisanKendra to GitHub
cd /d "%~dp0"
echo ======================================================================
echo          KISANKENDRA - GITHUB REPOSITORY PUSH
echo ======================================================================
echo.
echo  Staging all changes...
git add -A
echo  Creating commit with latest fixes...
git commit -m "Fix Prisma booking foreign key, elevate modern UI theme and animations"
echo.
echo  Pushing code to https://github.com/Champ-Hackathon09/kisankendra.git...
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ======================================================================
    echo  [SUCCESS] Code successfully pushed to GitHub!
    echo  Render automatically updates and redeploys the latest code!
    echo ======================================================================
) else (
    echo ======================================================================
    echo  [NOTICE] Agar 'nothing to commit' tha to bhi push check ho gaya.
    echo ======================================================================
)
echo.
pause
