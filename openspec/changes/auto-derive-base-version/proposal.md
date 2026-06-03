## Why

The LZ fork uses a version scheme where the patch segment encodes both the upstream version and a LZ build number: e.g. `1.14.2902` = upstream `1.14.29` + LZ build `02`. When installing `@opencode-ai/plugin` via npm, the code must use the upstream version (`1.14.29`) because npm only publishes upstream versions — `1.14.2902` does not exist on the registry. Currently, the code uses `InstallationVersion` (the fork version) for plugin dependency installation, which causes npm install failures. The existing `LZ_BASE_OPENCODE_VERSION` mechanism requires a manual CI input (`lz_opencode_version`) that must be calculated by a human for every release, and it is not consumed by the two key installation points (`config.ts` and `tui.ts`). This should be automated: the base version can be derived from the fork version via `Math.floor(patch / 100)`.

## What Changes

- Add a `lzBaseVersion()` function to `packages/core/src/installation/version.ts` that converts a fork version to its upstream base version using `Math.floor(patch / 100)`, with guards for non-LZ versions (patch < 100), preview versions (major = 0), and local/invalid versions.
- Replace `LZ_BASE_OPENCODE_VERSION` (currently derived from the `LZ_OPENCODE_VERSION` global define injected via CI input) with `LZ_BASE_OPENCODE_VERSION` auto-derived from `InstallationVersion` using `lzBaseVersion()`.
- Remove the `LZ_OPENCODE_VERSION` global declare, build define, and CI workflow input — no more manual version injection.
- Update all plugin dependency installation points to use `LZ_BASE_OPENCODE_VERSION` instead of `InstallationVersion`:
  - `packages/opencode/src/config/config.ts:639`
  - `packages/opencode/src/cli/cmd/tui/config/tui.ts:279`
- Update plugin compatibility check to use `LZ_BASE_OPENCODE_VERSION` instead of `InstallationVersion`:
  - `packages/opencode/src/plugin/loader.ts:126`
- Remove `lz_opencode_version` from `.github/workflows/publish.yml` (required input).
- Remove `LZ_OPENCODE_VERSION` define from `packages/opencode/script/build.ts`.
- Remove stale `LZ_OPENCODE_VERSION` references from `.vscode/launch.json` and `.vscode/tasks.json` (already removed in commit `c4412e4`, verify clean state).

## Capabilities

### New Capabilities
- `lz-version-derivation`: Auto-derives the upstream (base) opencode version from the LZ fork version number, replacing the manual CI-input-based mechanism.

### Modified Capabilities
<!-- No existing specs need requirement-level changes. The version derivation is internal infrastructure. -->

## Impact

- **`packages/core/src/installation/version.ts`**: New `lzBaseVersion()` function and changed `LZ_BASE_OPENCODE_VERSION` derivation (auto vs. global define).
- **`packages/opencode/src/config/config.ts`**: Import change (`LZ_BASE_OPENCODE_VERSION` instead of `InstallationVersion`), dependency install version change.
- **`packages/opencode/src/cli/cmd/tui/config/tui.ts`**: Same import and version change as config.ts.
- **`packages/opencode/src/plugin/loader.ts`**: Import and compatibility check version change.
- **`packages/opencode/script/build.ts`**: Remove `LZ_OPENCODE_VERSION` define.
- **`.github/workflows/publish.yml`**: Remove `lz_opencode_version` input and `LZ_OPENCODE_VERSION` env var.
- **Local development**: No longer requires `LZ_OPENCODE_VERSION` env var; `LZ_BASE_OPENCODE_VERSION` will auto-derive from `InstallationVersion`. For local dev (`InstallationVersion = "local"`), behavior unchanged — `LZ_BASE_OPENCODE_VERSION` returns `"local"`, and `InstallationLocal` is `true`, so plugin install uses `*` (no version pin).