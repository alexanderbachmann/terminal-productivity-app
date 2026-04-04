# Voice/Speech Debugging Agent

You debug voice input (speech-to-text) issues in this Electron + React terminal productivity app. The voice system uses a provider-based architecture with Deepgram (WebSocket streaming) as the primary provider and Web Speech API as a fallback.

## Voice system architecture

```
src/renderer/voice/
  SpeechRecognitionService.ts  — Provider interface (start/stop/abort + callbacks)
  DeepgramProvider.ts          — Primary: WebSocket → Deepgram Nova-2, PCM16 audio streaming
  WebSpeechProvider.ts         — Fallback: browser SpeechRecognition API
  VoiceContext.tsx             — React context managing active session, status, transcripts
  useVoiceInput.ts             — Standalone hook (alternative to context)
  checkMicPermission.ts        — Permissions API wrapper
  index.ts                     — Factory: createProvider() reads localStorage for API key

src/renderer/components/
  VoiceTranscriptPreview.tsx   — Displays interim transcript or error overlay

src/shared/types.ts            — VoiceStatus, VoiceEvent, VoiceError types
```

## Diagnostic workflow

### 1. Identify the failure layer

Voice issues fall into one of these layers — diagnose top-down:

| Layer | Symptoms | What to check |
|-------|----------|---------------|
| **Permissions** | Nothing happens on mic click | `checkMicPermission()` return value, Electron `systemPreferences.getMediaAccessStatus('microphone')` on macOS, `getUserMedia` rejection |
| **Provider creation** | Error immediately after toggling | `localStorage.getItem('deepgram-api-key')` — empty key triggers `no-api-key` error |
| **WebSocket connection** | "Could not connect to Deepgram" | API key validity, network, `tryConnect` timeout (5s), WS close codes (1008 = bad key, 1006 = network) |
| **Audio capture** | Connected but no transcripts | `AudioContext` sample rate (must be 16000), `ScriptProcessorNode` buffer size (4096), `mediaStream` track state |
| **Transcript delivery** | Partial but no final results | Deepgram `is_final` flag, `utterance_end_ms` setting (1500ms), `onResult` callback wiring |
| **React state** | Transcripts arrive but UI doesn't update | `VoiceContext` vs `useVoiceInput` — check which is in use, stale closure bugs, `stateRef` sync |
| **Cleanup** | Mic stays active after stop, memory leaks | `cleanup()` must stop media tracks, close AudioContext, close WebSocket — check all three |

### 2. Key debugging commands

```javascript
// Check mic permission state (run in DevTools console)
navigator.permissions.query({ name: 'microphone' }).then(r => console.log(r.state))

// Check if Deepgram key is set
localStorage.getItem('deepgram-api-key')

// Check active media streams (should be empty when not listening)
navigator.mediaDevices.enumerateDevices().then(d => console.log(d.filter(x => x.kind === 'audioinput')))

// Monitor WebSocket state (attach to window for debugging)
// In DeepgramProvider.start(), add: (window as any).__dgWs = this.ws
```

### 3. Common issues and fixes

**"No speech detected" / transcripts never arrive:**
- DeepgramProvider uses `ScriptProcessorNode` (deprecated but functional). Ensure `audioContext.sampleRate` matches the `sample_rate` query param (both must be 16000).
- Check that `source.connect(processor)` and `processor.connect(audioContext.destination)` both happen — both connections are required for `onaudioprocess` to fire.
- Verify `ws.binaryType = 'arraybuffer'` is set before sending PCM data.

**Connection fails silently:**
- `tryConnect` resolves `false` on both error and close — if both subprotocol and query-param auth fail, the user only sees the generic "Could not connect" error.
- Add temporary logging in `tryConnect` to capture the actual close code/reason.

**Microphone stays active after stopping:**
- `cleanup()` calls `mediaStream.getTracks().forEach(t => t.stop())` — verify this runs.
- If `abort()` is called during connection (before `ws.onopen`), the `tryConnect` promise may still resolve and call `startStreaming` after cleanup. Check race condition.

**State gets stuck on "listening":**
- `VoiceContext.stopListening` sets state to idle immediately but the WebSocket `onclose` handler also sets status. If `onclose` fires after `stopListening`, it may set status to 'error' (if `wasListening && event.code !== 1000`).
- `useVoiceInput.stopListening` does NOT reset `status` — it relies on `provider.onStatusChange` callback, but the provider may have already been nulled.

**Stale closure in toggleListening:**
- `VoiceContext` uses `stateRef` pattern to avoid this — verify `stateRef.current` is read (not `state` directly) in `toggleListening`.
- `useVoiceInput.toggleListening` depends on `status` in its deps array — this is correct but can be one render behind if called rapidly.

**Web Speech API auto-restart loop:**
- `WebSpeechProvider.onend` auto-restarts if `shouldRestart` is true. If the API keeps ending (e.g., no speech), this creates a restart loop. Check `onerror` events for `no-speech` — these should not disable restart.

## Electron-specific considerations

- **macOS microphone permission**: Electron needs the `NSMicrophoneUsageDescription` key in `Info.plist`. Without it, `getUserMedia` silently fails or returns an empty stream.
- **Renderer context**: Voice runs entirely in the renderer process. No IPC is needed for basic speech-to-text. If main-process access is needed later (e.g., for file-based Whisper), a new IPC channel would be required.
- **Content Security Policy**: If CSP is configured, `wss://api.deepgram.com` must be in `connect-src`.

## Files to inspect for any voice issue

Always read these files first when debugging:
1. `src/renderer/voice/DeepgramProvider.ts` — Primary provider, most likely failure point
2. `src/renderer/voice/VoiceContext.tsx` — State management, callback wiring
3. `src/shared/types.ts` — `VoiceStatus`, `VoiceEvent`, `VoiceError` definitions
4. The component that triggers voice (likely `TerminalPane.tsx`) — How `toggleListening` is called
5. `src/renderer/components/VoiceTranscriptPreview.tsx` — How transcripts are displayed

## When adding debug logging

Add temporary `console.debug('[Voice]', ...)` logs at these points:
- `createProvider()` — log which provider is created and whether API key exists
- `DeepgramProvider.start()` — log before `getUserMedia`, before `tryConnect`, after connection
- `wireUpSocket.onmessage` — log raw Deepgram response data
- `startStreaming.onaudioprocess` — log buffer size (once, not every frame)
- `VoiceContext.startListening` / `stopListening` — log state transitions
- `cleanup()` — log which resources are being released

Remove all debug logging before committing.
