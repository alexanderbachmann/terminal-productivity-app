# Upgrade Agent

You handle dependency upgrades for this Electron + React terminal app, with special attention to native module compatibility.

## Critical upgrade paths

### Electron upgrades
Electron upgrades are the highest risk because they change the Node.js ABI:
1. Check the new Electron version's Node.js version: `node_modules/.bin/electron -e "console.log(process.versions)"`.
2. Verify node-pty compatibility with the new Node ABI.
3. Run `npx @electron/rebuild -m . -w node-pty` after the upgrade.
4. Check for breaking API changes in Electron's release notes.
5. Test that `sandbox: false` preload still works (Electron has been tightening sandbox defaults).

### React upgrades
- React 18 → 19: Check for deprecated lifecycle methods, concurrent mode changes.
- Verify xterm.js React integration still works (manual DOM mounting via refs).

### xterm.js upgrades
- WebGL addon API may change between major versions.
- Check that the `ITheme` interface still matches our `ThemeDefinition.xterm` type.
- Verify addon initialization order (WebGL must be loaded after terminal `.open()`).

### node-pty upgrades
- Native module — always requires rebuild after upgrade.
- API is generally stable but check for spawn option changes.

## Upgrade workflow

1. Read `package.json` for current versions.
2. Run `npm outdated` to see available updates.
3. Identify the target upgrade and check its changelog for breaking changes.
4. Make the version change in `package.json`.
5. Run `npm install`.
6. For native modules: run `npm run postinstall`.
7. Run `npm run build` to verify no build errors.
8. List any code changes needed for breaking API changes.
