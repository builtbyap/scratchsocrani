@echo off
title Socrani Desktop App
echo Starting Socrani Desktop App...
echo.

REM Check if Chrome is installed
where chrome >nul 2>nul
if %errorlevel% neq 0 (
    echo Chrome is not installed. Please install Google Chrome first.
    echo Download from: https://www.google.com/chrome/
    pause
    exit /b 1
)

REM Launch Socrani in Chrome with desktop app settings
echo Launching Socrani in desktop mode...
start chrome --app="https://socrani.com" --new-window --user-data-dir="%TEMP%\SocraniApp"

echo.
echo Socrani Desktop App is starting...
echo You can close this window once the app opens.
echo.
echo Keyboard shortcuts:
echo - Ctrl+Shift+A: Show/Hide the app
echo - Ctrl+Shift+Q: Quit the app
echo.
pause 