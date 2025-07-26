const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electron", {
  captureScreenshot: () => ipcRenderer.invoke("capture-screenshot"),
  // You can expose other IPC functions here if needed
  // For example, to quit the app:
  // quitApp: () => ipcRenderer.invoke('quit-app'),
})
