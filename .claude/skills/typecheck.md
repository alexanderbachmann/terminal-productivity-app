---
name: typecheck
description: Run TypeScript type checking across all three process targets
user_invocable: true
---

# TypeScript Check Skill

Run type checking for the entire project:

1. Run `npx electron-vite build --mode development 2>&1` or `npx tsc --noEmit -p tsconfig.node.json` and `npx tsc --noEmit -p tsconfig.web.json` to check all process targets.
2. Report any type errors grouped by file.
3. If errors exist, read the relevant files and suggest fixes.
