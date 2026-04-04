import type { VoiceEvent, VoiceError, VoiceStatus } from '../../shared/types'
import type { SpeechRecognitionProvider } from './SpeechRecognitionService'

const DEEPGRAM_WS_URL = 'wss://api.deepgram.com/v1/listen'

export class DeepgramProvider implements SpeechRecognitionProvider {
  private ws: WebSocket | null = null
  private mediaStream: MediaStream | null = null
  private audioContext: AudioContext | null = null
  private processor: ScriptProcessorNode | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private _isListening = false
  private _aborted = false
  private apiKey: string
  private hadError = false

  onResult: ((event: VoiceEvent) => void) | null = null
  onStatusChange: ((status: VoiceStatus) => void) | null = null
  onError: ((error: VoiceError) => void) | null = null

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  get isListening(): boolean {
    return this._isListening
  }

  async start(): Promise<void> {
    if (this._isListening) return
    this._aborted = false

    if (!this.apiKey) {
      this.onError?.({
        code: 'no-api-key',
        message: 'Deepgram API key not set. Open Settings (gear icon) to add your key.'
      })
      this.onStatusChange?.('error')
      return
    }

    // Check macOS-level microphone permission before attempting getUserMedia
    try {
      const permResult = await window.electronAPI.checkMicPermission()
      if (permResult.status === 'denied') {
        this.onError?.({
          code: 'mic-denied',
          message: 'Microphone access denied. Open System Settings → Privacy & Security → Microphone and enable this app.'
        })
        this.onStatusChange?.('error')
        return
      }
    } catch {
      // If the IPC call fails, proceed and let getUserMedia handle it
    }

    // Get microphone access first
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      const msg = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'Microphone access denied. Open System Settings → Privacy & Security → Microphone and enable this app.'
        : 'Could not access microphone. Check that a microphone is connected.'
      this.onError?.({
        code: 'mic-error',
        message: msg
      })
      this.onStatusChange?.('error')
      return
    }

    // Bail out if aborted while awaiting mic permission
    if (this._aborted) { this.cleanup(); return }

    // Detect actual hardware sample rate — Chromium often ignores the sampleRate hint
    const probeCtx = new AudioContext()
    const actualSampleRate = probeCtx.sampleRate
    probeCtx.close()

    const params = new URLSearchParams({
      model: 'nova-2',
      language: 'en-US',
      smart_format: 'true',
      interim_results: 'true',
      utterance_end_ms: '1500',
      vad_events: 'true',
      encoding: 'linear16',
      sample_rate: String(actualSampleRate),
      channels: '1'
    })

    // Try connecting with subprotocol auth first, then query param fallback
    const baseUrl = `${DEEPGRAM_WS_URL}?${params.toString()}`
    const connected = await this.tryConnect(baseUrl, ['token', this.apiKey])
      || await this.tryConnect(`${baseUrl}&token=${encodeURIComponent(this.apiKey)}`)

    // Bail out if aborted while awaiting connection
    if (this._aborted) { this.cleanup(); return }

    if (!connected) {
      this.cleanup()
      this.onError?.({
        code: 'ws-error',
        message: 'Could not connect to Deepgram. Verify your API key in Settings.'
      })
      this.onStatusChange?.('error')
    }
  }

  private tryConnect(url: string, protocols?: string[]): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url)
        ws.binaryType = 'arraybuffer'

        const timeout = setTimeout(() => {
          ws.close()
          resolve(false)
        }, 5000)

        ws.onopen = () => {
          clearTimeout(timeout)
          if (this._aborted) {
            ws.close()
            resolve(false)
            return
          }
          this.ws = ws
          this._isListening = true
          this.hadError = false
          this.wireUpSocket(ws)
          this.onStatusChange?.('listening')
          this.startStreaming()
          resolve(true)
        }

        ws.onerror = () => {
          clearTimeout(timeout)
          try { ws.close() } catch {}
          resolve(false)
        }

        ws.onclose = () => {
          clearTimeout(timeout)
          resolve(false)
        }
      } catch {
        resolve(false)
      }
    })
  }

  private wireUpSocket(ws: WebSocket): void {
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'Results') {
          const transcript = data.channel?.alternatives?.[0]?.transcript || ''
          if (transcript) {
            this.onResult?.({
              transcript,
              isFinal: data.is_final === true
            })
          }
        }
      } catch {
        // Ignore non-JSON messages
      }
    }

    ws.onerror = () => {
      this.hadError = true
    }

    ws.onclose = (event) => {
      const wasListening = this._isListening
      this._isListening = false
      this.cleanup()

      if (this.hadError || (wasListening && event.code !== 1000)) {
        let message: string
        if (event.code === 1008) {
          message = 'Invalid API key. Check Settings.'
        } else if (event.code === 1006) {
          message = 'Connection lost.'
        } else {
          message = `Connection closed (code ${event.code})`
        }
        this.onError?.({ code: `ws-${event.code}`, message })
        this.onStatusChange?.('error')
      } else {
        this.onStatusChange?.('idle')
      }
    }
  }

  private startStreaming(): void {
    if (!this.mediaStream || !this.ws) return

    // Use default sample rate (matches hardware) — Deepgram URL already has the matching rate
    this.audioContext = new AudioContext()
    this.source = this.audioContext.createMediaStreamSource(this.mediaStream)
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1)

    this.processor.onaudioprocess = (e) => {
      if (this.ws?.readyState !== WebSocket.OPEN) return
      const inputData = e.inputBuffer.getChannelData(0)
      const pcm = new Int16Array(inputData.length)
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]))
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
      }
      this.ws.send(pcm.buffer)
    }

    this.source.connect(this.processor)
    this.processor.connect(this.audioContext.destination)
  }

  stop(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'CloseStream' }))
    }
    this._isListening = false
    this.cleanup()
    this.onStatusChange?.('idle')
  }

  abort(): void {
    this._aborted = true
    this._isListening = false
    this.cleanup()
    this.onStatusChange?.('idle')
  }

  private cleanup(): void {
    try {
      this.source?.disconnect()
      this.processor?.disconnect()
      this.audioContext?.close()
    } catch {
      // Ignore cleanup errors
    }
    this.audioContext = null
    this.processor = null
    this.source = null

    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close()
      }
      this.ws = null
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop())
      this.mediaStream = null
    }
  }
}
