## Context

The lzcode project is a fork of opencode that needs its own release pipeline. The existing `publish.yml` is monolithic — it combines CLI building, desktop building (5 platforms with code signing), npm publishing, Docker image publishing, and auto-update metadata generation. The lzcode release needs only a subset: CLI for all platforms + desktop for Windows only, with no signing or publishing infrastructure beyond a GitHub release.

Key constraints from the existing codebase:
- `packages/opencode/script/build.ts` already produces `lzcode-*` named binaries — no renaming needed for CLI
- `@opencode-ai/script` resolves version from `OPENCODE_VERSION` env var when provided, bypassing npm registry lookup
- `script/sign-windows.ps1` gracefully skips signing when Azure env vars are absent
- `packages/desktop/scripts/utils.ts` references `lzcode-cli` as the sidecar binary name — already lzcode-branded
- `electron-builder.config.ts` hardcodes `opencode` naming in `artifactName`, `appId`, `publish` repo, and `protocols.schemes`

## Goals / Non-Goals

**Goals:**
- Create a self-contained `publish-lzcode.yml` workflow that produces lzcode-branded release artifacts
- Reuse existing build scripts (`build.ts`, `version.ts`, `changelog.ts`) without modification
- Create a separate `electron-builder.config.lzcode.ts` for desktop build customization
- Keep the workflow as simple as possible — minimal steps, no unnecessary infrastructure

**Non-Goals:**
- Modifying the existing `publish.yml` workflow or `electron-builder.config.ts`
- Implementing auto-update (latest-yml, latest-json) for lzcode desktop
- Publishing npm packages or Docker images for lzcode
- Code signing of any kind (Azure, Apple, or otherwise)
- Building desktop for macOS or Linux
- Renaming the internal `packages/opencode/` directory or `@opencode-ai/script` package name

## Decisions

### Decision 1: Separate electron-builder config file (not env-var patching)

**Choice**: Create `packages/desktop/electron-builder.config.lzcode.ts`

**Rationale**: Several fields that need changing (`artifactName`, `appId`, `protocols.schemes`, `win.signtoolOptions`, `publish` repo) cannot be overridden via environment variables — they must be in the config file. A separate file provides clean separation with zero risk of breaking the upstream workflow. The lzcode config will be substantially simpler (no mac/linux sections, no signing function), just a flat Windows-only config.

**Alternatives considered**:
- Modifying `electron-builder.config.ts` with a new channel value — adds a `lzcode` dimension to the existing `dev/beta/prod` channel concept, which is a different kind of variation (product identity vs release channel). Conflating these would make the config harder to reason about.
- Using env vars to override — impossible for most fields that need changing.

### Decision 2: Reuse `script/version.ts` with `OPENCODE_VERSION` direct input

**Choice**: Set `OPENCODE_VERSION` from the `workflow_dispatch` version input, and set `OPENCODE_CHANNEL=latest`

**Rationale**: The `@opencode-ai/script` package short-circuits to the provided `OPENCODE_VERSION` when set (line 35 of `index.ts`), completely bypassing npm registry lookup. The `version.ts` script then uses `Script.version` to create the release draft and generate changelog. This works without any script modifications.

**Alternatives considered**:
- Creating a separate `version-lzcode.ts` — adds maintenance burden, drifts from upstream
- Inline version handling in the workflow YAML — loses the changelog generation and release draft creation that `version.ts` provides

### Decision 3: Workflow trigger — `workflow_dispatch` only (no push triggers)

**Choice**: The workflow triggers only on manual dispatch with a required `version` input

**Rationale**: lzcode releases are expected to be less frequent and more deliberate than upstream. No branch should auto-trigger a release. The required `version` input ensures no accidental releases without a version number.

**Alternatives considered**:
- Adding push triggers like `publish.yml` — would cause accidental releases; lzcode doesn't need CI-on-push for releases

### Decision 4: No standalone `publish` job — use `release` job that only uploads artifacts

**Choice**: A simplified `release` job that downloads artifacts and uploads them to the GitHub release, then runs `gh release edit` to undraft it

**Rationale**: The upstream `publish` job does npm publishing, Docker builds, SDK rebuilding, finalize-latest-yml/json, git tagging, and version syncing — none of which are needed. The lzcode `release` job just gathers build outputs and attaches them to the release that was drafted by the `version` job.

**Alternatives considered**:
- Reusing `script/publish.ts` with `SKIP_NPM=true` — still runs `finalize-latest-json.ts` and `finalize-latest-yml.ts` which need `LATEST_YML_DIR` and `TAURI_SIGNING_PRIVATE_KEY`. Simpler to just upload artifacts directly.

### Decision 5: Desktop build uses `--publish never` + explicit upload

**Choice**: Desktop build packages with `--publish never`, and the `release` job uploads artifacts explicitly via `gh release upload`

**Rationale**: The upstream workflow uses `--publish always` which tells electron-builder to upload directly to the GitHub release. However, this requires `publish` config in electron-builder pointing to the correct repo. While we include the `publish` config in `lzcode`'s electron-builder config, using `--publish never` + explicit upload is simpler and avoids electron-builder's internal release management. It also makes the upload step visible and debuggable in the workflow.

**Alternatives considered**:
- `--publish always` — would work but ties the upload to electron-builder internals, less transparent

### Decision 6: Workflow artifact names use `lzcode-` prefix

**Choice**: Internal workflow artifacts (between jobs) use `lzcode-cli`, `lzcode-cli-windows`, `lzcode-desktop-*`

**Rationale**: While the internal artifact names are just for job-to-job transport and not user-facing, using the `lzcode-` prefix avoids confusion with the upstream workflow and makes it clear which artifacts belong to which pipeline.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| `@opencode-ai/script` could change version resolution behavior in future upstream updates | Medium — could break version lookup | Pin the workflow to work with the current script behavior; test after upstream merges |
| No code signing on Windows — users may see SmartScreen warnings | Low — acceptable for internal/early-stage tool | Can add signing later without workflow changes (just add Azure env vars back and update the config) |
| Separate electron-builder config drifts from upstream | Low — lzcode config is minimal and Windows-only | Keep the `getBase()` function in a shared import, or accept the small duplication |
| Changelog's `latest()` function queries the lzcode repo for previous releases — first release will fail with "No releases found" | Medium — blocks first release | Provide `--from` flag or handle the "no previous release" case by using initial commit as base |
| Desktop `prebuild.ts` calls `bun script/build-node.ts` from opencode package — if this script requires native modules, it could fail cross-platform | Low — same as upstream, already works in `publish.yml` | No change needed |
