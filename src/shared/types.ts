export interface ClaudeConfig {
  name?: string
  model?: string
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan' | 'auto'
  appendSystemPrompt?: string
  useWorktree?: boolean
  worktreeName?: string
  bare?: boolean
  maxBudgetUsd?: number
}

export interface TerminalSession {
  id: string
  name: string
  cwd: string
  claudeConfig: ClaudeConfig
  cols: number
  rows: number
}

export interface GridLayout {
  id: string
  label: string
  rows: number
  cols: number
}

export interface WorkspaceLayout {
  projectPath: string
  terminals: TerminalSession[]
  gridLayoutId: string
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
