@echo off
title Translucent AI Assistant - Auto Launcher
echo ========================================
echo    Translucent AI Assistant
echo    Auto Launcher
echo ========================================
echo.

REM Set the app directory
set APP_DIR=translucent-ai-assistant
set ZIP_FILE=translucent-ai-assistant-source.zip

echo Checking for app files...
echo.

REM Check if the zip file exists
if not exist "%ZIP_FILE%" (
    echo ERROR: App source file not found: %ZIP_FILE%
    echo.
    echo Please make sure you downloaded the complete app package.
    echo.
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo.
    echo Installing Node.js automatically...
    echo.
    
    REM Try to download and install Node.js automatically
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile 'nodejs-installer.msi'}"
    if exist "nodejs-installer.msi" (
        echo Installing Node.js...
        start /wait msiexec /i nodejs-installer.msi /quiet /norestart
        del nodejs-installer.msi
        echo Node.js installation completed.
        echo.
    ) else (
        echo Failed to download Node.js automatically.
        echo Please install Node.js manually from: https://nodejs.org/
        echo Choose the LTS version for best compatibility.
        echo.
        pause
        exit /b 1
    )
)

REM Extract the app if it doesn't exist
if not exist "%APP_DIR%" (
    echo Extracting app files...
    echo This may take a moment...
    
    REM Use PowerShell to extract the zip file
    powershell -Command "& {Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '.' -Force}"
    
    if not exist "%APP_DIR%" (
        echo ERROR: Failed to extract app files.
        echo.
        pause
        exit /b 1
    )
    
    echo App files extracted successfully!
    echo.
)

REM Navigate to the app directory
cd %APP_DIR%

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes...
    echo.
    
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies.
        echo.
        pause
        exit /b 1
    )
    
    echo Dependencies installed successfully!
    echo.
)

echo ========================================
echo    Starting Translucent AI Assistant
echo ========================================
echo.
echo The app will open in your browser and as a desktop overlay.
echo.
echo Keyboard shortcuts:
echo - Ctrl+Shift+A: Show/Hide the assistant
echo - Ctrl+Shift+Q: Quit the app
echo - Ctrl+Shift+M: Toggle microphone
echo - Ctrl+Shift+F: Toggle file upload
echo.
echo Features:
echo - Voice input with speech recognition
echo - File analysis (images, documents, text)
echo - Screen watching for automatic questions
echo - Undetectable by screen sharing software
echo.

REM Start the development server
echo Starting the app...
start npm run dev

REM Wait a moment for the server to start
timeout /t 3 /nobreak >nul

REM Open the app in the default browser
echo Opening app in browser...
start http://localhost:3000

echo.
echo ========================================
echo    Translucent AI Assistant is ready!
echo ========================================
echo.
echo The app should now be running at: http://localhost:3000
echo.
echo You can close this window once the app opens.
echo.
echo If the app doesn't open automatically, please:
echo 1. Wait a few more seconds for the server to start
echo 2. Open your browser and go to: http://localhost:3000
echo 3. Or check the terminal window that opened
echo.
pause 