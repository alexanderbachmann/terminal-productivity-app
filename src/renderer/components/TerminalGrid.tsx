import React from 'react'
import TerminalPane from './TerminalPane'
import type { TerminalSession } from '../../shared/types'

interface Props {
  terminals: TerminalSession[]
  rows: number
  cols: number
  onClose: (sessionId: string) => void
}

export default function TerminalGrid({ terminals, rows, cols, onClose }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: '2px',
        height: '100%',
        backgroundColor: '#0d1117'
      }}
    >
      {Array.from({ length: rows * cols }, (_, i) => {
        const session = i < terminals.length ? terminals[i] : null
        return session ? (
          <TerminalPane
            key={session.id}
            session={session}
            onClose={() => onClose(session.id)}
          />
        ) : (
          <div key={`empty-${i}`} style={styles.empty}>
            <span style={styles.emptyText}>Empty slot</span>
          </div>
        )
      })}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    border: '1px dashed #2a2a4e'
  },
  emptyText: {
    color: '#4a5568',
    fontSize: '13px'
  }
}
