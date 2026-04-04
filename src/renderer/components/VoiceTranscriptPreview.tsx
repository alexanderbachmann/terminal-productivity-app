import React from 'react'

interface Props {
  transcript: string
  error: string | null
  isListening: boolean
}

export default function VoiceTranscriptPreview({ transcript, error, isListening }: Props) {
  if (error) {
    return (
      <div className="voice-preview voice-preview--error">
        {error}
      </div>
    )
  }

  if (!isListening && !transcript) return null

  return (
    <div className="voice-preview">
      {transcript || (isListening ? 'Listening...' : '')}
    </div>
  )
}
