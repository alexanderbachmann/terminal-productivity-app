import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { TerminalManager } from './terminalManager'
import { SessionStore } from './sessionStore'
import type { TerminalSession } from '../shared/types'

let mainWindow: BrowserWindow | null = null
const terminalManager = new TerminalManager()
const sessionStore = new SessionStore()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Terminal Productivity App',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function registerIpcHandlers(): void {
  ipcMain.handle('workspace:pick-folder', async () => {
    if (!mainWindow) return null
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('terminal:create', (_event, session: TerminalSession) => {
    try {
      const pty = terminalManager.create(session)

      pty.onData((data: string) => {
        mainWindow?.webContents.send('terminal:data', {
          sessionId: session.id,
          data
        })
      })

      pty.onExit(({ exitCode }: { exitCode: number }) => {
        mainWindow?.webContents.send('terminal:exit', {
          sessionId: session.id,
          exitCode
        })
      })

      return { success: true, sessionId: session.id }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('Failed to create terminal:', message)
      // Send the error as terminal output so the user sees it in the pane
      mainWindow?.webContents.send('terminal:data', {
        sessionId: session.id,
        data: `\r\n\x1b[31mFailed to start Claude Code: ${message}\x1b[0m\r\n`
      })
      mainWindow?.webContents.send('terminal:exit', {
        sessionId: session.id,
        exitCode: 1
      })
      return { success: false, sessionId: session.id, error: message }
    }
  })

  ipcMain.on('terminal:write', (_event, sessionId: string, data: string) => {
    terminalManager.write(sessionId, data)
  })

  ipcMain.on('terminal:resize', (_event, sessionId: string, cols: number, rows: number) => {
    terminalManager.resize(sessionId, cols, rows)
  })

  ipcMain.on('terminal:close', (_event, sessionId: string) => {
    terminalManager.close(sessionId)
  })

  ipcMain.handle('workspace:save', (_event, layout) => {
    sessionStore.save(layout)
    return { success: true }
  })

  ipcMain.handle('workspace:load', (_event, projectPath: string) => {
    return sessionStore.load(projectPath)
  })
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  terminalManager.closeAll()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
