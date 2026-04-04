import React from 'react'
import TerminalPane from './TerminalPane'
import type { TerminalSession } from '../../shared/types'

interface Props {
  terminals: TerminalSession[]
  rows: number
  cols: number
  onClose: (sessionId: string) => void
  onFocusTerminal?: (sessionId: string) => void
}

export default function TerminalGrid({ terminals, rows, cols, onClose, onFocusTerminal }: Props) {
  return (
    <div
      className="terminal-grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`
      }}
    >
      {Array.from({ length: rows * cols }, (_, i) => {
        const session = i < terminals.length ? terminals[i] : null
        return session ? (
          <TerminalPane
            key={session.id}
            session={session}
            onClose={() => onClose(session.id)}
            onFocus={() => onFocusTerminal?.(session.id)}
          />
        ) : (
          <div key={`empty-${i}`} className="pane pane--empty">
            <span className="pane-empty-text">Empty slot</span>
          </div>
        )
      })}
    </div>
  )
}
