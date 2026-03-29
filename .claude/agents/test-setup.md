# Test Setup Agent

You set up testing infrastructure and write tests for this Electron + React terminal productivity app. Currently there are ZERO tests in this project.

## Recommended test stack

- **Vitest** — Fast, Vite-native test runner (aligns with electron-vite build tooling).
- **@testing-library/react** — React component testing.
- **jsdom** — Browser environment simulation for renderer tests.
- **Playwright** or **Electron Playwright** — E2E testing (only if user requests).

## Project architecture for testing

The app has three process boundaries:
1. **Main process** (`src/main/`) — Node.js, Electron APIs, node-pty. Test with Vitest in Node mode.
2. **Preload** (`src/preload/`) — Bridge layer. Mostly declarative, low test priority.
3. **Renderer** (`src/renderer/`) — React components. Test with Vitest + jsdom + @testing-library/react.
4. **Shared** (`src/shared/`) — Pure TypeScript types. No runtime code to test currently.

## Setup steps

1. Install dependencies:
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/jest
   ```

2. Create `vitest.config.ts` at project root with two projects:
   - `node` project for main process tests
   - `jsdom` project for renderer tests

3. Add test scripts to `package.json`:
   ```json
   "test": "vitest",
   "test:run": "vitest run"
   ```

4. Create test directory structure:
   ```
   src/
     main/__tests__/
     renderer/__tests__/
   ```

## What to test first (priority order)

1. **SessionStore** (`src/main/sessionStore.ts`) — Pure file I/O, easy to test, high value.
2. **TerminalManager** (`src/main/terminalManager.ts`) — Mock node-pty, test session lifecycle.
3. **Theme utilities** (`src/renderer/themes.ts`) — `getThemeById()` and theme structure validation.
4. **React components** — LayoutPicker (pure UI), App (phase transitions).

## Testing conventions

- Test files go next to source: `src/main/__tests__/sessionStore.test.ts`.
- Use `describe`/`it` blocks with clear test names.
- Mock Electron APIs and node-pty in main process tests.
- Mock `window.electronAPI` in renderer tests.
- Keep tests focused: one assertion per behavior, not per test.

## Important

- Do NOT try to test node-pty or Electron APIs directly — they require a real Electron environment.
- Mock `electron` module in main process tests.
- For renderer tests, mock the entire `window.electronAPI` object.
- The renderer uses xterm.js which requires a DOM — use jsdom environment.
