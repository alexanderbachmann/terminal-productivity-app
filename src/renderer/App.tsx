import React, { useState, useCallback, useEffect, useRef } from 'react'
import TerminalGrid from './components/TerminalGrid'
import LayoutPicker, { GRID_PRESETS } from './components/LayoutPicker'
import SettingsPopover from './components/SettingsPopover'
import { useTheme } from './ThemeContext'
import { useVoiceContext } from './voice/VoiceContext'
import { THEMES } from './themes'
import type { TerminalSession, GridLayout } from '../shared/types'

type AppPhase = 'pick-project' | 'pick-layout' | 'running'

export default function App() {
  const { themeId, setThemeId } = useTheme()
  const { toggleListening, activeSessionId } = useVoiceContext()
  const [projectPath, setProjectPath] = useState<string | null>(null)
  const [phase, setPhase] = useState<AppPhase>('pick-project')
  const [selectedLayout, setSelectedLayout] = useState<GridLayout | null>(null)
  const [terminals, setTerminals] = useState<TerminalSession[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [focusedTerminalId, setFocusedTerminalId] = useState<string | null>(null)
  const onFinalRef = useRef<Map<string, (text: string) => void>>(new Map())

  // Global keyboard shortcut: Cmd+Shift+M to toggle voice
  // Use refs to avoid stale closures — the handler identity stays stable
  const focusedRef = useRef(focusedTerminalId)
  focusedRef.current = focusedTerminalId
  const terminalsRef = useRef(terminals)
  terminalsRef.current = terminals

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger while typing in input fields (e.g., settings)
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        const tList = terminalsRef.current
        const targetId = focusedRef.current || (tList.length > 0 ? tList[0].id : null)
        if (!targetId) return

        let onFinal = onFinalRef.current.get(targetId)
        if (!onFinal) {
          onFinal = (text: string) => window.electronAPI.writeTerminal(targetId, text + '\n')
          onFinalRef.current.set(targetId, onFinal)
        }
        toggleListening(targetId, onFinal)
      }
    }
    // Use capture phase so it fires BEFORE xterm consumes the keystroke
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [toggleListening])

  const handlePickFolder = useCallback(async () => {
    const folder = await window.electronAPI.pickFolder()
    if (folder) {
      setProjectPath(folder)
      const saved = await window.electronAPI.loadWorkspace(folder)
      if (saved?.terminals?.length) {
        const preset = GRID_PRESETS.find((p) => p.id === saved.gridLayoutId)
        if (preset) {
          setSelectedLayout(preset)
          setTerminals(saved.terminals)
          setPhase('running')
          return
        }
      }
      setPhase('pick-layout')
    }
  }, [])

  const launchWithLayout = useCallback(
    (layout: GridLayout) => {
      if (!projectPath) return
      setSelectedLayout(layout)
      const totalSlots = layout.rows * layout.cols
      const sessions: TerminalSession[] = Array.from({ length: totalSlots }, (_, i) => ({
        id: String(Date.now()) + '-' + i,
        name: `Agent ${i + 1}`,
        cwd: projectPath,
        claudeConfig: {},
        cols: 80,
        rows: 24
      }))
      setTerminals(sessions)
      setFocusedTerminalId(sessions[0]?.id || null)
      setPhase('running')
    },
    [projectPath]
  )

  const handleCloseTerminal = useCallback((sessionId: string) => {
    window.electronAPI.closeTerminal(sessionId)
    onFinalRef.current.delete(sessionId)
    setTerminals((prev) => prev.filter((t) => t.id !== sessionId))
  }, [])

  const handleSaveWorkspace = useCallback(async () => {
    if (!projectPath || !selectedLayout) return
    await window.electronAPI.saveWorkspace({
      projectPath,
      terminals,
      gridLayoutId: selectedLayout.id,
      updatedAt: new Date().toISOString()
    })
  }, [projectPath, terminals, selectedLayout])

  const handleReset = useCallback(() => {
    terminals.forEach((t) => window.electronAPI.closeTerminal(t.id))
    onFinalRef.current.clear()
    setTerminals([])
    setPhase('pick-layout')
    setSelectedLayout(null)
    setFocusedTerminalId(null)
  }, [terminals])

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="title">Terminal Productivity</h1>
          {projectPath && (
            <span className="project-badge" title={projectPath}>
              {projectPath.split('/').pop()}
            </span>
          )}
        </div>
        <div className="header-right">
          <select
            className="theme-select"
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {phase === 'running' && (
            <>
              <button className="btn" onClick={handleSaveWorkspace}>
                Save Layout
              </button>
              <button className="btn" onClick={handleReset}>
                Reset
              </button>
            </>
          )}
          <button
            className="btn btn--settings"
            onClick={() => setSettingsOpen(!settingsOpen)}
            title="Voice & Settings"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="3" />
              <path d="M6.5 1.5h3l.4 1.6a5.5 5.5 0 0 1 1.3.8l1.6-.5 1.5 2.6-1.2 1.1a5.5 5.5 0 0 1 0 1.5l1.2 1.1-1.5 2.6-1.6-.5a5.5 5.5 0 0 1-1.3.8l-.4 1.6h-3l-.4-1.6a5.5 5.5 0 0 1-1.3-.8l-1.6.5-1.5-2.6 1.2-1.1a5.5 5.5 0 0 1 0-1.5L2.7 5.9l1.5-2.6 1.6.5a5.5 5.5 0 0 1 1.3-.8l.4-1.5Z" />
            </svg>
          </button>
          <SettingsPopover isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
          <button className="btn" onClick={handlePickFolder}>
            {projectPath ? 'Change Project' : 'Open Project'}
          </button>
        </div>
      </header>

      <main className="main">
        {phase === 'pick-project' && (
          <div className="empty-state">
            <h2 className="empty-title">Select a project folder to get started</h2>
            <p className="empty-desc">
              Each terminal will launch a Claude Code agent connected to your project
            </p>
            <button className="btn-large" onClick={handlePickFolder}>
              Open Project Folder
            </button>
          </div>
        )}

        {phase === 'pick-layout' && (
          <div className="empty-state">
            <h2 className="empty-title">Choose a terminal layout</h2>
            <p className="empty-desc">
              Click a layout to launch Claude Code agents immediately
            </p>
            <div className="layout-section">
              <LayoutPicker
                selectedId={null}
                onSelect={launchWithLayout}
              />
            </div>
          </div>
        )}

        {phase === 'running' && selectedLayout && terminals.length > 0 && (
          <TerminalGrid
            terminals={terminals}
            rows={selectedLayout.rows}
            cols={selectedLayout.cols}
            onClose={handleCloseTerminal}
            onFocusTerminal={setFocusedTerminalId}
          />
        )}
      </main>
    </div>
  )
}
