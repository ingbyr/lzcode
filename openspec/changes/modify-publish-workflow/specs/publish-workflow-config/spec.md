## ADDED Requirements

### Requirement: GitHub Actions publish workflow SHALL use official GitHub-hosted runners

The publish workflow (`publish.yml`) SHALL use only standard GitHub-hosted runner labels. All Blacksmith custom runner labels (`blacksmith-4vcpu-ubuntu-2404`, `blacksmith-4vcpu-windows-2025`) and Blacksmith macOS labels (`macos-26`, `macos-26-intel`) SHALL be replaced with their GitHub-hosted equivalents.

Runner mapping:
- `blacksmith-4vcpu-ubuntu-2404` → `ubuntu-24.04`
- `blacksmith-4vcpu-windows-2025` → `windows-2025`
- `macos-26-intel` → `macos-13`
- `macos-26` → `macos-15`

The ARM64 Linux matrix entry (`blacksmith-4vcpu-ubuntu-2404-arm` targeting `aarch64-unknown-linux-gnu`) SHALL be removed entirely.

#### Scenario: Ubuntu runner uses official label
- **WHEN** the `version`, `build-cli`, or `publish` job runs
- **THEN** the `runs-on` value SHALL be `ubuntu-24.04`

#### Scenario: Windows runner uses official label
- **WHEN** the `sign-cli-windows` job or the Windows x64 matrix entry in `build-electron` runs
- **THEN** the runner SHALL be `windows-2025`

#### Scenario: macOS Intel runner uses official label
- **WHEN** the `x86_64-apple-darwin` matrix entry in `build-electron` runs
- **THEN** the `host` value SHALL be `macos-13`

#### Scenario: macOS ARM runner uses official label
- **WHEN** the `aarch64-apple-darwin` matrix entry in `build-electron` runs
- **THEN** the `host` value SHALL be `macos-15`

#### Scenario: ARM64 Linux build is not present
- **WHEN** the build-electron matrix is evaluated
- **THEN** there SHALL be no entry targeting `aarch64-unknown-linux-gnu`

### Requirement: Repository guards SHALL reference ingbyr/lzcode

All `if: github.repository == '...'` conditions in the publish workflow SHALL check against `ingbyr/lzcode` instead of `anomalyco/opencode`.

#### Scenario: Workflow only runs on ingbyr/lzcode repository
- **WHEN** the `version`, `build-cli`, `sign-cli-windows`, or `build-electron` job is triggered
- **THEN** the `if` condition SHALL be `github.repository == 'ingbyr/lzcode'`

### Requirement: Beta release infrastructure SHALL be removed

The workflow SHALL NOT include any beta-specific configuration. This includes:
- The `beta` branch trigger in `on.push.branches`
- The `anomalyco/opencode-beta` repository fallback in the `GH_REPO` environment variable
- The `--sourcemaps` conditional flag in the build-cli step
- The `${{ (github.ref_name == 'beta' && 'beta') || 'prod' }}` OPENCODE_CHANNEL conditionals — these SHALL be replaced with the literal value `'prod'`

#### Scenario: Beta branch does not trigger publish
- **WHEN** a push is made to the `beta` branch
- **THEN** the publish workflow SHALL NOT be triggered

#### Scenario: GH_REPO resolves to current repository
- **WHEN** the `version` job evaluates the `GH_REPO` environment variable
- **THEN** it SHALL resolve to `github.repository` without any beta branch conditional

#### Scenario: OPENCODE_CHANNEL is always prod
- **WHEN** any step that previously used the beta channel conditional is executed
- **THEN** the `OPENCODE_CHANNEL` / channel value SHALL be `'prod'`

### Requirement: AUR publishing steps SHALL be removed

The publish job SHALL NOT include steps for Arch Linux User Repository (AUR) publishing. The "Cache apt packages (AUR)", "Setup SSH for AUR", and the `AUR_KEY` environment variable SHALL be removed.

#### Scenario: Publish job does not include AUR steps
- **WHEN** the `publish` job runs
- **THEN** there SHALL be no SSH setup for `aur.archlinux.org`, no `pacman-package-manager` install, and no `AUR_KEY` environment variable

### Requirement: npm publishing SHALL be skipped

The top-level `script/publish.ts` SHALL support a `SKIP_NPM` environment variable. When `SKIP_NPM=true`, the script SHALL skip the three npm publish sub-calls (`packages/opencode/script/publish.ts`, `packages/sdk/js/script/publish.ts`, `packages/plugin/script/publish.ts`) while continuing to execute all other steps (version sync, SDK build, git tagging, release finalization).

The publish workflow SHALL set `SKIP_NPM=true` in the environment of the `./script/publish.ts` step.

#### Scenario: npm publish sub-calls are skipped when SKIP_NPM is set
- **WHEN** `script/publish.ts` runs with `SKIP_NPM=true` in the environment
- **THEN** the three `$\`bun ./packages/opencode/script/publish.ts\``, `$\`bun ./packages/sdk/js/script/publish.ts\``, and `$\`bun ./packages/plugin/script/publish.ts\`` calls SHALL be skipped

#### Scenario: Non-npm steps still execute when SKIP_NPM is set
- **WHEN** `script/publish.ts` runs with `SKIP_NPM=true`
- **THEN** version syncing (`prepareReleaseFiles`), SDK JS build, git tagging, and `gh release edit --draft=false` SHALL still execute

### Requirement: Release artifacts SHALL be renamed from opencode prefix to lzcode prefix

At the point where artifacts are uploaded to GitHub Release (via `gh release upload`), filenames with the `opencode` prefix SHALL be renamed to use the `lzcode` prefix. This applies to:

1. **Windows CLI zips**: In the `sign-cli-windows` job, after `Compress-Archive` creates `opencode-windows-arm64.zip`, `opencode-windows-x64.zip`, `opencode-windows-x64-baseline.zip`, they SHALL be renamed to `lzcode-windows-arm64.zip`, `lzcode-windows-x64.zip`, `lzcode-windows-x64-baseline.zip` before upload.

2. **macOS .app.tar.gz**: In the `build-electron` job's macOS release upload step, the `OUT_NAME` variable SHALL use the `lzcode-desktop-mac-*` prefix instead of `opencode-desktop-mac-*`.

Internal artifact names used for transport between jobs (e.g., `upload-artifact: name=opencode-cli`) SHALL remain unchanged.

#### Scenario: Windows CLI zips are renamed before upload
- **WHEN** the `sign-cli-windows` job uploads release assets to GitHub
- **THEN** the filenames SHALL be `lzcode-windows-arm64.zip`, `lzcode-windows-x64.zip`, `lzcode-windows-x64-baseline.zip`

#### Scenario: macOS .app.tar.gz uses lzcode prefix
- **WHEN** the `build-electron` job uploads macOS release assets to GitHub
- **THEN** the filenames SHALL be `lzcode-desktop-mac-x64.app.tar.gz` and `lzcode-desktop-mac-arm64.app.tar.gz`

#### Scenario: Internal artifact transport names are preserved
- **WHEN** artifacts are uploaded/downloaded between jobs using `actions/upload-artifact` and `actions/download-artifact`
- **THEN** the artifact names SHALL remain `opencode-cli`, `opencode-cli-windows`, `opencode-cli-signed-windows`, and `opencode-desktop-*`
