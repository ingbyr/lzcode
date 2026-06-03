## Why

The codebase has been forked from `anomalyco/opencode` to `ingbyr/lzcode`, but the GitHub Actions publish workflow still references Blacksmith custom runners, the original repository owner, beta release infrastructure, AUR publishing, and npm publishing — none of which are available or needed in the forked environment. The publish workflow must be adapted to work with GitHub official runners, the new repository owner, and the project's actual publishing needs.

## What Changes

- **Remove Blacksmith custom runners** — Replace all `blacksmith-4vcpu-*` and Blacksmith macOS runners (`macos-26`, `macos-26-intel`) with GitHub-hosted official runners (`ubuntu-24.04`, `windows-2025`, `macos-13`, `macos-15`)
- **Remove ARM64 Linux build** — Delete the `blacksmith-4vcpu-ubuntu-2404-arm` (aarch64-unknown-linux-gnu) matrix entry since GitHub does not offer free ARM64 Ubuntu runners
- **Update repository references** — Change all `anomalyco/opencode` guards to `ingbyr/lzcode`
- **Remove beta release infrastructure** — Remove `beta` branch trigger, beta repository fallback (`anomalyco/opencode-beta`), beta-specific sourcemap flag, and beta channel conditionals
- **Remove AUR publishing** — Remove the Arch Linux User Repository SSH setup and publish steps
- **Skip npm publishing** — Add `SKIP_NPM` environment variable support to `script/publish.ts`, and set `SKIP_NPM=true` in the workflow to skip all npm publish calls while keeping git tagging, release finalization, and SDK build steps intact
- **Rename release artifacts** — Change the prefix of artifacts uploaded to GitHub Release from `opencode` to `lzcode` (upload-time rename only; internal artifact transport names and build output names remain unchanged)

## Capabilities

### New Capabilities

- `publish-workflow-config`: Configuration of the publish GitHub Actions workflow to use official runners, the correct repository owner, and the appropriate publishing targets (GitHub Release only, no npm/AUR/beta)

### Modified Capabilities

## Impact

- **`.github/workflows/publish.yml`** — Primary file being modified: runner names, repository guards, beta removal, AUR removal, artifact rename, SKIP_NPM env var
- **`script/publish.ts`** — Adding `SKIP_NPM` conditional to skip npm publish sub-calls while retaining git tagging and release finalization
- **GitHub Release assets** — Users will see `lzcode-*` prefixed filenames instead of `opencode-*` on the releases page
- **No impact on build scripts** — Internal artifact names, binary names (`opencode.exe`), and npm package names remain unchanged; only the final upload names are different
