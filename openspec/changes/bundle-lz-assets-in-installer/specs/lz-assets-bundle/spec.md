## ADDED Requirements

### Requirement: lz-assets bundled into installer
The electron-builder configuration SHALL include `src-tauri/lz-assets/` as an `extraResources` entry, mapping to `lz-assets/` in the resources directory. All files and subdirectories (commands/ and skills/) SHALL be included.

#### Scenario: Packaged app contains lz-assets
- **WHEN** the app is packaged via `electron-builder`
- **THEN** the resulting installer SHALL contain the `lz-assets/` directory under the resources path, preserving the full directory structure including `commands/` and `skills/`

#### Scenario: Resources path resolves lz-assets
- **WHEN** the packaged app is running
- **THEN** `process.resourcesPath + "/lz-assets"` SHALL point to a directory containing `commands/` and `skills/` subdirectories

### Requirement: lz-assets deployed to config directory on first run
The app SHALL copy lz-assets from the resources directory to the XDG config directory on first run, but only in packaged mode (`app.isPackaged === true`).

#### Scenario: First run in packaged mode
- **WHEN** the app starts in packaged mode and `lzAssetsVersion` in electron-store does not match `app.getVersion()`
- **THEN** the app SHALL copy all files from `process.resourcesPath/lz-assets/` to `<xdgConfig>/opencode/`, preserving directory structure, and set `lzAssetsVersion` to `app.getVersion()`

#### Scenario: First run in dev mode
- **WHEN** the app starts in dev mode (`app.isPackaged === false`)
- **THEN** the app SHALL NOT attempt to copy lz-assets

#### Scenario: Subsequent run with same version
- **WHEN** the app starts and `lzAssetsVersion` in electron-store equals `app.getVersion()`
- **THEN** the app SHALL skip the copy operation entirely

### Requirement: Version upgrade overwrites existing lz-assets
When the app version changes, lz-assets SHALL be fully overwritten with the new version's assets.

#### Scenario: Upgrade to new version
- **WHEN** the app starts after an upgrade and `lzAssetsVersion` does not match `app.getVersion()`
- **THEN** the app SHALL overwrite all files in `<xdgConfig>/opencode/commands/` and `<xdgConfig>/opencode/skills/` with the new version's lz-assets, then update `lzAssetsVersion`

#### Scenario: User-modified built-in skill overwritten
- **WHEN** a user has modified a built-in skill file (e.g., `skills/brainstorming/SKILL.md`) and the app upgrades
- **THEN** the modified file SHALL be overwritten with the new version's copy

### Requirement: Directory structure preserved
The copy operation SHALL preserve the full directory structure of lz-assets, including nested subdirectories.

#### Scenario: Skills with nested directories
- **WHEN** lz-assets contains `skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/*.xsd`
- **THEN** the same nested directory structure SHALL exist under `<xdgConfig>/opencode/skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/`

### Requirement: Target path uses XDG config directory
The target directory for lz-assets SHALL be resolved using `xdg-basedir`'s `xdgConfig` appended with `"opencode"`, matching the opencode engine's `Global.Path.config`.

#### Scenario: Windows target path
- **WHEN** the app runs on Windows and `XDG_CONFIG_HOME` is not set
- **THEN** lz-assets SHALL be copied to `%USERPROFILE%\.config\opencode\`

#### Scenario: macOS/Linux target path
- **WHEN** the app runs on macOS or Linux and `XDG_CONFIG_HOME` is not set
- **THEN** lz-assets SHALL be copied to `~/.config/opencode/`

#### Scenario: Custom XDG_CONFIG_HOME
- **WHEN** `XDG_CONFIG_HOME` is set to a custom path
- **THEN** lz-assets SHALL be copied to `$XDG_CONFIG_HOME/opencode/`

### Requirement: Copy failure does not block startup
If the lz-assets copy operation fails (e.g., permissions, disk full), the app SHALL log the error but continue startup.

#### Scenario: Copy fails due to permissions
- **WHEN** the copy operation encounters a permission error
- **THEN** the app SHALL log the error and continue starting; `lzAssetsVersion` SHALL NOT be updated (so the copy will be retried on next launch)

### Requirement: Startup sequence integration
The `setupLzAssets()` function SHALL be called during app startup, after `migrate()` and only when `TEST_ONBOARDING` is not active.

#### Scenario: Normal startup
- **WHEN** the app starts normally (not in onboarding test mode)
- **THEN** `setupLzAssets()` SHALL be called after `migrate()`

#### Scenario: Onboarding test mode
- **WHEN** the app starts in onboarding test mode (`OPENCODE_TEST_ONBOARDING === "1"`)
- **THEN** `setupLzAssets()` SHALL NOT be called
