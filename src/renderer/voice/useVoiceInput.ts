import { useState, useCallback, useRef, useEffect } from 'react'
import type { VoiceStatus } from '../../shared/types'
import type { SpeechRecognitionProvider } from './SpeechRecognitionService'
import { createProvider } from './index'

interface UseVoiceInputReturn {
  isListening: boolean
  status: VoiceStatus
  interimTranscript: string
  error: string | null
  toggleListening: () => void
  startListening: () => void
  stopListening: () => void
}

export function useVoiceInput(
  onFinalTranscript: (text: string) => void
): UseVoiceInputReturn {
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const providerRef = useRef<SpeechRecognitionProvider | null>(null)
  const onFinalRef = useRef(onFinalTranscript)
  onFinalRef.current = onFinalTranscript

  useEffect(() => {
    return () => {
      providerRef.current?.abort()
    }
  }, [])

  const startListening = useCallback(() => {
    setError(null)
    setInterimTranscript('')

    const provider = createProvider()
    providerRef.current = provider

    provider.onResult = (event) => {
      if (event.isFinal) {
        setInterimTranscript('')
        onFinalRef.current(event.transcript)
      } else {
        setInterimTranscript(event.transcript)
      }
    }

    provider.onStatusChange = (newStatus) => {
      setStatus(newStatus)
    }

    provider.onError = (err) => {
      setError(err.message)
      setTimeout(() => setError(null), 3000)
    }

    provider.start()
  }, [])

  const stopListening = useCallback(() => {
    providerRef.current?.stop()
    providerRef.current = null
    setInterimTranscript('')
  }, [])

  const toggleListening = useCallback(() => {
    if (status === 'listening') {
      stopListening()
    } else {
      startListening()
    }
  }, [status, startListening, stopListening])

  return {
    isListening: status === 'listening',
    status,
    interimTranscript,
    error,
    toggleListening,
    startListening,
    stopListening
  }
}
