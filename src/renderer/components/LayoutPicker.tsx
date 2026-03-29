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
      className={`layout-icon ${selected ? 'layout-icon--selected' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`
      }}
    >
      {cells.map((_, i) => (
        <div key={i} className="layout-icon-cell" />
      ))}
    </div>
  )
}

export default function LayoutPicker({ selectedId, onSelect }: Props) {
  return (
    <div className="layout-picker">
      <span className="layout-picker-label">Layout</span>
      <div className="layout-picker-grid">
        {GRID_PRESETS.map((preset) => (
          <button
            key={preset.id}
            className="layout-btn"
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
