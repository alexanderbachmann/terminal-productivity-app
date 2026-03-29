import React, { useState, useCallback } from 'react'
import TerminalGrid from './components/TerminalGrid'
import LayoutPicker, { GRID_PRESETS } from './components/LayoutPicker'
import type { TerminalSession, GridLayout } from '../shared/types'

type AppPhase = 'pick-project' | 'pick-layout' | 'running'

export default function App() {
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
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Terminal Productivity</h1>
          {projectPath && (
            <span style={styles.projectBadge} title={projectPath}>
              {projectPath.split('/').pop()}
            </span>
          )}
        </div>
        <div style={styles.headerRight}>
          {phase === 'running' && (
            <>
              <button style={styles.btn} onClick={handleSaveWorkspace}>
                Save Layout
              </button>
              <button style={styles.btn} onClick={handleReset}>
                Reset
              </button>
            </>
          )}
          <button style={styles.btn} onClick={handlePickFolder}>
            {projectPath ? 'Change Project' : 'Open Project'}
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {phase === 'pick-project' && (
          <div style={styles.emptyState}>
            <h2 style={styles.emptyTitle}>Select a project folder to get started</h2>
            <p style={styles.emptyDesc}>
              Each terminal will launch a Claude Code agent connected to your project
            </p>
            <button style={styles.btnLarge} onClick={handlePickFolder}>
              Open Project Folder
            </button>
          </div>
        )}

        {phase === 'pick-layout' && (
          <div style={styles.emptyState}>
            <h2 style={styles.emptyTitle}>Choose a terminal layout</h2>
            <p style={styles.emptyDesc}>
              Click a layout to launch Claude Code agents immediately
            </p>
            <div style={styles.layoutSection}>
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

const styles: Record<string, React.CSSProperties> = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#1a1a2e',
    color: '#e0e0e0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#16213e',
    borderBottom: '1px solid #0f3460',
    flexShrink: 0
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600
  },
  projectBadge: {
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#0f3460',
    color: '#a0c4ff'
  },
  btn: {
    padding: '6px 12px',
    border: '1px solid #0f3460',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: '13px'
  },
  btnLarge: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#0f3460',
    color: '#a0c4ff',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    marginTop: '16px'
  },
  main: {
    flex: 1,
    overflow: 'hidden',
    minHeight: 0
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '4px'
  },
  emptyTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600
  },
  emptyDesc: {
    margin: '4px 0 16px',
    fontSize: '14px',
    color: '#7a7a9a'
  },
  layoutSection: {
    marginTop: '12px'
  },
  layoutInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '16px',
    gap: '4px'
  },
  layoutLabel: {
    fontSize: '14px',
    color: '#a0c4ff',
    fontWeight: 500
  }
}
