## ADDED Requirements

### Requirement: Workflow trigger and version input
The `publish-lzcode.yml` workflow SHALL be triggered by `workflow_dispatch` only, with a required `version` string input that specifies the exact release version. The workflow SHALL NOT be triggered by push to any branch.

#### Scenario: Manual trigger with version
- **WHEN** a maintainer triggers the workflow with `version` input set to `1.0.0`
- **THEN** the workflow uses `1.0.0` as the release version throughout all jobs, bypassing npm registry lookup

#### Scenario: No branch push trigger
- **WHEN** a push event occurs on any branch
- **THEN** the workflow does NOT run

### Requirement: Version job creates GitHub release draft
The workflow SHALL include a `version` job that creates a GitHub release draft using `script/version.ts` with `OPENCODE_VERSION` provided from the workflow input. The job SHALL set `OPENCODE_CHANNEL=latest` to ensure proper release channel semantics and SHALL use `--noai` changelog generation.

#### Scenario: Version job with explicit version
- **WHEN** the version job runs with `OPENCODE_VERSION=1.0.0` and `OPENCODE_CHANNEL=latest`
- **THEN** it creates a draft GitHub release tagged `v1.0.0` and outputs `version`, `release`, `tag`, and `repo` for downstream jobs

#### Scenario: Changelog generation without AI
- **WHEN** the version job runs
- **THEN** changelog is generated using `--noai` flag (raw commit-based), no AI model is invoked

### Requirement: CLI build for all platforms
The workflow SHALL include a `build-cli` job that runs on `ubuntu-24.04` and builds CLI binaries for all platforms: Linux (x64, arm64, glibc, musl), macOS (x64, arm64), and Windows (x64, arm64). The job SHALL use `packages/opencode/script/build.ts` and upload artifacts named `lzcode-cli` and `lzcode-cli-windows`.

#### Scenario: CLI builds all platform targets
- **WHEN** build-cli job runs
- **THEN** binaries are produced for darwin-arm64, darwin-x64, darwin-x64-baseline, linux-arm64, linux-x64, linux-x64-baseline, linux-arm64-musl, linux-x64-musl, linux-x64-musl-baseline, windows-arm64, windows-x64, windows-x64-baseline

#### Scenario: CLI artifacts use lzcode naming
- **WHEN** CLI artifacts are uploaded
- **THEN** the artifact names are `lzcode-cli` (macOS+Linux) and `lzcode-cli-windows` (Windows)

#### Scenario: CLI release archives use lzcode prefix
- **WHEN** a release is triggered (`OPENCODE_RELEASE` is set)
- **THEN** the build script produces archives named `lzcode-darwin-arm64.zip`, `lzcode-linux-x64.tar.gz`, `lzcode-windows-x64.zip`, etc.

### Requirement: Desktop build for Windows only, no signing
The workflow SHALL include a `build-electron` job with a matrix strategy that ONLY builds for Windows targets (x64 and arm64 on `windows-2025`). The job SHALL NOT perform any code signing — no Azure login, no Azure Trusted Signing, no Apple certificates, no signature verification. The job SHALL use `electron-builder.config.lzcode.ts` as the electron-builder config.

#### Scenario: Desktop builds Windows x64
- **WHEN** the matrix entry is `{ host: windows-2025, target: x86_64-pc-windows-msvc, platform_flag: --win }`
- **THEN** electron-builder produces an NSIS installer for Windows x64

#### Scenario: Desktop builds Windows arm64
- **WHEN** the matrix entry is `{ host: windows-2025, target: aarch64-pc-windows-msvc, platform_flag: --win --arm64 }`
- **THEN** electron-builder produces an NSIS installer for Windows arm64

#### Scenario: No macOS or Linux desktop builds
- **WHEN** the workflow runs
- **THEN** the matrix does NOT include macOS or Linux entries

#### Scenario: No code signing performed
- **WHEN** the desktop build runs on Windows
- **THEN** no Azure login step is executed, no signing certificates are provided, and the `sign-windows.ps1` script gracefully skips (exits 0) due to absent Azure env vars

### Requirement: No npm, Docker, or auto-update infrastructure
The workflow SHALL NOT publish to npm, build Docker images, or generate/update `latest.yml`, `latest-mac.yml`, `latest-linux.yml`, or `latest.json` files for auto-update.

#### Scenario: No npm publishing
- **WHEN** the release job completes
- **THEN** no npm packages are published

#### Scenario: No Docker images built
- **WHEN** the release job completes
- **THEN** no Docker images are built or pushed

#### Scenario: No auto-update metadata
- **WHEN** the release job completes
- **THEN** no `latest*.yml` or `latest.json` files are uploaded to the release

### Requirement: Release job uploads all artifacts and publishes
The workflow SHALL include a `release` job that downloads all CLI and desktop artifacts, and uploads them to the GitHub release, then edits the release to undraft it. Release assets SHALL use the `lzcode-` prefix.

#### Scenario: All CLI archives uploaded to release
- **WHEN** the release job runs and a release exists
- **THEN** all `lzcode-*.zip` and `lzcode-*.tar.gz` CLI archives are uploaded to the GitHub release

#### Scenario: Desktop installers uploaded to release
- **WHEN** the release job runs and a release exists
- **THEN** the `lzcode-desktop-*.exe` NSIS installers are uploaded to the GitHub release

#### Scenario: Release is published (undrafted)
- **WHEN** all artifacts are uploaded successfully
- **THEN** the GitHub release is edited from draft to published

#### Scenario: No-release run (preview/snapshot)
- **WHEN** no release draft was created (version is a preview like `0.0.0-dev-*`)
- **THEN** no release upload or publish steps are executed
