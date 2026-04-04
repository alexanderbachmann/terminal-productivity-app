import React, { useState, useEffect, useRef } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPopover({ isOpen, onClose }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setApiKey(localStorage.getItem('deepgram-api-key') || '')
    setTestResult(null)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSave = () => {
    localStorage.setItem('deepgram-api-key', apiKey.trim())
    setSaved(true)
    setTestResult(null)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleTest = async () => {
    const key = apiKey.trim()
    if (!key) {
      setTestResult('Enter an API key first')
      return
    }
    setTesting(true)
    setTestResult(null)

    try {
      const result = await window.electronAPI.testDeepgramKey(key)
      if (result.status === 'valid') {
        setTestResult('Key is valid!')
      } else if (result.status === 'invalid') {
        setTestResult('Invalid API key')
      } else {
        setTestResult(result.message || 'Unknown error')
      }
    } catch {
      setTestResult('Failed to test key')
    }
    setTesting(false)
  }

  return (
    <div className="settings-popover" ref={popoverRef}>
      <h3 className="settings-title">Voice Settings</h3>

      <div className="settings-field">
        <label className="settings-label">Deepgram API Key</label>
        <input
          className="settings-input"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste your Deepgram API key..."
          spellCheck={false}
        />
        <p className="settings-hint">
          Get a free key at deepgram.com — used for speech-to-text
        </p>
        {testResult && (
          <p className={`settings-hint ${testResult.startsWith('Key is') ? 'settings-hint--success' : 'settings-hint--error'}`}>
            {testResult}
          </p>
        )}
      </div>

      <div className="settings-field">
        <label className="settings-label">Voice Shortcut</label>
        <p className="settings-hint">
          Press <kbd className="settings-kbd">Cmd+Shift+M</kbd> to toggle voice input on the focused terminal
        </p>
      </div>

      <div className="settings-actions">
        <button className="btn" onClick={handleTest} disabled={testing}>
          {testing ? 'Testing...' : 'Test Key'}
        </button>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn-launch" onClick={handleSave}>
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
  )
}
