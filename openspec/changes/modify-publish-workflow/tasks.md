## 1. Runner Replacement

- [x] 1.1 Replace `blacksmith-4vcpu-ubuntu-2404` with `ubuntu-24.04` in `version` job (L36)
- [x] 1.2 Replace `blacksmith-4vcpu-ubuntu-2404` with `ubuntu-24.04` in `build-cli` job (L73)
- [x] 1.3 Replace `blacksmith-4vcpu-windows-2025` with `windows-2025` in `sign-cli-windows` job (L117)
- [x] 1.4 Replace `macos-26-intel` with `macos-13` in build-electron matrix (L230)
- [x] 1.5 Replace `macos-26` with `macos-15` in build-electron matrix (L234)
- [x] 1.6 Replace `"blacksmith-4vcpu-windows-2025"` with `"windows-2025"` in build-electron matrix (L242)
- [x] 1.7 Replace `"blacksmith-4vcpu-ubuntu-2404"` with `"ubuntu-24.04"` in build-electron matrix (L245)
- [x] 1.8 Remove the entire ARM64 Linux matrix entry (L248-250: `blacksmith-4vcpu-ubuntu-2404-arm` / `aarch64-unknown-linux-gnu`)
- [x] 1.9 Replace `blacksmith-4vcpu-ubuntu-2404` with `ubuntu-24.04` in `publish` job (L410)

## 2. Repository Reference Update

- [x] 2.1 Change `github.repository == 'anomalyco/opencode'` to `github.repository == 'ingbyr/lzcode'` in `version` job (L37)
- [x] 2.2 Change `github.repository == 'anomalyco/opencode'` to `github.repository == 'ingbyr/lzcode'` in `build-cli` job (L74)
- [x] 2.3 Change `github.repository == 'anomalyco/opencode'` to `github.repository == 'ingbyr/lzcode'` in `sign-cli-windows` job (L118)
- [x] 2.4 Change `github.repository == 'anomalyco/opencode'` to `github.repository == 'ingbyr/lzcode'` in `build-electron` job (L217)

## 3. Beta Removal

- [x] 3.1 Remove `- beta` from `on.push.branches` (L9)
- [x] 3.2 Simplify `GH_REPO` in `version` job from `(github.ref_name == 'beta' && 'anomalyco/opencode-beta') || github.repository` to just `github.repository` (L64)
- [x] 3.3 Remove sourcemap conditional in `build-cli` job: change `${{ (github.ref_name == 'beta' && '--sourcemaps') || '' }}` to empty string `''` (L92)
- [x] 3.4 Replace all `${{ (github.ref_name == 'beta' && 'beta') || 'prod' }}` with `'prod'` in `build-electron` job (L311, L321, L336, L350)

## 4. AUR Removal

- [x] 4.1 Remove "Cache apt packages (AUR)" step (L462-468)
- [x] 4.2 Remove "Setup SSH for AUR" step (L470-479)
- [x] 4.3 Remove `AUR_KEY` from the `./script/publish.ts` step env (L485)

## 5. Release Artifact Rename

- [x] 5.1 Add a "Rename Windows CLI archives" step in `sign-cli-windows` job, between `Compress-Archive` and `gh release upload`, that renames `opencode-windows-*.zip` to `lzcode-windows-*.zip`
- [x] 5.2 Update `gh release upload` paths in `sign-cli-windows` job (L199-201) from `opencode-windows-*` to `lzcode-windows-*`
- [x] 5.3 Change `OUT_NAME` variables in `build-electron` macOS release step (L360-363) from `opencode-desktop-mac-*` to `lzcode-desktop-mac-*`

## 6. Skip NPM Publishing

- [x] 6.1 Modify `script/publish.ts` to wrap the three npm publish sub-calls (L46, L49, L52) with `if (!process.env.SKIP_NPM)` conditionals
- [x] 6.2 Add `SKIP_NPM: true` to the `env` of the `./script/publish.ts` step in `publish.yml` (after L490)

## 7. Verification

- [x] 7.1 Verify no remaining references to `blacksmith`, `anomalyco`, `beta` conditional, or `AUR` in `publish.yml`
- [x] 7.2 Verify `script/publish.ts` still executes non-npm steps when `SKIP_NPM=true`
