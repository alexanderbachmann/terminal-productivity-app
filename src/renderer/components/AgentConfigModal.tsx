import React, { useState } from 'react'
import type { ClaudeConfig } from '../../shared/types'

interface Props {
  slotIndex: number
  totalSlots: number
  onConfirm: (configs: ClaudeConfig[]) => void
  onCancel: () => void
}

const MODELS = ['sonnet', 'opus', 'haiku']
const PERMISSION_MODES = ['default', 'acceptEdits', 'plan', 'auto'] as const

export default function AgentConfigModal({ slotIndex: _slotIndex, totalSlots, onConfirm, onCancel }: Props) {
  const [configs, setConfigs] = useState<ClaudeConfig[]>(() =>
    Array.from({ length: totalSlots }, (_, i) => ({
      name: `Agent ${i + 1}`,
      model: 'sonnet',
      permissionMode: 'default' as const,
      appendSystemPrompt: '',
      useWorktree: false,
      worktreeName: '',
      bare: false
    }))
  )

  const updateConfig = (idx: number, patch: Partial<ClaudeConfig>) => {
    setConfigs((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)))
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">Configure Claude Code Agents</h2>
        <p className="modal-subtitle">{totalSlots} terminal{totalSlots > 1 ? 's' : ''} will be launched</p>

        <div className="agent-list">
          {configs.map((config, i) => (
            <div key={i} className="agent-card">
              <div className="agent-card-header">
                <input
                  className="agent-name-input"
                  value={config.name || ''}
                  onChange={(e) => updateConfig(i, { name: e.target.value })}
                  placeholder={`Agent ${i + 1}`}
                />
              </div>

              <div className="agent-row">
                <label className="agent-field-label">Model</label>
                <select
                  className="agent-select"
                  value={config.model || 'sonnet'}
                  onChange={(e) => updateConfig(i, { model: e.target.value })}
                >
                  {MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="agent-row">
                <label className="agent-field-label">Permissions</label>
                <select
                  className="agent-select"
                  value={config.permissionMode || 'default'}
                  onChange={(e) => updateConfig(i, { permissionMode: e.target.value as ClaudeConfig['permissionMode'] })}
                >
                  {PERMISSION_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="agent-row">
                <label className="agent-check-label">
                  <input
                    type="checkbox"
                    checked={config.useWorktree || false}
                    onChange={(e) => updateConfig(i, { useWorktree: e.target.checked })}
                  />
                  Use git worktree
                </label>
                {config.useWorktree && (
                  <input
                    className="agent-small-input"
                    value={config.worktreeName || ''}
                    onChange={(e) => updateConfig(i, { worktreeName: e.target.value })}
                    placeholder="branch name"
                  />
                )}
              </div>

              <div className="agent-row">
                <label className="agent-field-label">System prompt (append)</label>
                <textarea
                  className="agent-textarea"
                  value={config.appendSystemPrompt || ''}
                  onChange={(e) => updateConfig(i, { appendSystemPrompt: e.target.value })}
                  placeholder="Additional instructions for this agent..."
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-launch" onClick={() => onConfirm(configs)}>
            Launch {totalSlots} Agent{totalSlots > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
