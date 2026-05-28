## Context

The opencode/lzcode installation module (`src/installation/index.ts`) currently implements a full update lifecycle: detect install method → query latest version from upstream APIs (GitHub Releases, npm registry, Homebrew, etc.) → auto-upgrade via the detected package manager. In the lzcode fork, the `upgrade` CLI command has already been disabled (commented out in `src/cli/cmd/upgrade.ts`), but the underlying `upgrade()` function in the Installation service and the auto-upgrade path in `src/cli/upgrade.ts` remain active — meaning the TUI worker still attempts auto-upgrade on startup.

The current TUI already handles the `installation.update-available` bus event by showing a `DialogAlert` popup (app.tsx line 886-899) with the message "A new version vX.Y.Z is available. Please update manually." It also tracks a `skipped_version` in key-value storage to avoid re-prompting for the same version.

We need to redirect the version check to use our own release endpoint and eliminate the auto-upgrade execution path, while preserving all existing code structure.

## Goals / Non-Goals

**Goals:**
- Fetch lzcode latest version from `https://gh-proxy.org/https://github.com/ingbyr/lzcode/releases/latest/download/latest.json`
- Compare fetched version with current `InstallationVersion` using `semver.gt()`
- Emit `Event.UpdateAvailable` when a newer version is found, triggering the existing TUI dialog
- Replace `src/cli/upgrade.ts` auto-upgrade logic with check-only flow
- Preserve existing `upgrade()`, `latest()`, `method()` implementations untouched

**Non-Goals:**
- Modifying the TUI dialog UI or behavior
- Changing the HTTP API `/global/upgrade` endpoint
- Adding new configuration options for the update check URL
- Implementing skip/remind-later logic beyond what already exists
- Supporting offline or cached version check results

## Decisions

### 1. Add `checkUpdate()` as a top-level exported convenience function

**Decision**: Add a `checkUpdate()` function alongside the existing `latest()`, `method()`, `upgrade()` convenience exports.

**Rationale**: The new check is lzcode-specific and uses a different endpoint than the existing `latest()` method (which queries upstream sources per install method). Adding a separate function keeps the two concerns cleanly separated without modifying the `Interface` or `Service` that existing code depends on.

**Alternative**: Override `latest()` to call our endpoint. Rejected because it would change the behavior of the existing `info()` method and other consumers that rely on upstream version data.

### 2. Use the existing `makeRuntime` pattern for the convenience function

**Decision**: `checkUpdate()` will use `Effect.gen` directly with the Service, fetching via `HttpClient.HttpClient` that's already wired in the layer.

**Rationale**: Follows the same pattern as `latest()` and `method()` — keeps consistency with the codebase. The `httpOk` client is already available through the layer.

### 3. Add `checkUpdate` to the `Interface` rather than using a standalone runtime

**Decision**: Add `checkUpdate()` as a method on the Installation `Interface` and implement it inside the `layer`. Export a convenience wrapper at module level.

**Rationale**: This gives the implementation access to `httpOk` (already wired with retry logic) and keeps all installation-related logic in one place. The method can be tested via the Service like any other Interface method.

### 4. Replace `src/cli/upgrade.ts` body entirely

**Decision**: Rewrite the `upgrade()` function in `src/cli/upgrade.ts` to call `Installation.checkUpdate()` instead of the old flow (method detection → latest query → conditional auto-upgrade).

**Rationale**: The old flow is completely superseded. The new check is simpler: fetch from our endpoint → compare → emit event. Removing the dead auto-upgrade path eliminates confusion and prevents accidental execution.

## Risks / Trade-offs

- **[Network failure on gh-proxy.org]** → The check is wrapped in `.catch(() => {})` at the call site (worker.ts), same as the old upgrade call. Failures are silently ignored, matching existing behavior.
- **[latest.json format change]** → The response schema (`{ version: string }`) is minimal and pinned. If the upstream format changes, the schema decode will fail gracefully and the check is silently skipped.
- **[Duplicate version events on restart]** → The existing `skipped_version` KV store in the TUI prevents re-prompting for the same version, so this is already handled.
- **[Dead code in upgrade() / HTTP API]** → The existing `upgrade()` implementation and `/global/upgrade` endpoint remain as dead code. This is intentional per the requirement to preserve existing code.
