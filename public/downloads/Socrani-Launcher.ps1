# Socrani Desktop App Launcher
Write-Host "Starting Socrani Desktop App..." -ForegroundColor Green
Write-Host ""

# Check if Chrome is installed
$chromePath = Get-Command chrome -ErrorAction SilentlyContinue
if (-not $chromePath) {
    Write-Host "Chrome is not installed. Please install Google Chrome first." -ForegroundColor Red
    Write-Host "Download from: https://www.google.com/chrome/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Create temp directory for app data
$tempDir = Join-Path $env:TEMP "SocraniApp"
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
}

# Launch Socrani in Chrome with desktop app settings
Write-Host "Launching Socrani in desktop mode..." -ForegroundColor Cyan
Start-Process chrome -ArgumentList @(
    "--app=https://socrani.com",
    "--new-window",
    "--user-data-dir=$tempDir",
    "--no-first-run",
    "--no-default-browser-check"
)

Write-Host ""
Write-Host "Socrani Desktop App is starting..." -ForegroundColor Green
Write-Host "You can close this window once the app opens." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to close this launcher" 