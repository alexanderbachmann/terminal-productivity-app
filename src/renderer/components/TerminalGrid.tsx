import React from 'react'
import TerminalPane from './TerminalPane'
import type { TerminalSession } from '../../shared/types'

interface Props {
  terminals: TerminalSession[]
  onClose: (sessionId: string) => void
}

export default function TerminalGrid({ terminals, onClose }: Props) {
  const count = terminals.length
  const cols = count <= 1 ? 1 : count <= 4 ? 2 : 3

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '2px',
        height: '100%',
        padding: '2px',
        backgroundColor: '#0d1117'
      }}
    >
      {terminals.map((t) => (
        <TerminalPane key={t.id} session={t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  )
}
