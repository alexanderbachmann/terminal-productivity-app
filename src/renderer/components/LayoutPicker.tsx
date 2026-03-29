import React from 'react'
import type { GridLayout } from '../../shared/types'

export const GRID_PRESETS: GridLayout[] = [
  { id: '1x1', label: '1×1', rows: 1, cols: 1 },
  { id: '2x1', label: '2×1', rows: 1, cols: 2 },
  { id: '1x2', label: '1×2', rows: 2, cols: 1 },
  { id: '2x2', label: '2×2', rows: 2, cols: 2 },
  { id: '3x1', label: '3×1', rows: 1, cols: 3 },
  { id: '1x3', label: '1×3', rows: 3, cols: 1 },
  { id: '3x2', label: '3×2', rows: 2, cols: 3 },
  { id: '2x3', label: '2×3', rows: 3, cols: 2 },
  { id: '3x3', label: '3×3', rows: 3, cols: 3 },
]

interface Props {
  selectedId: string | null
  onSelect: (layout: GridLayout) => void
}

function LayoutIcon({ rows, cols, selected }: { rows: number; cols: number; selected: boolean }) {
  const cells = Array.from({ length: rows * cols })
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: '2px',
        width: 36,
        height: 28,
        padding: '3px',
        borderRadius: '4px',
        border: selected ? '2px solid #a0c4ff' : '2px solid transparent',
        backgroundColor: selected ? 'rgba(160, 196, 255, 0.1)' : 'transparent'
      }}
    >
      {cells.map((_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: selected ? '#a0c4ff' : '#4a5568',
            borderRadius: 2,
            minWidth: 0,
            minHeight: 0
          }}
        />
      ))}
    </div>
  )
}

export default function LayoutPicker({ selectedId, onSelect }: Props) {
  return (
    <div style={styles.container}>
      <span style={styles.label}>Layout</span>
      <div style={styles.grid}>
        {GRID_PRESETS.map((preset) => (
          <button
            key={preset.id}
            style={styles.btn}
            onClick={() => onSelect(preset)}
            title={preset.label}
          >
            <LayoutIcon
              rows={preset.rows}
              cols={preset.cols}
              selected={selectedId === preset.id}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  label: {
    fontSize: '12px',
    color: '#a0a0b0',
    fontWeight: 500
  },
  grid: {
    display: 'flex',
    gap: '2px',
    flexWrap: 'wrap'
  },
  btn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}
