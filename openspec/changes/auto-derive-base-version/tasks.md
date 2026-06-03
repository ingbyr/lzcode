## 1. Core Version Derivation

- [x] 1.1 Add `lzBaseVersion()` function to `packages/core/src/installation/version.ts` — pure function that takes a version string, returns `"local"` for local builds, returns unchanged for invalid/non-LZ semver (patch < 100, major = 0), and applies `Math.floor(patch / 100)` for LZ versions
- [x] 1.2 Replace `LZ_BASE_OPENCODE_VERSION` in `version.ts` — change from `typeof LZ_OPENCODE_VERSION === "string" ? LZ_OPENCODE_VERSION : "local"` to `lzBaseVersion(InstallationVersion)`
- [x] 1.3 Remove `LZ_OPENCODE_VERSION` global declare from `version.ts` (the `declare global { const LZ_OPENCODE_VERSION: string }` block)
- [x] 1.4 Add unit tests for `lzBaseVersion()` covering: `1.4.303`→`1.4.3`, `1.14.2902`→`1.14.29`, `1.2.300`→`1.2.3`, `1.15.3`→`1.15.3` (unchanged), `"local"`→`"local"`, `"0.0.0-dev-X"`→unchanged

## 2. Update Consumption Points

- [x] 2.1 Update `packages/opencode/src/config/config.ts` — change import from `{ InstallationLocal, InstallationVersion }` to `{ InstallationLocal, LZ_BASE_OPENCODE_VERSION }`, change plugin version on line 639 from `InstallationVersion` to `LZ_BASE_OPENCODE_VERSION`
- [x] 2.2 Update `packages/opencode/src/cli/cmd/tui/config/tui.ts` — change import from `{ InstallationLocal, InstallationVersion }` to `{ InstallationLocal, LZ_BASE_OPENCODE_VERSION }`, change plugin version on line 279 from `InstallationVersion` to `LZ_BASE_OPENCODE_VERSION`
- [x] 2.3 Update `packages/opencode/src/plugin/loader.ts` — change import from `{ InstallationVersion }` to `{ LZ_BASE_OPENCODE_VERSION }`, change compatibility check on line 126 from `InstallationVersion` to `LZ_BASE_OPENCODE_VERSION`

## 3. Remove Manual Injection Mechanism

- [x] 3.1 Remove `LZ_OPENCODE_VERSION` define from `packages/opencode/script/build.ts` (line 230)
- [x] 3.2 Remove `lz_opencode_version` input from `.github/workflows/publish.yml` — remove the input definition and the `LZ_OPENCODE_VERSION` env vars that reference it
- [x] 3.3 Verify `.vscode/launch.json` and `.vscode/tasks.json` are clean — confirm no remaining `LZ_OPENCODE_VERSION` references (should already be clean from commit `c4412e4`)

## 4. Verification

- [x] 4.1 Run `bun typecheck` from `packages/opencode` to verify all type references resolve correctly after the import changes
- [x] 4.2 Run `bun test` from `packages/core` to verify unit tests pass for `lzBaseVersion()`
- [x] 4.3 Search codebase for any remaining references to `LZ_OPENCODE_VERSION` global define (not the derived constant) — verify all are removed