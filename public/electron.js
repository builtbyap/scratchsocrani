const { app, BrowserWindow, globalShortcut, ipcMain, screen, desktopCapturer } = require("electron")
const path = require("path")
const isDev = require("electron-is-dev")

let mainWindow

function createWindow() {
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true, // Keep context isolation enabled for security
      preload: path.join(__dirname, "preload.js"), // Load the preload script
      enableRemoteModule: false,
      webSecurity: false, // Temporarily disable for local file access in dev, re-enable for production
      allowRunningInsecureContent: true,
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: true,
    focusable: true,
    show: false,
    titleBarStyle: "hidden",
    vibrancy: "ultra-dark", // macOS only
    backgroundMaterial: "acrylic", // Windows only
  })

  // Load the app
  const startUrl = isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../out/index.html")}`

  mainWindow.loadURL(startUrl)

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show()

    // Focus the window but don't steal focus from other apps
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
  })

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null
  })

  // Prevent navigation away from the app
  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)

    // Allow navigation to localhost for dev, and Supabase auth redirects
    if (isDev && parsedUrl.origin === "http://localhost:3000") {
      return // Allow local navigation in dev
    }

    // Allow Supabase auth redirects and the new subscription required page
    if (
      parsedUrl.hostname.includes("supabase.co") ||
      parsedUrl.hostname.includes("socrani.com") ||
      parsedUrl.hostname.includes("localhost") ||
      (parsedUrl.hostname.includes("socrani.com") && parsedUrl.pathname.includes("/pricing"))
    ) {
      return // Allow Supabase auth redirects and subscription page
    }

    event.preventDefault()
  })
}

// App event handlers
app.whenReady().then(() => {
  createWindow()

  // Register global shortcuts
  globalShortcut.register("CommandOrControl+Shift+A", () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })

  // Register other global shortcuts
  globalShortcut.register("CommandOrControl+Shift+Q", () => {
    app.quit()
  })

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("will-quit", () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll()
})

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault()
  })
})

// IPC handlers for app functionality
ipcMain.handle("app-version", () => {
  return app.getVersion()
})

ipcMain.handle("quit-app", () => {
  app.quit()
})

ipcMain.handle("minimize-app", () => {
  if (mainWindow) {
    mainWindow.hide()
  }
})

ipcMain.handle("show-app", () => {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  }
})

// IPC handler for screenshot capture
ipcMain.handle("capture-screenshot", async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1920, height: 1080 }, // Capture at a reasonable resolution
    })

    if (sources.length === 0) {
      throw new Error("No screen sources found.")
    }

    // Assuming we want to capture the primary screen (usually the first source)
    const primaryScreenSource = sources[0]

    // Get the native image from the thumbnail
    const image = primaryScreenSource.thumbnail.toPNG() // Or toJPEG() for smaller size

    // Convert to base64
    const base64Image = image.toString("base64")
    return `data:image/png;base64,${base64Image}`
  } catch (error) {
    console.error("Failed to capture screenshot:", error)
    throw error
  }
})
