export interface TerminalSession {
  id: string
  name: string
  cwd: string
  startupCommand?: string
  templateId?: string
  cols: number
  rows: number
}

export interface TerminalTemplate {
  id: string
  name: string
  command: string
  description?: string
}

export interface WorkspaceLayout {
  projectPath: string
  terminals: TerminalSession[]
  templates: TerminalTemplate[]
  updatedAt: string
}

export interface TerminalOutput {
  sessionId: string
  data: string
}

export type IpcChannels =
  | 'terminal:create'
  | 'terminal:write'
  | 'terminal:resize'
  | 'terminal:close'
  | 'terminal:data'
  | 'terminal:exit'
  | 'workspace:save'
  | 'workspace:load'
  | 'workspace:pick-folder'
  | 'template:list'
  | 'template:save'
