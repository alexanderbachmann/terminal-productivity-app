import React, { useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebglAddon } from '@xterm/addon-webgl'
import '@xterm/xterm/css/xterm.css'
import type { TerminalSession } from '../../shared/types'

interface Props {
  session: TerminalSession
  onClose: () => void
}

export default function TerminalPane({ session, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitRef = useRef<FitAddon | null>(null)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", Menlo, monospace',
      scrollback: 2000,
      theme: {
        background: '#1a1a2e',
        foreground: '#e0e0e0',
        cursor: '#a0c4ff',
        selectionBackground: '#264f78'
      }
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(containerRef.current)

    try {
      term.loadAddon(new WebglAddon())
    } catch {
      // WebGL not available, fall back to canvas renderer
    }

    fitAddon.fit()
    term.focus()

    termRef.current = term
    fitRef.current = fitAddon

    // Wire up listeners BEFORE creating the PTY so no output is lost
    term.onData((data) => {
      window.electronAPI.writeTerminal(session.id, data)
    })

    const removeDataListener = window.electronAPI.onTerminalData((output) => {
      if (output.sessionId === session.id) {
        term.write(output.data)
      }
    })

    const removeExitListener = window.electronAPI.onTerminalExit((data) => {
      if (data.sessionId === session.id) {
        setIsRunning(false)
        term.write(`\r\n\x1b[90m[Process exited with code ${data.exitCode}]\x1b[0m\r\n`)
      }
    })

    // Now create the PTY process
    const cols = term.cols
    const rows = term.rows
    window.electronAPI.createTerminal({ ...session, cols, rows })

    let resizeRaf: number | null = null
    const handleResize = () => {
      if (resizeRaf) return
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null
        fitAddon.fit()
        window.electronAPI.resizeTerminal(session.id, term.cols, term.rows)
      })
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(containerRef.current)

    return () => {
      removeDataListener()
      removeExitListener()
      resizeObserver.disconnect()
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      term.dispose()
    }
  }, [session.id])

  const handleRestart = () => {
    window.electronAPI.closeTerminal(session.id)
    if (termRef.current) {
      termRef.current.clear()
      termRef.current.write('\x1b[90mRestarting Claude Code...\x1b[0m\r\n')
    }
    setIsRunning(true)
    const cols = termRef.current?.cols ?? 80
    const rows = termRef.current?.rows ?? 24
    window.electronAPI.createTerminal({ ...session, cols, rows })
  }

  return (
    <div style={styles.pane}>
      <div style={styles.titleBar}>
        <span style={styles.name}>{session.name}</span>
        <div style={styles.controls}>
          <span style={{ ...styles.status, color: isRunning ? '#4ade80' : '#f87171' }}>
            {isRunning ? 'running' : 'stopped'}
          </span>
          <button style={styles.ctrlBtn} onClick={handleRestart} title="Restart">
            ↻
          </button>
          <button style={{ ...styles.ctrlBtn, color: '#f87171' }} onClick={onClose} title="Close">
            ✕
          </button>
        </div>
      </div>
      <div ref={containerRef} style={styles.terminal} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  pane: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    backgroundColor: '#1a1a2e',
    overflow: 'hidden'
  },
  titleBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 8px',
    backgroundColor: '#16213e',
    fontSize: '12px',
    flexShrink: 0
  },
  name: {
    fontWeight: 600,
    color: '#a0c4ff'
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  status: {
    fontSize: '11px'
  },
  ctrlBtn: {
    background: 'none',
    border: 'none',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0 4px'
  },
  terminal: {
    flex: 1,
    minHeight: 0,
    padding: '4px'
  }
}
