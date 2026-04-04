import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import type { VoiceStatus } from '../../shared/types'
import type { SpeechRecognitionProvider } from './SpeechRecognitionService'
import { createProvider } from './index'

interface VoiceState {
  activeSessionId: string | null
  status: VoiceStatus
  interimTranscript: string
  error: string | null
}

interface VoiceContextValue extends VoiceState {
  toggleListening: (sessionId: string, onFinalTranscript: (text: string) => void) => void
  startListening: (sessionId: string, onFinalTranscript: (text: string) => void) => void
  stopListening: () => void
  isSessionListening: (sessionId: string) => boolean
}

const VoiceContext = createContext<VoiceContextValue | null>(null)

interface Props {
  children: React.ReactNode
}

export function VoiceProvider({ children }: Props) {
  const [state, setState] = useState<VoiceState>({
    activeSessionId: null,
    status: 'idle',
    interimTranscript: '',
    error: null
  })

  const providerRef = useRef<SpeechRecognitionProvider | null>(null)
  const onFinalRef = useRef<((text: string) => void) | null>(null)
  // Use a ref to always have current state in callbacks without stale closures
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    return () => {
      providerRef.current?.abort()
    }
  }, [])

  const stopListening = useCallback(() => {
    providerRef.current?.stop()
    providerRef.current = null
    onFinalRef.current = null
    setState({
      activeSessionId: null,
      status: 'idle',
      interimTranscript: '',
      error: null
    })
  }, [])

  const startListening = useCallback((sessionId: string, onFinalTranscript: (text: string) => void) => {
    // Stop any existing session first
    if (providerRef.current) {
      providerRef.current.abort()
      providerRef.current = null
    }

    onFinalRef.current = onFinalTranscript

    const provider = createProvider()

    // No Deepgram API key configured — show error without touching Web Speech API
    // (Web Speech API crashes the Electron renderer process)
    if (!provider) {
      setState({
        activeSessionId: null,
        status: 'error',
        interimTranscript: '',
        error: 'Speech recognition requires a Deepgram API key. Open Settings (gear icon) to add one.'
      })
      setTimeout(() => setState(prev => ({ ...prev, error: null })), 8000)
      return
    }

    providerRef.current = provider

    provider.onResult = (event) => {
      // Guard against callbacks from a replaced provider
      if (providerRef.current !== provider) return
      if (event.isFinal) {
        setState(prev => ({ ...prev, interimTranscript: '' }))
        onFinalRef.current?.(event.transcript)
      } else {
        setState(prev => ({ ...prev, interimTranscript: event.transcript }))
      }
    }

    provider.onStatusChange = (newStatus) => {
      if (providerRef.current !== provider) return
      setState(prev => ({
        ...prev,
        status: newStatus,
        activeSessionId: newStatus === 'idle' || newStatus === 'error' ? null : prev.activeSessionId
      }))
    }

    provider.onError = (err) => {
      if (providerRef.current !== provider) return
      setState(prev => ({ ...prev, error: err.message }))
      // Keep setup errors (missing key, denied mic) visible longer so the user can read them
      const isSetupError = err.code === 'no-api-key' || err.code === 'mic-denied'
      const timeout = isSetupError ? 8000 : 4000
      setTimeout(() => setState(prev => ({ ...prev, error: null })), timeout)
    }

    // Set "connecting" state — the provider's onStatusChange will set "listening" when ready
    setState({
      activeSessionId: sessionId,
      status: 'connecting' as VoiceStatus,
      interimTranscript: '',
      error: null
    })

    // Handle async start — catch any unhandled promise rejections
    const result = provider.start()
    if (result && typeof result.catch === 'function') {
      result.catch(() => {
        // Errors are already handled via onError callback
      })
    }
  }, [])

  // Use stateRef to avoid stale closures in toggleListening
  const toggleListening = useCallback((sessionId: string, onFinalTranscript: (text: string) => void) => {
    const current = stateRef.current
    if (current.activeSessionId === sessionId && (current.status === 'listening' || current.status === 'connecting')) {
      stopListening()
    } else {
      startListening(sessionId, onFinalTranscript)
    }
  }, [startListening, stopListening])

  const isSessionListening = useCallback((sessionId: string) => {
    return state.activeSessionId === sessionId && (state.status === 'listening' || state.status === 'connecting')
  }, [state.activeSessionId, state.status])

  return (
    <VoiceContext.Provider value={{
      ...state,
      toggleListening,
      startListening,
      stopListening,
      isSessionListening
    }}>
      {children}
    </VoiceContext.Provider>
  )
}

export function useVoiceContext(): VoiceContextValue {
  const ctx = useContext(VoiceContext)
  if (!ctx) throw new Error('useVoiceContext must be used within VoiceProvider')
  return ctx
}
