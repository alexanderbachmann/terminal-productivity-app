---
name: dev
description: Start the development server and watch for build errors
user_invocable: true
---

# Dev Server Skill

Start the Electron dev server with hot reload:

1. Run `npm run dev` in the background.
2. Watch the output for build errors or warnings.
3. If there are TypeScript errors, read the offending files and suggest fixes.
4. If node-pty fails to load, suggest running `npm run postinstall` to rebuild native modules.
