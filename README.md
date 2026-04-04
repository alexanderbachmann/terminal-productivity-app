# Terminal Productivity App

> Orchestrate multiple Claude Code agents against a local project from a single desktop window.

An Electron + React desktop app that opens a grid of real PTY terminals, each auto-launching `claude` (Claude Code CLI) pointed at your chosen project folder. Supports multiple grid layouts, persistent workspace state, voice-to-terminal input, and full theme customization.

---

## Quick Start

```bash
npm install          # installs deps and rebuilds node-pty for Electron ABI
npm run dev          # hot-reload dev mode (Vite + Electron)
npm run build        # production build
npm run start        # run the built app
```

> **Note:** `postinstall` runs `@electron/rebuild` automatically — required to compile `node-pty` for the correct Electron ABI.

---

## Tech Stack

| Package | Version | Role |
|---------|---------|------|
| Electron | 28 | Desktop runtime, main + preload processes |
| React | 18 | Renderer UI |
| TypeScript | — | All three processes |
| electron-vite | — | Build tooling (Vite-based) |
| node-pty | — | Native PTY spawning (real shell processes) |
| xterm.js | 6 | Terminal rendering (WebGL addon, canvas fallback) |
| react-resizable-panels | — | Draggable panel layout |
| Deepgram | API | Cloud speech-to-text (optional, needs API key) |

---

## Project Structure

```
src/
├── main/                       # Electron main process (Node.js)
│   ├── index.ts                  Window creation, IPC handler registration
│   ├── terminalManager.ts        PTY lifecycle: create / write / resize / close
│   └── sessionStore.ts           Workspace persistence (~/.terminal-productivity-app/)
├── preload/
│   └── index.ts                  Context bridge — exposes window.electronAPI to renderer
├── renderer/                   # React UI (browser context)
│   ├── App.tsx                   Root component, AppPhase state machine
│   ├── ThemeContext.tsx           React context — active theme + setter
│   ├── themes.ts                 Theme definitions (ThemeDefinition interface)
│   ├── styles.css                Global styles, CSS variables
│   ├── main.tsx                  React entry point, wraps App in providers
│   ├── env.d.ts                  TypeScript declarations for window.electronAPI
│   ├── components/
│   │   ├── LayoutPicker.tsx       Grid layout selection UI + GRID_PRESETS
│   │   ├── TerminalGrid.tsx       Panel layout host (react-resizable-panels)
│   │   ├── TerminalPane.tsx       Single terminal: xterm.js instance + IPC wiring
│   │   ├── SettingsPopover.tsx    Voice settings panel (provider, API key)
│   │   └── VoiceTranscriptPreview.tsx  Live transcript overlay
│   └── voice/
│       ├── VoiceContext.tsx       Global voice state (provider, active session)
│       └── ...                   Provider implementations (web-speech, Deepgram)
└── shared/
    └── types.ts                  IpcChannels union, TerminalSession, ClaudeConfig, etc.
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start app in dev mode with hot reload |
| `npm run build` | Production build (main + preload + renderer) |
| `npm run start` | Launch the production build |
| `npm run postinstall` | Rebuild node-pty native bindings for Electron ABI |

---

## IPC Channels

All channels follow `namespace:action` naming. Types are defined in `src/shared/types.ts`.

| Channel | Direction | Payload | Description |
|---------|-----------|---------|-------------|
| `terminal:create` | renderer → main | `TerminalSession` | Spawn a new PTY process |
| `terminal:write` | renderer → main | `(sessionId, data)` | Send keystrokes to PTY |
| `terminal:resize` | renderer → main | `(sessionId, cols, rows)` | Resize PTY dimensions |
| `terminal:close` | renderer → main | `sessionId` | Kill PTY and clean up |
| `terminal:data` | main → renderer | `TerminalOutput` | Raw terminal output from PTY |
| `terminal:exit` | main → renderer | `{ sessionId, exitCode }` | PTY process exited |
| `workspace:save` | renderer → main | `WorkspaceLayout` | Persist layout to disk |
| `workspace:load` | renderer → main | `projectPath` | Load saved layout for a project |
| `workspace:pick-folder` | renderer → main | — | Open native folder picker dialog |
| `deepgram:test-key` | renderer → main | `apiKey` | Validate a Deepgram API key |

> Adding a channel requires changes in 4 files. Use the `/ipc-channel` agent.

---

## App Phases

`App.tsx` manages a linear state machine:

```
pick-project  →  pick-layout  →  running
     ↑                              |
     └──────────── reset ───────────┘
