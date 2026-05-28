## 1. Add checkUpdate to Installation module

- [x] 1.1 Add `LzLatestVersion` response schema (`Schema.Struct({ version: Schema.String })`) in `packages/opencode/src/installation/index.ts`
- [x] 1.2 Add `checkUpdate` method to the `Interface` type definition: `readonly checkUpdate: () => Effect.Effect<void>`
- [x] 1.3 Implement `checkUpdate` inside the `layer` Effect.gen block — fetch `https://gh-proxy.org/https://github.com/ingbyr/lzcode/releases/latest/download/latest.json` via `httpOk`, decode with `LzLatestVersion` schema, compare with `InstallationVersion` using `semver.gt`, emit `Event.UpdateAvailable` via `GlobalBus` if newer (or silently return otherwise, with `Effect.catch(() => Effect.void)` for error tolerance)
- [x] 1.4 Export `checkUpdate` convenience function at module level using `makeRuntime` pattern: `export const checkUpdate = () => runPromise((s) => s.checkUpdate())`

## 2. Replace CLI upgrade flow with check-only

- [x] 2.1 Rewrite `packages/opencode/src/cli/upgrade.ts` — keep the `config.autoupdate === false || Flag.OPENCODE_DISABLE_AUTOUPDATE` early-return guard, then call `Installation.checkUpdate()` instead of the old method→latest→upgrade flow, remove all references to `Installation.method()`, `Installation.latest()`, `Installation.upgrade()`, and `GlobalBus.emit("event", ...)` (the event is now emitted inside `checkUpdate`)

## 3. Verify existing TUI integration still works

- [x] 3.1 Confirm that `packages/opencode/src/cli/cmd/tui/app.tsx` lines 886-899 (the `installation.update-available` event handler with `DialogAlert.show`) remain untouched and function correctly with the new event source
- [x] 3.2 Confirm that `packages/opencode/src/cli/cmd/tui/worker.ts` line 80 (`await upgrade().catch(() => {})`) continues to work — it now calls the rewritten `upgrade()` which delegates to `checkUpdate()`