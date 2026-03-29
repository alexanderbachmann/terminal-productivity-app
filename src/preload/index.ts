import { contextBridge, ipcRenderer } from 'electron'
import type { TerminalSession, TerminalTemplate, TerminalOutput } from '../shared/types'

const api = {
  pickFolder: (): Promise<string | null> =>
    ipcRenderer.invoke('workspace:pick-folder'),

  createTerminal: (session: TerminalSession): Promise<{ success: boolean; sessionId: string }> =>
    ipcRenderer.invoke('terminal:create', session),

  writeTerminal: (sessionId: string, data: string): void =>
    ipcRenderer.send('terminal:write', sessionId, data),

  resizeTerminal: (sessionId: string, cols: number, rows: number): void =>
    ipcRenderer.send('terminal:resize', sessionId, cols, rows),

  closeTerminal: (sessionId: string): void =>
    ipcRenderer.send('terminal:close', sessionId),

  onTerminalData: (callback: (output: TerminalOutput) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, output: TerminalOutput) => callback(output)
    ipcRenderer.on('terminal:data', listener)
    return () => ipcRenderer.removeListener('terminal:data', listener)
  },

  onTerminalExit: (callback: (data: { sessionId: string; exitCode: number }) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: { sessionId: string; exitCode: number }) => callback(data)
    ipcRenderer.on('terminal:exit', listener)
    return () => ipcRenderer.removeListener('terminal:exit', listener)
  },

  saveWorkspace: (projectPath: string, terminals: TerminalSession[], templates: TerminalTemplate[]) =>
    ipcRenderer.invoke('workspace:save', projectPath, terminals, templates),

  loadWorkspace: (projectPath: string) =>
    ipcRenderer.invoke('workspace:load', projectPath),

  listTemplates: (projectPath: string): Promise<TerminalTemplate[]> =>
    ipcRenderer.invoke('template:list', projectPath),

  saveTemplate: (projectPath: string, template: TerminalTemplate) =>
    ipcRenderer.invoke('template:save', projectPath, template)
}

export type ElectronAPI = typeof api

contextBridge.exposeInMainWorld('electronAPI', api)
