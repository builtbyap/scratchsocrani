# Socrani Desktop App - Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: App Won't Open After Download

**Symptoms:**
- Double-clicking `Socrani.exe` does nothing
- App appears briefly then closes
- No error message appears

**Solutions:**

#### Solution A: Check Windows Defender/Antivirus
1. **Windows Defender**: May block the app as suspicious
   - Right-click `Socrani.exe`
   - Select "Run as administrator"
   - If blocked, click "More info" → "Run anyway"

2. **Third-party Antivirus**: Add to exceptions
   - Open your antivirus software
   - Add the Socrani folder to exclusions
   - Or temporarily disable real-time protection

#### Solution B: Check File Integrity
1. **Verify Download**: Make sure the file is complete
   - File size should be ~102MB
   - If smaller, re-download from https://socrani.com

2. **Check File Location**: Ensure proper extraction
   - Extract to a simple path like `C:\Socrani\`
   - Avoid paths with special characters or spaces

#### Solution C: Run from Command Line
1. **Open Command Prompt** as Administrator
2. **Navigate** to the Socrani folder:
   ```
   cd "C:\path\to\Socrani"
   ```
3. **Run the app**:
   ```
   Socrani.exe
   ```
4. **Check for error messages** in the console

### Issue 2: App Opens But Shows Blank Screen

**Symptoms:**
- App window appears but is empty
- Shows loading screen indefinitely
- No content loads

**Solutions:**

#### Solution A: Check Internet Connection
1. **Verify connectivity** to https://socrani.com
2. **Check firewall** settings
3. **Try different network** (mobile hotspot)

#### Solution B: Clear App Cache
1. **Close the app** completely
2. **Delete cache folder** (if exists):
   - `%APPDATA%\Socrani\`
   - `%LOCALAPPDATA%\Socrani\`
3. **Restart the app**

#### Solution C: Run in Debug Mode
1. **Create a shortcut** to `Socrani.exe`
2. **Right-click shortcut** → Properties
3. **Add to Target**: `"C:\path\to\Socrani.exe" --debug`
4. **Run the shortcut** to see debug info

### Issue 3: App Crashes Immediately

**Symptoms:**
- App starts then immediately closes
- Windows shows "Socrani.exe has stopped working"

**Solutions:**

#### Solution A: Check System Requirements
- **Windows 10 or later** (64-bit)
- **4GB RAM** minimum
- **200MB free disk space**
- **Internet connection** required

#### Solution B: Update Windows
1. **Check for Windows updates**
2. **Install Visual C++ Redistributables**
3. **Update graphics drivers**

#### Solution C: Run Compatibility Mode
1. **Right-click** `Socrani.exe`
2. **Properties** → Compatibility tab
3. **Run compatibility troubleshooter**
4. **Try Windows 8 compatibility mode**

### Issue 4: Keyboard Shortcuts Don't Work

**Symptoms:**
- `Ctrl+Shift+A` doesn't show/hide app
- `Ctrl+Shift+Q` doesn't quit app

**Solutions:**

#### Solution A: Check App Focus
1. **Make sure app is running**
2. **Click inside the app window** to give it focus
3. **Try shortcuts again**

#### Solution B: Check for Conflicts
1. **Other apps** might use same shortcuts
2. **Check Windows shortcuts** in Settings
3. **Try different shortcuts** temporarily

### Issue 5: App Won't Stay on Top

**Symptoms:**
- App disappears behind other windows
- Doesn't maintain "always on top" behavior

**Solutions:**

#### Solution A: Check App Settings
1. **Right-click** app window
2. **Look for "Always on Top"** option
3. **Enable if available**

#### Solution B: Check Windows Settings
1. **Windows Settings** → System → Focus assist
2. **Turn off** focus assist
3. **Check notification settings**

## Advanced Troubleshooting

### Debug Mode
To run the app in debug mode and see detailed error messages:

1. **Open Command Prompt** as Administrator
2. **Navigate** to Socrani folder
3. **Run**: `Socrani.exe --debug`

### Log Files
Check for log files in:
- `%APPDATA%\Socrani\logs\`
- `%LOCALAPPDATA%\Socrani\logs\`

### Reinstall Steps
If nothing else works:

1. **Delete** the entire Socrani folder
2. **Download fresh copy** from https://socrani.com
3. **Extract to new location**
4. **Run as administrator**

## System Requirements

### Minimum Requirements:
- **OS**: Windows 10 (64-bit) or later
- **RAM**: 4GB
- **Storage**: 200MB free space
- **Network**: Internet connection
- **Display**: 1024x768 resolution

### Recommended Requirements:
- **OS**: Windows 11 (64-bit)
- **RAM**: 8GB or more
- **Storage**: 1GB free space
- **Network**: High-speed internet
- **Display**: 1920x1080 or higher

## Support

If you're still having issues:

1. **Visit**: https://socrani.com/support
2. **Email**: support@socrani.com
3. **Include**: 
   - Windows version
   - Error messages
   - Steps to reproduce
   - Screenshots if possible

---

*Last updated: December 2024* 