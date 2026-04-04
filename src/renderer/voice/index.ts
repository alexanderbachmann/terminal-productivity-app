export type { SpeechRecognitionProvider } from './SpeechRecognitionService'
export { DeepgramProvider } from './DeepgramProvider'
export { WebSpeechProvider } from './WebSpeechProvider'
export { useVoiceInput } from './useVoiceInput'
export { checkMicPermission } from './checkMicPermission'

import type { SpeechRecognitionProvider } from './SpeechRecognitionService'
import { DeepgramProvider } from './DeepgramProvider'

/**
 * Returns a SpeechRecognitionProvider or null if no API key is configured.
 * We intentionally avoid falling back to WebSpeechProvider because the Web
 * Speech API crashes the Electron renderer process (blank white screen).
 */
export function createProvider(): SpeechRecognitionProvider | null {
  const apiKey = localStorage.getItem('deepgram-api-key') || ''
  if (apiKey) {
    return new DeepgramProvider(apiKey)
  }
  return null
}
