---
name: quick-fix
description: Run a build check, find errors, and fix them automatically
user_invocable: true
---

# Quick Fix Skill

Diagnose and fix build/type errors:

1. Run `npm run build` to get current error output.
2. Parse each error — identify the file, line, and issue.
3. Read each failing file.
4. Apply the minimal fix for each error.
5. Run `npm run build` again to confirm all errors are resolved.
6. Report what was fixed.
