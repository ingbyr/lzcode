## Why

The lzcode fork needs its own CI/CD workflow that produces branded release artifacts (lzcode-named binaries and desktop installers) independent of the upstream opencode pipeline. The current `publish.yml` is tightly coupled to opencode-specific infrastructure (Azure Trusted Signing, Apple notarization, npm registry, Docker publishing, upstream GitHub repo) that is unnecessary or unavailable for lzcode releases. A simplified, standalone workflow will enable lzcode to publish its own GitHub releases with minimal overhead.

## What Changes

- Create a new `publish-lzcode.yml` GitHub Actions workflow that mirrors the core build logic from `publish.yml` but is simplified for lzcode's needs
- CLI build: all platforms (Windows x64/arm64, Linux x64/arm64, macOS x64/arm64) — unchanged from upstream, since `build.ts` already outputs `lzcode-*` named binaries
- Desktop build: **Windows only** (x64 + arm64), with **no code signing** (no Azure, no Apple certs, no notarization)
- Release artifact naming: prefix changed from `opencode` to `lzcode` (e.g. `lzcode-desktop-win-x64.exe` instead of `opencode-desktop-win-x64.exe`)
- Release process: upload all CLI archives + desktop installer to a GitHub release draft, then publish it — no npm, no Docker, no auto-update (latest-yml/json) infrastructure
- Create a separate `electron-builder.config.lzcode.ts` to override `artifactName`, `appId`, `protocols`, and `publish` settings for lzcode branding, and to disable Windows signing via `signtoolOptions`
- Changelog: use `--noai` (raw commit-based changelog, no AI generation) — already the default in `version.ts`

## Capabilities

### New Capabilities
- `lzcode-publish-workflow`: The new GitHub Actions workflow definition, its trigger configuration, job structure, and version resolution strategy
- `lzcode-electron-builder-config`: Separate electron-builder configuration for lzcode desktop builds (artifact naming, appId, no signing, Windows-only targets)

### Modified Capabilities
- None — this is additive. The existing `publish.yml` and `electron-builder.config.ts` remain untouched.

## Impact

- New files: `.github/workflows/publish-lzcode.yml`, `packages/desktop/electron-builder.config.lzcode.ts`
- Existing scripts reused: `packages/opencode/script/build.ts`, `script/version.ts`, `script/changelog.ts` (all work with `OPENCODE_VERSION` env override, no npm registry lookup needed)
- `script/sign-windows.ps1` gracefully skips signing when Azure env vars are absent (no changes needed)
- The workflow will use the existing composite actions `setup-bun` and `setup-git-committer`
- No changes to the `packages/desktop/scripts/prepare.ts` / `prebuild.ts` pipeline — it already uses `lzcode-*` CLI binary names internally
- Version resolution: the `@opencode-ai/script` package is reused by providing `OPENCODE_VERSION` as a direct input, bypassing npm registry lookup entirely