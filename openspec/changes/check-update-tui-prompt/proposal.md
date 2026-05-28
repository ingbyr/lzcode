## Why

The current update system uses upstream (anomalyco/opencode) version APIs to detect updates and can auto-upgrade via npm/brew/curl etc. In the lzcode fork, auto-upgrade is already blocked (upgrade command handler is commented out), but the version-check logic still queries upstream sources. We need a dedicated check-only update flow that fetches the latest lzcode version from our own release endpoint, compares it with the current version, and notifies the user via a TUI dialog — without ever attempting to perform an actual upgrade.

## What Changes

- Add a new `checkUpdate()` function in the Installation module that fetches the latest version from `https://gh-proxy.org/https://github.com/ingbyr/lzcode/releases/latest/download/latest.json` (JSON field: `version`) and compares it with the current `InstallationVersion` using the existing `semver.gt()` comparison
- Reuse the existing `Event.UpdateAvailable` bus event to emit a notification when a newer version is found
- Replace the `upgrade()` function in `src/cli/upgrade.ts` to call the new `checkUpdate()` instead of performing auto-upgrade
- The existing `upgrade()` implementation in `src/installation/index.ts` and its Interface/Service remain untouched (preserved for future use)
- The TUI already handles `installation.update-available` events with a `DialogAlert.show()` popup showing "A new version vX.Y.Z is available. Please update manually." — this continues to work unchanged

## Capabilities

### New Capabilities
- `lz-update-check`: Fetch lzcode-specific latest version from our own release endpoint and emit an update-available notification if a newer version exists

### Modified Capabilities
- None (existing Installation module Interface and upgrade path are preserved unchanged; only `src/cli/upgrade.ts` changes its call site)

## Impact

- **`packages/opencode/src/installation/index.ts`**: Add `checkUpdate()` convenience function and `LzLatestVersion` response schema
- **`packages/opencode/src/cli/upgrade.ts`**: Replace the existing upgrade flow with a call to `Installation.checkUpdate()`, removing all auto-upgrade logic
- **`packages/opencode/src/cli/cmd/tui/worker.ts`**: No changes needed — already calls `upgrade()` which will now only check
- **TUI (`app.tsx`)**: No changes needed — already shows `DialogAlert` on `installation.update-available` events
- **HTTP API (`global.ts`)**: The `/global/upgrade` endpoint still exists but is effectively dead code (TUI never invokes it for auto-upgrade)