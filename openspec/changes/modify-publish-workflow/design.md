## Context

The `publish.yml` workflow was originally built for `anomalyco/opencode` using Blacksmith custom runners, npm/AUR publishing, and a beta release channel. After forking to `ingbyr/lzcode`, these features are either unavailable (Blacksmith runners, Azure signing credentials, AUR access) or unnecessary (beta channel, npm publish). The workflow needs to be adapted to work with GitHub-hosted official runners and the fork's publishing needs.

The current workflow has 4 jobs: `version`, `build-cli`, `sign-cli-windows`, `build-electron`, and `publish`. Each uses Blacksmith runners and is gated by `github.repository == 'anomalyco/opencode'`.

## Goals / Non-Goals

**Goals:**
- Make the workflow runnable on standard GitHub-hosted runners (no Blacksmith dependency)
- Point all repository references to `ingbyr/lzcode`
- Remove unused infrastructure (beta channel, AUR, npm publish)
- Rename release artifacts from `opencode` prefix to `lzcode` prefix at upload time only

**Non-Goals:**
- Renaming internal artifact transport names (upload-artifact / download-artifact names stay as-is)
- Renaming binary names inside archives (e.g., `opencode.exe` stays as-is)
- Modifying `electron-builder.config.ts` or build scripts
- Renaming npm package names or publishing to npm under a different name
- Adding new capabilities or features to the workflow

## Decisions

### Decision 1: ARM64 Linux — Drop the matrix entry

**Choice**: Remove the `aarch64-unknown-linux-gnu` matrix entry entirely.

**Alternatives considered**:
- `ubuntu-24.04-arm`: Only available on GitHub Team/Enterprise plans (paid)
- QEMU emulation on x64 runner: Would work but is significantly slower and adds complexity

**Rationale**: Most Linux desktop users run x64. ARM64 Linux can be re-added later if a paid GitHub plan or self-hosted ARM64 runner becomes available.

### Decision 2: macOS runner mapping

**Choice**: `macos-26-intel` → `macos-13`, `macos-26` → `macos-15`.

**Rationale**: `macos-13` is the last GitHub-hosted Intel macOS runner. `macos-15` is the latest ARM64 macOS runner. These match the original build targets (x86_64-apple-darwin and aarch64-apple-darwin).

### Decision 3: Release artifact rename — upload-time only

**Choice**: Rename artifacts only at the `gh release upload` step by adding rename steps before upload. Keep all internal artifact names (`opencode-cli`, `opencode-cli-windows`, etc.) and build output directory names unchanged.

**Alternatives considered**:
- Rename from source (electron-builder `artifactName`, build script output names): More thorough but cascading changes across signing paths, archive steps, upload-artifact names, download-artifact names — high risk of breakage for minimal benefit.

**Rationale**: Upload-time rename is the least invasive approach. Internal artifact transport is invisible to users. Only the names visible on the GitHub Release page matter to end users.

### Decision 4: Skip npm — Environment variable guard

**Choice**: Add `SKIP_NPM` env var guard in `script/publish.ts` around the three npm publish sub-calls, set `SKIP_NPM=true` in the workflow.

**Alternatives considered**:
- Remove the `./script/publish.ts` call entirely and replicate git tagging + release finalization as YAML shell steps: Duplicates logic, fragile
- Set invalid `NPM_TOKEN`: The script throws on publish failure, would break the workflow

**Rationale**: The `SKIP_NPM` env var approach is minimal, preserves all non-npm functionality (git tagging, version syncing, release finalization, SDK build), and is easily reversible if npm publishing is ever re-enabled.

### Decision 5: Beta removal — Clean cut

**Choice**: Remove all beta branch triggers, beta repo fallbacks, and beta channel conditionals.

**Rationale**: The fork does not have an `ingbyr/lzcode-beta` repository and does not plan beta releases. Removing beta logic simplifies the workflow and eliminates dead code paths.

## Risks / Trade-offs

- **[No ARM64 Linux builds]** → Users on ARM64 Linux (e.g., Raspberry Pi, ARM servers) won't get pre-built binaries. Mitigation: Can be re-added when ARM64 GitHub runners become available.
- **[Inconsistent naming]** → Release assets say `lzcode-*` but binaries inside still say `opencode.exe`. Mitigation: Document this; binary rename can be done in a follow-up change if needed.
- **[macos-13 deprecation]** → GitHub may deprecate `macos-13` (Intel) in the future. Mitigation: Monitor GitHub runner availability; can switch to self-hosted Intel macOS runner if needed.
- **[Azure signing may fail]** → The Windows signing steps still reference Azure Trusted Signing secrets that may not be configured in the fork. This is out of scope for this change but may cause the `sign-cli-windows` job to fail until credentials are provisioned.
