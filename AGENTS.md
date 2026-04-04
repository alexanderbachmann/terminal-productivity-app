# Claude Code Agents

This project includes custom Claude Code subagents located in `.claude/agents/`. Each agent is a specialist for a specific type of task in this Electron + React terminal productivity app.

## Available Agents

### `/ipc-channel` — IPC Channel Creator
**When to use:** Adding new communication channels between the main process and renderer.

Adding an IPC channel in this app requires consistent changes across 4 files:
1. `src/shared/types.ts` — channel name in `IpcChannels` union + data interfaces
2. `src/main/index.ts` — `ipcMain.handle()` or `ipcMain.on()` handler
3. `src/preload/index.ts` — `contextBridge` method exposure
4. `src/renderer/env.d.ts` — TypeScript declaration for `window.electronAPI`

This agent ensures all 4 files stay in sync and follows the `namespace:action` naming convention.

**Example:** `/ipc-channel add a channel for terminal:rename that lets the renderer rename a terminal session`

---

### `/theme-creator` — Theme Generator
**When to use:** Adding new color themes to the app.

Creates themes conforming to the `ThemeDefinition` interface in `src/renderer/themes.ts`, which includes:
- 18 ANSI terminal colors for xterm.js
- 7 UI chrome colors (backgrounds, accent, text, border)
- WCAG AA contrast ratio validation

**Example:** `/theme-creator add a Monokai theme`

---

### `/component` — React Component Scaffolder
**When to use:** Creating new React components for the renderer.

Generates components following project conventions:
- Functional components with TypeScript
- `Props` interface at top, default export
- CSS variables from the design system (`var(--bg-primary)`, etc.)
- BEM-like class naming
- Styles added to `src/renderer/styles.css`

**Example:** `/component create a StatusBar component that shows the number of running terminals`

---

### `/build-doctor` — Build Issue Diagnostician
**When to use:** Build failures, native module errors, or TypeScript issues.

Specializes in:
- **node-pty rebuild failures** — ABI mismatches, missing build tools
- **electron-vite build errors** — config issues, incorrect tsconfig targets
- **TypeScript errors** — mismatched types across process boundaries
- **Electron-specific gotchas** — sandbox settings, preload context limitations

**Example:** `/build-doctor npm run build is failing with a node-pty error`

---

### `/test-setup` — Testing Infrastructure & Test Writer
**When to use:** Setting up tests from scratch or writing new tests.

Recommended stack: Vitest + @testing-library/react + jsdom

Test priority order:
1. `SessionStore` (pure file I/O)
2. `TerminalManager` (mock node-pty)
3. Theme utilities (`getThemeById`)
4. React components (LayoutPicker, App phase transitions)

**Example:** `/test-setup bootstrap the testing infrastructure with Vitest`

---

### `/review` — Code Reviewer
**When to use:** Before merging changes or after completing a feature.

Reviews against:
- **Electron security** — IPC input validation, no nodeIntegration leaks, no command injection via PTY
- **React patterns** — effect cleanup, stale closures, unnecessary re-renders
- **TypeScript** — type consistency across process boundaries
- **Terminal/PTY** — process cleanup, resize debouncing, listener removal

**Example:** `/review check the changes I just made to terminal spawning`

---

### `/perf-audit` — Performance Auditor
**When to use:** Investigating sluggish rendering, memory leaks, or high CPU from terminal sessions.

Focuses on:
- xterm.js instance lifecycle and `.dispose()` cleanup
- IPC throughput for high-frequency `terminal:data` events
- React re-render cascades from theme/layout changes
- PTY process cleanup in `TerminalManager`
- Event listener leaks (IPC `on` without removal)

**Example:** `/perf-audit check if terminal panes are leaking memory when closed`

---

### `/debug-voice` — Voice/Speech Debugger
**When to use:** Debugging speech-to-text issues — microphone permissions, Deepgram WebSocket connection, audio streaming, transcript delivery, or React state/UI problems.

Diagnostic layers (top-down):
1. **Permissions** — macOS mic access, `getUserMedia` rejection
2. **Provider creation** — missing Deepgram API key in localStorage
3. **WebSocket connection** — auth failures (code 1008), network drops (1006), timeout
4. **Audio capture** — `AudioContext` sample rate, `ScriptProcessorNode` wiring
5. **Transcript delivery** — Deepgram `is_final` flag, `onResult` callback chain
6. **React state** — `VoiceContext` vs `useVoiceInput`, stale closures, UI not updating
7. **Cleanup** — mic stays active, WebSocket not closed, memory leaks

**Example:** `/debug-voice microphone appears active but no transcripts are showing up`

---

### `/docs` — Documentation Writer
**When to use:** After adding features, new IPC channels, themes, or components — keeps `README.md` accurate and up to date.

Reads the actual source code before writing anything. Covers:
- IPC channel table (from `src/shared/types.ts`)
- App phase state machine
- Voice input flow and providers
- Workspace persistence format
- Themes structure
- Architecture notes

**Example:** `/docs update the README after the new voice provider I added`

---

### `/upgrade` — Dependency Upgrade Specialist
**When to use:** Upgrading Electron, React, xterm.js, node-pty, or other key dependencies.

Handles the critical compatibility chain:
- Electron version → Node ABI → node-pty rebuild
- xterm.js `ITheme` interface → `ThemeDefinition` type sync
- React version → component lifecycle compatibility

**Example:** `/upgrade upgrade Electron to the latest version`

---

## Quick Reference

| Agent | Invoke | Best for |
|-------|--------|----------|
| ipc-channel | `/ipc-channel` | New IPC communication channels |
| theme-creator | `/theme-creator` | Adding color themes |
| component | `/component` | New React components |
| build-doctor | `/build-doctor` | Fixing build failures |
| test-setup | `/test-setup` | Tests and test infrastructure |
| review | `/review` | Code review before merge |
| perf-audit | `/perf-audit` | Performance and memory leak audits |
| debug-voice | `/debug-voice` | Voice/speech-to-text debugging |
| upgrade | `/upgrade` | Dependency upgrades |
| docs | `/docs` | Update README from current code |
