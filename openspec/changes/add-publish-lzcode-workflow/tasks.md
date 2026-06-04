## 1. Electron-Builder Config for lzcode

- [x] 1.1 Create `packages/desktop/electron-builder.config.lzcode.ts` with a minimal Windows-only config: `artifactName` set to `lzcode-desktop-${os}-${arch}.${ext}`, `appId` set to `ai.lzcode.desktop`, `productName` set to `"LzCode"`, `protocols.schemes` set to `["lzcode"]`, no `signtoolOptions` in `win` section, `win.target` set to `["nsis"]`, and `publish` set to `{ provider: "github", owner: "<from GH_REPO>", repo: "<from GH_REPO>" }` using env var parsing
- [x] 1.2 Verify the lzcode config produces correct artifact names by running a local `npx electron-builder --win --config electron-builder.config.lzcode.ts --publish never` dry-run (or inspect the config output)

## 2. GitHub Actions Workflow — Version & CLI Build Jobs

- [x] 2.1 Create `.github/workflows/publish-lzcode.yml` with `name: publish-lzcode`, `workflow_dispatch` trigger with required `version` string input, and `concurrency` group keyed by the version input
- [x] 2.2 Add `permissions` block: `id-token: write`, `contents: write`
- [x] 2.3 Add `version` job: checkout with `fetch-depth: 0`, setup-bun, setup-git-committer, run `script/version.ts` with `OPENCODE_VERSION=${{ inputs.version }}`, `OPENCODE_CHANNEL=latest`, `GH_REPO=${{ github.repository }}`, `GH_TOKEN` — output `version`, `release`, `tag`, `repo`
- [x] 2.4 Add `build-cli` job (`needs: version`, `runs-on: ubuntu-24.04`): checkout with `fetch-tags: true`, setup-bun, setup-git-committer, run `packages/opencode/script/build.ts` with `OPENCODE_VERSION`, `OPENCODE_RELEASE`, `GH_REPO`, `GH_TOKEN` env vars — upload `lzcode-cli` (darwin+linux) and `lzcode-cli-windows` (windows) artifacts

## 3. GitHub Actions Workflow — Desktop Build Job

- [x] 3.1 Add `build-electron` job (`needs: [build-cli, version]`, `runs-on: windows-2025`, `strategy.matrix` with two entries: x64 and arm64 Windows targets) — no Azure env vars in job-level `env`
- [x] 3.2 Steps: checkout, setup-bun, setup-node v24, setup-git-committer — no Azure login step, no Apple cert steps, no apt-cache steps
- [x] 3.3 Add `Prepare` step: `bun ./scripts/prepare.ts` in `packages/desktop` with `OPENCODE_VERSION`, `OPENCODE_CHANNEL=prod`, `OPENCODE_CLI_ARTIFACT=lzcode-cli-windows`, `RUST_TARGET`, `GH_TOKEN`, `GITHUB_RUN_ID`
- [x] 3.4 Add `Build` step: `bun run build` in `packages/desktop` with `OPENCODE_CHANNEL=prod` (omit Sentry env vars — optional)
- [x] 3.5 Add `Package` step: `npx electron-builder ${{ matrix.settings.platform_flag }} --publish never --config electron-builder.config.lzcode.ts` — no signing env vars (no CSC_LINK, no APPLE_API_KEY, etc.)
- [x] 3.6 Add upload-artifact step for `lzcode-desktop-${{ matrix.settings.target }}` from `packages/desktop/dist/*`
- [x] 3.7 Remove (do not include) the "Verify signed Windows Electron artifacts" step — no signing means no verification

## 4. GitHub Actions Workflow — Release Job

- [x] 4.1 Add `release` job (`needs: [version, build-cli, build-electron]`, `if: always() && !failure() && !cancelled()`, `runs-on: ubuntu-24.04`)
- [x] 4.2 Setup steps: checkout, setup-git-committer (no setup-bun needed — release job only runs `gh` commands)
- [x] 4.3 **Skipped** — CLI artifacts are uploaded directly by `build.ts` during the `build-cli` job when `OPENCODE_RELEASE` is set; no need to re-download and re-upload in the release job
- [x] 4.4 Download `lzcode-desktop-*` artifacts into `packages/desktop/dist` (using `merge-multiple: true` to flatten subdirectories)
- [x] 4.5 **Skipped** — CLI archives (`lzcode-*.zip`, `lzcode-*.tar.gz`) are already on the release, uploaded by `build.ts`
- [x] 4.6 If `needs.version.outputs.release` is set, upload all desktop installers from `packages/desktop/dist` (`lzcode-desktop-*.exe`, plus any blockmap files) to the GitHub release using `gh release upload`
- [x] 4.7 If `needs.version.outputs.release` is set, run `gh release edit v${{ needs.version.outputs.version }} --draft=false --repo ${{ needs.version.outputs.repo }}` to publish the release

## 5. Validation

- [ ] 5.1 Run a `workflow_dispatch` trigger with a `0.0.0-test-*` version to verify the full pipeline runs without errors (this will be a preview/snapshot run that doesn't create a release)
- [ ] 5.2 Verify CLI artifacts are named `lzcode-*` in the uploaded artifact list
- [ ] 5.3 Verify desktop artifacts are named `lzcode-desktop-*` in the uploaded artifact list
- [ ] 5.4 Run a proper release (`1.0.0` version) and verify the GitHub release contains all expected assets with `lzcode-` prefix
