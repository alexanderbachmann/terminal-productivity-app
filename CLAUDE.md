# Terminal Productivity App

Desktop Electron + React app for orchestrating multiple Claude-backed terminal sessions against a local project.

## Tech Stack

- **Electron 28** — Desktop runtime (three-process architecture: main, preload, renderer)
- **React 18** + TypeScript — Renderer UI
- **electron-vite** — Build tooling (Vite-based, config in `electron.vite.config.ts`)
- **node-pty** — Native PTY spawning (requires `@electron/rebuild` postinstall)
- **xterm.js 6** — Terminal rendering with WebGL addon (canvas fallback)
- **react-resizable-panels** — Draggable panel layout

## Project Structure

```
src/
  main/           # Electron main process (Node.js)
    index.ts        — Window creation, IPC handler registration
    terminalManager.ts — PTY lifecycle (create/write/resize/close)
    sessionStore.ts — Workspace persistence (~/.terminal-productivity-app/)
  preload/        # Context bridge (exposes electronAPI to renderer)
    index.ts
  renderer/       # React UI (browser context)
    App.tsx         — Root component, phase management
    ThemeContext.tsx — Theme provider
    themes.ts       — Theme definitions (ThemeDefinition interface)
    styles.css      — Global styles with CSS variables
    components/     — LayoutPicker, TerminalGrid, TerminalPane, AgentConfigModal
    env.d.ts        — TypeScript declarations for window.electronAPI
  shared/         # Cross-process types
    types.ts        — IpcChannels, TerminalSession, ClaudeConfig, etc.
```

## Commands

```bash
npm run dev       # Hot-reload dev mode
npm run build     # Production build
npm run start     # Run built app
npm run postinstall  # Rebuild node-pty for Electron ABI
```

## Architecture Notes

- **IPC channels** follow `namespace:action` naming (e.g., `terminal:create`, `workspace:save`). Adding a channel requires changes in 4 files — use `/ipc-channel` agent.
- **sandbox: false** is intentional in webPreferences — required for preload Node.js access.
- **node-pty** is externalized in the Vite config (not bundled).
- **Themes** define both xterm.js ANSI colors and UI chrome colors. CSS variables are set dynamically from the active theme.
- **Shell**: macOS always spawns `zsh`.

## Coding Conventions

- Functional React components with TypeScript, `Props` interface at top, default export
- BEM-like CSS class naming (`.component-name__element--modifier`)
- CSS variables for all colors: `var(--bg-primary)`, `var(--accent)`, `var(--text-primary)`, etc.
- Error handling in IPC: wrap in try-catch, return `{ success: boolean, error?: string }`
- Shared types go in `src/shared/types.ts`

## Agents

See `AGENTS.md` for the full list. Quick reference:

| Agent | Purpose |
|-------|---------|
| `/ipc-channel` | Add new IPC channels (4-file sync) |
| `/theme-creator` | Create new color themes |
| `/component` | Scaffold React components |
| `/build-doctor` | Diagnose build failures |
| `/test-setup` | Set up tests and write tests |
| `/review` | Code review with security focus |
| `/perf-audit` | Performance and memory leak audits |
| `/debug-voice` | Debug voice/speech-to-text issues |
| `/upgrade` | Dependency upgrades |
| `/docs` | Update README from current code |

## Skills

| Skill | Purpose |
|-------|---------|
| `/dev` | Start dev server and watch for errors |
| `/quick-fix` | Build, find errors, fix them automatically |
| `/typecheck` | Run TypeScript checks across all targets |
| `/add-feature` | Plan and implement a feature end-to-end |
