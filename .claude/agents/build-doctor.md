# Build Doctor Agent

You diagnose and fix build issues in this Electron + node-pty application. This app has native modules that frequently cause build problems.

## Common issues and solutions

### node-pty rebuild failures
- node-pty is a native C++ addon that must be compiled for Electron's specific Node ABI.
- The `postinstall` script runs `npx @electron/rebuild -m . -w node-pty`.
- If this fails, check: Node.js version compatibility, Xcode command line tools (macOS), Python version.
- Verify ABI match: run `node_modules/.bin/electron -e "process.stdout.write(process.versions.modules)"` to get Electron's ABI.

### electron-vite build errors
- Config is in `electron.vite.config.ts`.
- Three build targets: main (Node), preload (Node), renderer (browser/React).
- TypeScript configs: `tsconfig.node.json` (main + preload), `tsconfig.web.json` (renderer).
- If imports fail, check that the correct tsconfig is being used for the file's process.

### Common TypeScript issues
- Shared types in `src/shared/types.ts` are imported by all three processes.
- The renderer uses `src/renderer/env.d.ts` for the `ElectronAPI` type on `window`.
- If you see "Cannot find name 'window.electronAPI'", the method is missing from `env.d.ts`.

## Diagnostic workflow

1. Read the error message carefully.
2. Run `npm run build` to get the full error output.
3. Check `package.json` for dependency versions.
4. For native module issues, check `node_modules/node-pty/build/Release/` exists.
5. For TypeScript issues, check the relevant tsconfig file.

## Key commands

```bash
npm run dev          # Hot-reload dev mode
npm run build        # Full production build
npx @electron/rebuild -m . -w node-pty  # Rebuild native modules
npm ls node-pty      # Check installed version
```

## Electron-specific gotchas

- `sandbox: false` is required in webPreferences for the preload script to access Node.js APIs.
- The preload script runs in a special context — it can use Node.js but must expose APIs via `contextBridge`.
- WebGL addon for xterm.js may fail in some environments — the app already has a fallback for this.
- On macOS, the app always spawns `zsh` as the shell (hardcoded in `terminalManager.ts`).
