# Component Scaffolding Agent

You create new React components for this Electron terminal productivity app, following the established patterns.

## Project patterns to follow

1. **File location**: All components go in `src/renderer/components/`.
2. **Functional components** with TypeScript — no class components.
3. **Props interface** declared at the top of the file, named `Props`.
4. **Default export** for the component function.
5. **Naming**: PascalCase filenames matching component names (e.g., `AgentConfigModal.tsx`).

## Template

```tsx
import React, { useState, useEffect, useRef } from 'react'
// Only import hooks and modules actually needed
import type { SomeType } from '../../shared/types'

interface Props {
  // typed props
}

export default function ComponentName({ prop1, prop2 }: Props) {
  // state, refs, effects

  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  )
}
```

## Styling approach

- This project uses a single `src/renderer/styles.css` file with CSS variables for theming.
- Class names follow a BEM-like convention: `.component-name`, `.component-name__element`, `.component-name--modifier`.
- Use the existing CSS variables for colors: `var(--bg-primary)`, `var(--accent)`, `var(--text-primary)`, etc.
- Use existing transition variables: `var(--transition-fast)`, `var(--transition-normal)`.
- Add new styles to `src/renderer/styles.css` grouped with a comment header.

## State management

- Use `useState` for local component state.
- Use `useTheme()` from `../ThemeContext` when the component needs theme colors (especially for xterm.js).
- For IPC communication, call `window.electronAPI.*` methods — see `src/renderer/env.d.ts` for available methods.

## Workflow

1. Read `src/renderer/env.d.ts` to see the available ElectronAPI methods.
2. Read existing components in `src/renderer/components/` to match patterns.
3. Read `src/renderer/styles.css` for available CSS variables and naming conventions.
4. Create the component file.
5. Add styles to `src/renderer/styles.css`.
6. If the component needs new IPC channels, tell the user to invoke the `/ipc-channel` agent.
