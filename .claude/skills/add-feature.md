---
name: add-feature
description: Plan and implement a new feature across the Electron architecture
user_invocable: true
---

# Add Feature Skill

Plan and implement a feature end-to-end:

1. Understand the request — ask clarifying questions if needed.
2. Identify which layers are affected (main, preload, renderer, shared types).
3. If new IPC channels are needed, follow the 4-file sync pattern from the `/ipc-channel` agent.
4. If new components are needed, follow conventions from the `/component` agent.
5. Implement changes in dependency order: types → main → preload → renderer.
6. Run `npm run build` to verify no errors.
7. Summarize all changes made.
