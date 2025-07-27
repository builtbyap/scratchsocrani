@echo off
title Translucent AI Assistant Launcher
echo ========================================
echo    Translucent AI Assistant Launcher
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Choose the LTS version for best compatibility.
    echo.
    pause
    exit /b 1
)

REM Check if the translucent-ai-assistant directory exists
if not exist "translucent-ai-assistant" (
    echo ERROR: Translucent AI Assistant files not found.
    echo.
    echo Please download the complete app from:
    echo https://socrani.com/dashboard
    echo.
    echo Extract the files to this directory and try again.
    echo.
    pause
    exit /b 1
)

echo Starting Translucent AI Assistant...
echo.
echo This will:
echo 1. Install dependencies (first time only)
echo 2. Start the development server
echo 3. Launch the desktop app
echo.

REM Navigate to the app directory
cd translucent-ai-assistant

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo.
echo Starting Translucent AI Assistant...
echo.
echo The app will open in your browser and as a desktop overlay.
echo.
echo Keyboard shortcuts:
echo - Ctrl+Shift+A: Show/Hide the assistant
echo - Ctrl+Shift+Q: Quit the app
echo.

REM Start the development server and launch the app
start npm run dev

echo.
echo Translucent AI Assistant is starting...
echo You can close this window once the app opens.
echo.
pause 