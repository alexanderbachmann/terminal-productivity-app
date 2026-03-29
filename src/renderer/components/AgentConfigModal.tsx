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
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Configure Claude Code Agents</h2>
        <p style={styles.subtitle}>{totalSlots} terminal{totalSlots > 1 ? 's' : ''} will be launched</p>

        <div style={styles.agentList}>
          {configs.map((config, i) => (
            <div key={i} style={styles.agentCard}>
              <div style={styles.cardHeader}>
                <input
                  style={styles.nameInput}
                  value={config.name || ''}
                  onChange={(e) => updateConfig(i, { name: e.target.value })}
                  placeholder={`Agent ${i + 1}`}
                />
              </div>

              <div style={styles.row}>
                <label style={styles.fieldLabel}>Model</label>
                <select
                  style={styles.select}
                  value={config.model || 'sonnet'}
                  onChange={(e) => updateConfig(i, { model: e.target.value })}
                >
                  {MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div style={styles.row}>
                <label style={styles.fieldLabel}>Permissions</label>
                <select
                  style={styles.select}
                  value={config.permissionMode || 'default'}
                  onChange={(e) => updateConfig(i, { permissionMode: e.target.value as ClaudeConfig['permissionMode'] })}
                >
                  {PERMISSION_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div style={styles.row}>
                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={config.useWorktree || false}
                    onChange={(e) => updateConfig(i, { useWorktree: e.target.checked })}
                  />
                  Use git worktree
                </label>
                {config.useWorktree && (
                  <input
                    style={styles.smallInput}
                    value={config.worktreeName || ''}
                    onChange={(e) => updateConfig(i, { worktreeName: e.target.value })}
                    placeholder="branch name"
                  />
                )}
              </div>

              <div style={styles.row}>
                <label style={styles.fieldLabel}>System prompt (append)</label>
                <textarea
                  style={styles.textarea}
                  value={config.appendSystemPrompt || ''}
                  onChange={(e) => updateConfig(i, { appendSystemPrompt: e.target.value })}
                  placeholder="Additional instructions for this agent..."
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <button style={styles.btnCancel} onClick={onCancel}>Cancel</button>
          <button style={styles.btnLaunch} onClick={() => onConfirm(configs)}>
            Launch {totalSlots} Agent{totalSlots > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100
  },
  modal: {
    backgroundColor: '#1a1a2e',
    border: '1px solid #0f3460',
    borderRadius: '8px',
    padding: '24px',
    width: '640px',
    maxHeight: '80vh',
    overflow: 'auto'
  },
  title: {
    margin: '0 0 4px',
    fontSize: '18px',
    color: '#e0e0e0'
  },
  subtitle: {
    margin: '0 0 16px',
    fontSize: '13px',
    color: '#7a7a9a'
  },
  agentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  agentCard: {
    backgroundColor: '#16213e',
    borderRadius: '6px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  nameInput: {
    flex: 1,
    padding: '6px 8px',
    border: '1px solid #0f3460',
    borderRadius: '4px',
    backgroundColor: '#1a1a2e',
    color: '#a0c4ff',
    fontSize: '14px',
    fontWeight: 600
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px'
  },
  fieldLabel: {
    fontSize: '12px',
    color: '#7a7a9a',
    minWidth: '100px',
    paddingTop: '6px'
  },
  select: {
    flex: 1,
    padding: '6px 8px',
    border: '1px solid #0f3460',
    borderRadius: '4px',
    backgroundColor: '#1a1a2e',
    color: '#e0e0e0',
    fontSize: '13px'
  },
  checkLabel: {
    fontSize: '12px',
    color: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer'
  },
  smallInput: {
    flex: 1,
    padding: '4px 8px',
    border: '1px solid #0f3460',
    borderRadius: '4px',
    backgroundColor: '#1a1a2e',
    color: '#e0e0e0',
    fontSize: '12px'
  },
  textarea: {
    flex: 1,
    padding: '6px 8px',
    border: '1px solid #0f3460',
    borderRadius: '4px',
    backgroundColor: '#1a1a2e',
    color: '#e0e0e0',
    fontSize: '12px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '16px'
  },
  btnCancel: {
    padding: '8px 16px',
    border: '1px solid #0f3460',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: '13px'
  },
  btnLaunch: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#0f3460',
    color: '#a0c4ff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600
  }
}
