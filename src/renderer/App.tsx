import React, { useState, useCallback } from 'react'
import TerminalGrid from './components/TerminalGrid'
import LayoutPicker, { GRID_PRESETS } from './components/LayoutPicker'
import { useTheme } from './ThemeContext'
import { THEMES } from './themes'
import type { TerminalSession, GridLayout } from '../shared/types'

type AppPhase = 'pick-project' | 'pick-layout' | 'running'

export default function App() {
  const { themeId, setThemeId } = useTheme()
  const [projectPath, setProjectPath] = useState<string | null>(null)
  const [phase, setPhase] = useState<AppPhase>('pick-project')
  const [selectedLayout, setSelectedLayout] = useState<GridLayout | null>(null)
  const [terminals, setTerminals] = useState<TerminalSession[]>([])

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
      setPhase('running')
    },
    [projectPath]
  )

  const handleCloseTerminal = useCallback((sessionId: string) => {
    window.electronAPI.closeTerminal(sessionId)
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
    setTerminals([])
    setPhase('pick-layout')
    setSelectedLayout(null)
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
          />
        )}
      </main>
    </div>
  )
}
