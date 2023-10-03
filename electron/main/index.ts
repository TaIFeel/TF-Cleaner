import { app, BrowserWindow, shell, ipcMain, globalShortcut } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import { update } from './update'


// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '../')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')

console.log(process.env.DIST)
const indexHtml = join(process.env.DIST, 'index.html')
console.log(indexHtml)

process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const url = process.env.VITE_DEV_SERVER_URL


async function createWindow() {
  win = new BrowserWindow({
    title: 'TCleaner',
    icon: join(process.env.VITE_PUBLIC, 'fvc.ico'),
    width:550,
    height:550,
    minWidth:600,
    minHeight:550,
    frame:false,
    autoHideMenuBar:true,
    transparent: true,

    
    webPreferences: {
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },  
  })




  require('@electron/remote/main').enable(win.webContents)
  require('@electron/remote/main').initialize()

  // win.removeMenu()

  if (url) { // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // // Apply electron-updater
  // update(win)
}

app.whenReady().then(createWindow)

app.on('ready', () => {
  globalShortcut.register('Control+Shift+I', () => {
    win?.webContents.openDevTools({mode: 'detach'})

});
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})


ipcMain.handle('close', () => {
  app.quit()
})

ipcMain.handle('minimize', () => {
  win?.minimize()
})
