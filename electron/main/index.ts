import { app, BrowserWindow, shell, ipcMain, Notification } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import { FileService } from '../services/FileService'

// 初始化服务
const fileService = new FileService()

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
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
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

// 设置内容安全策略
app.whenReady().then(() => {
  // 注册安全的IPC处理器
  setupSecureIPC()
})

let win: BrowserWindow | null = null
// 使用安全的preload脚本
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Subtitle Modifier',
    icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload,
      // 启用安全配置
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      // 设置内容安全策略
      additionalArguments: ['--disable-web-security']
    },
  })

  // 设置内容安全策略
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
        ]
      }
    })
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(url)
    // 仅在开发模式下打开开发者工具
    if (process.env.NODE_ENV === 'development') {
      win.webContents.openDevTools()
    }
  } else {
    win.loadFile(indexHtml)
  }

  // 清理资源
  win.on('closed', () => {
    fileService.cleanupTempFiles()
  })

  // 安全的外部链接处理
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  // 阻止导航到外部URL
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file:') && !url.startsWith('http://127.0.0.1') && !url.startsWith('http://localhost')) {
      event.preventDefault()
    }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
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

// 设置安全的IPC处理器
function setupSecureIPC() {
  // 文件操作IPC
  ipcMain.handle('file:read', async (_, filePath: string) => {
    try {
      return await fileService.readFile(filePath)
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`)
    }
  })

  ipcMain.handle('file:write', async (_, filePath: string, content: string) => {
    try {
      await fileService.writeFile(filePath, content)
      return true
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`)
    }
  })

  ipcMain.handle('file:exists', async (_, filePath: string) => {
    try {
      return await fileService.fileExists(filePath)
    } catch (error) {
      return false
    }
  })

  ipcMain.handle('file:showOpenDialog', async (_, options: any) => {
    return await fileService.showOpenDialog(options)
  })

  ipcMain.handle('file:showSaveDialog', async (_, options: any) => {
    return await fileService.showSaveDialog(options)
  })

  // 系统信息IPC
  ipcMain.handle('system:platform', () => {
    return process.platform
  })

  ipcMain.handle('system:version', () => {
    return process.version
  })

  ipcMain.handle('system:showNotification', (_, title: string, message: string) => {
    new Notification({
      title,
      body: message
    }).show()
  })

  // 窗口操作IPC
  ipcMain.handle('window:minimize', () => {
    if (win) win.minimize()
  })

  ipcMain.handle('window:maximize', () => {
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.handle('window:close', () => {
    if (win) win.close()
  })

  ipcMain.handle('window:setTitle', (_, title: string) => {
    if (win) win.setTitle(title)
  })

  // 字幕处理IPC (TODO: 实现具体逻辑)
  ipcMain.handle('subtitle:process', async (_, content: string, settings: any) => {
    // 这里将连接到字幕处理引擎
    return content
  })

  ipcMain.handle('subtitle:validate', async (_, content: string, format: string) => {
    // 这里将实现字幕格式验证
    return true
  })

  // 批量处理IPC (TODO: 实现具体逻辑)
  ipcMain.handle('batch:processFiles', async (_, files: string[], settings: any) => {
    // 这里将实现批量处理逻辑
    return { success: true, processedFiles: files }
  })

  ipcMain.handle('batch:extractArchive', async (_, archivePath: string) => {
    // 这里将实现压缩包解压逻辑
    return []
  })

  ipcMain.handle('batch:createArchive', async (_, files: string[], outputPath: string) => {
    // 这里将实现压缩包创建逻辑
    return true
  })
}
