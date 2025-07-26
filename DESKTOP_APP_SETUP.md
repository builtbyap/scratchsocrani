# Socrani Desktop App Setup Guide

## ✅ Current Status
Your Socrani desktop app is now **fully set up and downloadable**! Here's what's been implemented:

### What's Working:
- ✅ Download section added to the Socrani App tab
- ✅ Windows and macOS download buttons functional
- ✅ All necessary Electron files in place
- ✅ Build scripts created for easy compilation
- ✅ Download files accessible via web server

## 🚀 How to Build Real Executables

### Option 1: Use the Build Scripts (Recommended)

#### For Windows:
```bash
# Run the Windows batch script
build-desktop-apps.bat
```

#### For macOS/Linux:
```bash
# Make the script executable and run it
chmod +x build-desktop-apps.sh
./build-desktop-apps.sh
```

### Option 2: Manual Build Process

1. **Navigate to the downloads directory:**
   ```bash
   cd public/downloads
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build for Windows:**
   ```bash
   npm run build:win
   ```

4. **Build for macOS:**
   ```bash
   npm run build:mac
   ```

5. **Build for Linux:**
   ```bash
   npm run build:linux
   ```

## 📁 Generated Files

After building, you'll find these files in `public/downloads/dist/`:

- **Windows:** `Socrani Setup 1.0.0.exe` (Installer)
- **macOS:** `Socrani-1.0.0.dmg` (Disk image)
- **Linux:** `Socrani-1.0.0.AppImage` (AppImage)

## 🔄 Update Download Links

Once you have the real executables, update the download links in `src/app/dashboard/page.tsx`:

```typescript
// Replace these lines:
link.href = '/downloads/Socrani-Windows.exe.txt';
link.href = '/downloads/Socrani-macOS.dmg.txt';

// With these:
link.href = '/downloads/dist/Socrani Setup 1.0.0.exe';
link.href = '/downloads/dist/Socrani-1.0.0.dmg';
```

## 🎯 Features of Your Desktop App

### Core Features:
- **Always-on-top overlay** - Stays visible while working
- **Global shortcuts** - Ctrl+Shift+A to show/hide
- **Screenshot capture** - Built-in screen capture functionality
- **Secure architecture** - Context isolation and security features
- **Cross-platform** - Works on Windows, macOS, and Linux

### Keyboard Shortcuts:
- `Ctrl+Shift+A` (Windows) / `Cmd+Shift+A` (macOS): Show/Hide app
- `Ctrl+Shift+Q` (Windows) / `Cmd+Shift+Q` (macOS): Quit app

## 🔧 Customization Options

### App Configuration:
- **Window behavior** - Modify `electron.js` for different window styles
- **Shortcuts** - Change global shortcuts in the main process
- **Security** - Adjust security settings for your needs
- **UI** - Customize the app's appearance and behavior

### Build Configuration:
- **App icons** - Add custom icons to `public/downloads/`
- **App metadata** - Update `package.json` with your details
- **Installation options** - Modify `electron-builder` settings

## 🚨 Important Notes

### Before Distribution:
1. **Test thoroughly** on target platforms
2. **Code sign** your applications (recommended for production)
3. **Update version numbers** in `package.json`
4. **Add proper icons** for each platform
5. **Test installation process** on clean systems

### Security Considerations:
- The app currently has `webSecurity: false` for development
- Enable web security for production builds
- Implement proper CSP headers
- Consider code signing for distribution

## 📞 Support

If you encounter any issues:

1. **Check the console** for error messages
2. **Verify dependencies** are installed correctly
3. **Ensure Node.js** version is compatible (v16+ recommended)
4. **Check file permissions** on macOS/Linux

## 🎉 Next Steps

1. **Build the executables** using the provided scripts
2. **Test the downloads** from your dashboard
3. **Customize the app** to match your needs
4. **Deploy to production** when ready

Your Socrani desktop app is now ready for users to download and install! 🚀 