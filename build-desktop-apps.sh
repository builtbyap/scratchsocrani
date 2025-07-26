#!/bin/bash

echo "Building Socrani Desktop Apps..."
echo

echo "Step 1: Installing dependencies..."
cd public/downloads
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo
echo "Step 2: Building Windows executable..."
npm run build:win
if [ $? -ne 0 ]; then
    echo "Error: Failed to build Windows executable"
    exit 1
fi

echo
echo "Step 3: Building macOS DMG..."
npm run build:mac
if [ $? -ne 0 ]; then
    echo "Error: Failed to build macOS DMG"
    exit 1
fi

echo
echo "Build completed successfully!"
echo "Check the dist/ directory for your executables."
echo
echo "Files created:"
echo "- Windows: dist/Socrani Setup 1.0.0.exe"
echo "- macOS: dist/Socrani-1.0.0.dmg"
echo 