```

| Phase | What the user sees | Transition |
|-------|-------------------|------------|
| `pick-project` | "Open Project Folder" button | Folder picked → `pick-layout` (or `running` if saved workspace exists) |
| `pick-layout` | Grid preset selector | Layout chosen → `running` |
| `running` | Terminal grid, Save/Reset buttons | Reset → `pick-layout` |

On `pick-layout` → `running`: `TerminalSession` objects are created for each grid slot, then each `TerminalPane` calls `terminal:create` to spawn a PTY running `claude`.

---

## Themes

Themes are defined in `src/renderer/themes.ts` as `ThemeDefinition` objects:

```ts
interface ThemeDefinition {
  id: string
  name: string
  // 18 ANSI colors for xterm.js
  terminal: ITheme
  // UI chrome
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string
  accent: string
  textPrimary: string
  textSecondary: string
  border: string
}
```

- Active theme is stored in `ThemeContext` and persisted to `localStorage`.
- CSS variables (`--bg-primary`, `--accent`, etc.) are set dynamically on `<html>` from the active theme.
- xterm.js instances receive `terminal` colors directly via `.options.theme`.
- To add a theme: use the `/theme-creator` agent or add a `ThemeDefinition` to `themes.ts` and include it in the `THEMES` array.

---

## Voice Input

Voice-to-terminal lets you dictate commands directly into the focused terminal.

**Shortcuts:**

| Shortcut | Mode | Behavior |
|----------|------|----------|
| `Cmd+Shift+M` (`Ctrl+Shift+M` on Linux/Windows) | Toggle | Press once to start listening, press again to stop |
| `Cmd+Shift+Space` | Push-to-talk | Hold to record, release to stop |

Push-to-talk ignores key-repeat events so holding the keys down does not restart the session. Recording stops on `Space` keyup even if the modifier keys are already released.

**Flow:**
1. Keydown captured in `App.tsx` (capture phase, before xterm consumes it).
2. `VoiceContext.toggleListening(sessionId, onFinal)` activates the selected provider.
3. Final transcripts are sent via `window.electronAPI.writeTerminal(sessionId, transcript + '\n')`.

**Providers:**

| Provider | Key | Notes |
|----------|-----|-------|
| `web-speech` | None required | Uses browser `webkitSpeechRecognition`; macOS only with Electron |
| `deepgram` | Deepgram API key in Settings | Cloud STT via WebSocket; more accurate |

**Configuration:** Open Settings (gear icon) → set provider and Deepgram API key. Key is stored in `localStorage`. The main process validates keys via `deepgram:test-key` (avoids CORS — Deepgram headers are injected by the main process).

---

## Workspace Persistence

Workspaces are saved per-project to:

```
~/.terminal-productivity-app/<hash-of-project-path>.json
```

**Saved data (`WorkspaceLayout`):**

```ts
interface WorkspaceLayout {
  projectPath: string
  terminals: TerminalSession[]   // session names, cwd, claudeConfig per pane
  gridLayoutId: string           // which grid preset was active
  updatedAt: string              // ISO timestamp
}
```

- Load is automatic when you open a project that has a saved workspace.
- Save is manual via the "Save Layout" button (calls `workspace:save`).
- No auto-save on close — intentional to avoid overwriting with a partially-closed state.

---

## Agents & Skills

See [`AGENTS.md`](./AGENTS.md) for full details on each agent.

| Slash command | Purpose |
|---------------|---------|
| `/ipc-channel` | Add new IPC channels (4-file sync) |
| `/theme-creator` | Generate new color themes |
| `/component` | Scaffold React components |
| `/build-doctor` | Diagnose build failures and native module errors |
| `/test-setup` | Bootstrap Vitest tests or write new ones |
| `/review` | Code review with Electron security focus |
| `/perf-audit` | Performance and memory leak audits |
| `/debug-voice` | Debug voice/STT issues end-to-end |
| `/upgrade` | Handle Electron/React/xterm.js upgrades |
| `/docs` | Update this README from current code |

---

## Architecture Notes

### Three-process model

```
Main process (Node.js)
  ├── BrowserWindow
  ├── TerminalManager  ──→  node-pty PTY processes
  ├── SessionStore     ──→  ~/.terminal-productivity-app/
  └── IPC handlers

Preload (context bridge)
  └── window.electronAPI  ──→  safe typed surface exposed to renderer

Renderer (React / browser)
  ├── App (phase machine)
  ├── TerminalGrid / TerminalPane  ──→  xterm.js
  └── VoiceContext  ──→  Web Speech / Deepgram WebSocket
```

### Key design decisions

- **`sandbox: false`** — Required so the preload script can access Node.js APIs via the context bridge. `contextIsolation` is still on by default, keeping the renderer isolated.
- **node-pty is externalized** — Not bundled by Vite; loaded as a native module at runtime. Requires `@electron/rebuild` to match Electron's Node ABI.
- **PTY data path** — `PTY → main process onData → webContents.send('terminal:data') → renderer → xterm.js.write()`. Data is raw bytes; never interpreted as HTML.
- **Resize debouncing** — `TerminalPane` uses `requestAnimationFrame` to batch resize events before sending `terminal:resize`.
- **ClaudeConfig** — Controls CLI flags passed to `claude`. Shell: always `zsh` on macOS.
- **CORS bypass** — `session.defaultSession.webRequest.onHeadersReceived` injects CORS headers for `api.deepgram.com` so the renderer can open a WebSocket directly.
