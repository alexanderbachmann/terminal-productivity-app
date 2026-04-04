import type { VoiceEvent, VoiceError, VoiceStatus } from '../../shared/types'

export interface SpeechRecognitionProvider {
  start(): void | Promise<void>
  stop(): void
  abort(): void
  readonly isListening: boolean
  onResult: ((event: VoiceEvent) => void) | null
  onStatusChange: ((status: VoiceStatus) => void) | null
  onError: ((error: VoiceError) => void) | null
}
