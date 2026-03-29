import React, { useEffect, useRef, useState } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebglAddon } from '@xterm/addon-webgl'
import '@xterm/xterm/css/xterm.css'
import { useTheme } from '../ThemeContext'
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
  const { theme, themeId } = useTheme()

  // Initialize terminal
  useEffect(() => {
    if (!containerRef.current) return

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", Menlo, monospace',
      scrollback: 2000,
      theme: theme.xterm
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

    // Wire up listeners BEFORE creating the PTY
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

  // Live theme switching
  useEffect(() => {
    if (termRef.current) {
      termRef.current.options.theme = theme.xterm
    }
  }, [themeId])

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
    <div className="pane">
      <div className="pane-title-bar">
        <span className="pane-name">{session.name}</span>
        <div className="pane-controls">
          <span className="pane-status">
            <span className={`pane-status-dot ${isRunning ? 'pane-status-dot--running' : 'pane-status-dot--stopped'}`} />
            <span className={isRunning ? 'pane-status-text--running' : 'pane-status-text--stopped'}>
              {isRunning ? 'running' : 'stopped'}
            </span>
          </span>
          <button className="ctrl-btn" onClick={handleRestart} title="Restart">
            ↻
          </button>
          <button className="ctrl-btn ctrl-btn--close" onClick={onClose} title="Close">
            ✕
          </button>
        </div>
      </div>
      <div ref={containerRef} className="pane-terminal" />
    </div>
  )
}
