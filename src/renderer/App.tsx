import React, { useState, useCallback } from 'react'
import TerminalGrid from './components/TerminalGrid'
import type { TerminalSession, TerminalTemplate } from '../shared/types'

let nextId = 1

const DEFAULT_TEMPLATES: TerminalTemplate[] = [
  {
    id: 'claude-default',
    name: 'Claude Code',
    command: 'claude',
    description: 'Start a Claude Code session'
  },
  {
    id: 'shell',
    name: 'Shell',
    command: '',
    description: 'Plain shell session'
  }
]

export default function App() {
  const [projectPath, setProjectPath] = useState<string | null>(null)
  const [terminals, setTerminals] = useState<TerminalSession[]>([])
  const [templates] = useState<TerminalTemplate[]>(DEFAULT_TEMPLATES)

  const handlePickFolder = useCallback(async () => {
    const folder = await window.electronAPI.pickFolder()
    if (folder) {
      setProjectPath(folder)
      setTerminals([])
      const saved = await window.electronAPI.loadWorkspace(folder)
      if (saved?.terminals?.length) {
        setTerminals(saved.terminals)
        nextId = Math.max(...saved.terminals.map((t) => parseInt(t.id) || 0)) + 1
      }
    }
  }, [])

  const handleAddTerminal = useCallback(
    (template?: TerminalTemplate) => {
      if (!projectPath) return
      const id = String(nextId++)
      const session: TerminalSession = {
        id,
        name: template?.name ? `${template.name} ${id}` : `Terminal ${id}`,
        cwd: projectPath,
        startupCommand: template?.command || undefined,
        templateId: template?.id,
        cols: 80,
        rows: 24
      }
      setTerminals((prev) => [...prev, session])
    },
    [projectPath]
  )

  const handleCloseTerminal = useCallback((sessionId: string) => {
    window.electronAPI.closeTerminal(sessionId)
    setTerminals((prev) => prev.filter((t) => t.id !== sessionId))
  }, [])

  const handleSaveWorkspace = useCallback(async () => {
    if (!projectPath) return
    await window.electronAPI.saveWorkspace(projectPath, terminals, templates)
  }, [projectPath, terminals, templates])

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
          <button style={styles.btn} onClick={handlePickFolder}>
            {projectPath ? 'Change Project' : 'Open Project'}
          </button>
          {projectPath && (
            <>
              <div style={styles.templateGroup}>
                {templates.map((t) => (
                  <button
                    key={t.id}
                    style={styles.btnPrimary}
                    onClick={() => handleAddTerminal(t)}
                    title={t.description}
                  >
                    + {t.name}
                  </button>
                ))}
              </div>
              <button style={styles.btn} onClick={handleSaveWorkspace}>
                Save Layout
              </button>
            </>
          )}
        </div>
      </header>

      <main style={styles.main}>
        {!projectPath ? (
          <div style={styles.emptyState}>
            <h2>Select a project folder to get started</h2>
            <button style={styles.btnLarge} onClick={handlePickFolder}>
              Open Project Folder
            </button>
          </div>
        ) : terminals.length === 0 ? (
          <div style={styles.emptyState}>
            <h2>No terminals open</h2>
            <p>Use the buttons above to add terminal sessions</p>
          </div>
        ) : (
          <TerminalGrid terminals={terminals} onClose={handleCloseTerminal} />
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
    WebkitAppRegion: 'drag' as unknown as string
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    WebkitAppRegion: 'no-drag' as unknown as string
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
  templateGroup: {
    display: 'flex',
    gap: '4px'
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
  btnPrimary: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#0f3460',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: '13px'
  },
  btnLarge: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#0f3460',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '16px'
  },
  main: {
    flex: 1,
    overflow: 'hidden'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    opacity: 0.7
  }
}
