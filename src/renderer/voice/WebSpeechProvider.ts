import type { VoiceEvent, VoiceError, VoiceStatus } from '../../shared/types'
import type { SpeechRecognitionProvider } from './SpeechRecognitionService'

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export class WebSpeechProvider implements SpeechRecognitionProvider {
  private recognition: SpeechRecognition | null = null
  private _isListening = false
  private shouldRestart = false

  onResult: ((event: VoiceEvent) => void) | null = null
  onStatusChange: ((status: VoiceStatus) => void) | null = null
  onError: ((error: VoiceError) => void) | null = null

  get isListening(): boolean {
    return this._isListening
  }

  start(): void {
    if (this._isListening) return

    // Web Speech API is not functional in Electron — it relies on Google's
    // cloud speech service credentials baked into Chrome, which Electron
    // does not have.  Attempting to call recognition.start() will crash the
    // renderer process (blank screen).  Bail out with a helpful message.
    if (navigator.userAgent.includes('Electron')) {
      this.onError?.({
        code: 'not-supported',
        message: 'Speech recognition requires a Deepgram API key. Open Settings (gear icon) to add one.'
      })
      this.onStatusChange?.('error')
      return
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    if (!SpeechRecognition) {
      this.onError?.({ code: 'not-supported', message: 'Speech recognition is not supported' })
      this.onStatusChange?.('error')
      return
    }

    this.recognition = new SpeechRecognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'en-US'

    this.recognition.onstart = () => {
      this._isListening = true
      this.shouldRestart = true
      this.onStatusChange?.('listening')
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        this.onResult?.({
          transcript: result[0].transcript,
          isFinal: result.isFinal
        })
      }
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const error: VoiceError = {
        code: event.error,
        message: this.getErrorMessage(event.error)
      }
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.shouldRestart = false
        this._isListening = false
        this.onStatusChange?.('error')
      }
      this.onError?.(error)
    }

    this.recognition.onend = () => {
      this._isListening = false
      if (this.shouldRestart) {
        // Auto-restart on unexpected end (e.g., silence timeout)
        try {
          this.recognition?.start()
        } catch {
          this.onStatusChange?.('idle')
        }
      } else {
        this.onStatusChange?.('idle')
      }
    }

    try {
      this.recognition.start()
    } catch {
      this.onError?.({ code: 'start-failed', message: 'Failed to start speech recognition' })
    }
  }

  stop(): void {
    this.shouldRestart = false
    this.recognition?.stop()
  }

  abort(): void {
    this.shouldRestart = false
    this.recognition?.abort()
    this._isListening = false
    this.onStatusChange?.('idle')
  }

  private getErrorMessage(error: string): string {
    switch (error) {
      case 'not-allowed':
        return 'Microphone access denied'
      case 'no-speech':
        return 'No speech detected'
      case 'audio-capture':
        return 'No microphone found'
      case 'network':
        return 'Network error'
      default:
        return `Recognition error: ${error}`
    }
  }
}
