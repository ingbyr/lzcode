## ADDED Requirements

### Requirement: Separate electron-builder config for lzcode
A new `electron-builder.config.lzcode.ts` file SHALL exist in `packages/desktop/` that provides an electron-builder configuration tailored for lzcode: `artifactName` using `lzcode-desktop-${os}-${arch}.${ext}`, no `signtoolOptions` (no signing), `appId` set to `ai.lzcode.desktop`, `productName` set to `"LzCode"`, and `protocols.schemes` set to `["lzcode"]`.

#### Scenario: Artifact names use lzcode prefix
- **WHEN** electron-builder packages the desktop app using `lzcode` config
- **THEN** output files are named `lzcode-desktop-win-x64.exe`, `lzcode-desktop-win-arm64.exe`, etc.

#### Scenario: No signing configuration
- **WHEN** the lzcode config is used on Windows
- **THEN** `win.signtoolOptions` is absent or undefined, and electron-builder does not attempt code signing

#### Scenario: Product identity
- **WHEN** the lzcode config is used
- **THEN** `appId` is `ai.lzcode.desktop`, `productName` is `"LzCode"`, and protocol scheme is `lzcode`

### Requirement: LZCODE_CONFIG env var to select config
The `build-electron` job in `publish-lzcode.yml` SHALL set an environment variable (e.g., `ELECTRON_BUILDER_CONFIG`) or pass the `--config` flag to electron-builder to point to `electron-builder.config.lzcode.ts` instead of the default `electron-builder.config.ts`.

#### Scenario: Config selection via --config flag
- **WHEN** electron-builder is invoked in the lzcode workflow
- **THEN** the `--config electron-builder.config.lzcode.ts` flag is passed, ensuring the lzcode-specific config is used

### Requirement: Publish target points to lzcode repo
The `publish` section in the lzcode electron-builder config SHALL point to the lzcode GitHub repository (owner/repo based on `GH_REPO` env var), not the upstream opencode repository.

#### Scenario: Release assets uploaded to correct repo
- **WHEN** electron-builder publishes with `--publish always`
- **THEN** release assets are uploaded to the repository specified by `GH_REPO`, not `anomalyco/opencode`
