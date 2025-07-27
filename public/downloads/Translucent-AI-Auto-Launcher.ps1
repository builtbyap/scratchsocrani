# Translucent AI Assistant - Auto Launcher
# This script automatically extracts and launches the Translucent AI Assistant

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Translucent AI Assistant" -ForegroundColor White
Write-Host "    Auto Launcher" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set variables
$AppDir = "translucent-ai-assistant"
$ZipFile = "translucent-ai-assistant-source.zip"
$NodeVersion = "v20.11.0"

Write-Host "Checking for app files..." -ForegroundColor Yellow
Write-Host ""

# Check if the zip file exists
if (-not (Test-Path $ZipFile)) {
    Write-Host "ERROR: App source file not found: $ZipFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please make sure you downloaded the complete app package." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Node.js is installed
$nodePath = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodePath) {
    Write-Host "Node.js is not installed. Installing automatically..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        # Download Node.js installer
        $nodeUrl = "https://nodejs.org/dist/$NodeVersion/node-$NodeVersion-x64.msi"
        $installerPath = "nodejs-installer.msi"
        
        Write-Host "Downloading Node.js..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath -UseBasicParsing
        
        if (Test-Path $installerPath) {
            Write-Host "Installing Node.js..." -ForegroundColor Cyan
            Start-Process msiexec -ArgumentList "/i", $installerPath, "/quiet", "/norestart" -Wait
            Remove-Item $installerPath -Force
            Write-Host "Node.js installation completed!" -ForegroundColor Green
            Write-Host ""
            
            # Refresh environment variables
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        } else {
            throw "Failed to download Node.js installer"
        }
    }
    catch {
        Write-Host "Failed to install Node.js automatically." -ForegroundColor Red
        Write-Host "Please install Node.js manually from: https://nodejs.org/" -ForegroundColor Yellow
        Write-Host "Choose the LTS version for best compatibility." -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Extract the app if it doesn't exist
if (-not (Test-Path $AppDir)) {
    Write-Host "Extracting app files..." -ForegroundColor Yellow
    Write-Host "This may take a moment..." -ForegroundColor Gray
    
    try {
        Expand-Archive -Path $ZipFile -DestinationPath "." -Force
        Write-Host "App files extracted successfully!" -ForegroundColor Green
        Write-Host ""
    }
    catch {
        Write-Host "ERROR: Failed to extract app files." -ForegroundColor Red
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Navigate to the app directory
Set-Location $AppDir

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Gray
    Write-Host ""
    
    try {
        npm install
        Write-Host "Dependencies installed successfully!" -ForegroundColor Green
        Write-Host ""
    }
    catch {
        Write-Host "ERROR: Failed to install dependencies." -ForegroundColor Red
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Starting Translucent AI Assistant" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The app will open in your browser and as a desktop overlay." -ForegroundColor White
Write-Host ""
Write-Host "Keyboard shortcuts:" -ForegroundColor Yellow
Write-Host "- Ctrl+Shift+A: Show/Hide the assistant" -ForegroundColor Gray
Write-Host "- Ctrl+Shift+Q: Quit the app" -ForegroundColor Gray
Write-Host "- Ctrl+Shift+M: Toggle microphone" -ForegroundColor Gray
Write-Host "- Ctrl+Shift+F: Toggle file upload" -ForegroundColor Gray
Write-Host ""
Write-Host "Features:" -ForegroundColor Yellow
Write-Host "- Voice input with speech recognition" -ForegroundColor Gray
Write-Host "- File analysis (images, documents, text)" -ForegroundColor Gray
Write-Host "- Screen watching for automatic questions" -ForegroundColor Gray
Write-Host "- Undetectable by screen sharing software" -ForegroundColor Gray
Write-Host ""

# Start the development server
Write-Host "Starting the app..." -ForegroundColor Cyan
Start-Process npm -ArgumentList "run", "dev" -WindowStyle Minimized

# Wait for the server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open the app in the default browser
Write-Host "Opening app in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Translucent AI Assistant is ready!" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "The app should now be running at: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "You can close this window once the app opens." -ForegroundColor Yellow
Write-Host ""
Write-Host "If the app doesn't open automatically, please:" -ForegroundColor Yellow
Write-Host "1. Wait a few more seconds for the server to start" -ForegroundColor Gray
Write-Host "2. Open your browser and go to: http://localhost:3000" -ForegroundColor Gray
Write-Host "3. Or check the terminal window that opened" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to close this launcher" 