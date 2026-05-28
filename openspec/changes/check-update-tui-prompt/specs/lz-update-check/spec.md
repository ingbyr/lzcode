## ADDED Requirements

### Requirement: Check lzcode latest version from custom endpoint
The system SHALL fetch the latest lzcode version number by making an HTTP GET request to `https://gh-proxy.org/https://github.com/ingbyr/lzcode/releases/latest/download/latest.json`, decoding the JSON response to extract the `version` field, and comparing it with the current `InstallationVersion` using `semver.gt(latestVersion, InstallationVersion)`.

#### Scenario: New version available
- **WHEN** the endpoint returns a `version` value that is greater than the current `InstallationVersion` (per semver comparison)
- **THEN** the system SHALL emit an `installation.update-available` bus event with `{ version: latestVersion }` as properties

#### Scenario: Current version is latest
- **WHEN** the endpoint returns a `version` value equal to or less than the current `InstallationVersion`
- **THEN** the system SHALL NOT emit any bus event and silently return

#### Scenario: Network request fails
- **WHEN** the HTTP request to the endpoint fails, times out, or returns a non-200 status
- **THEN** the system SHALL silently swallow the error and return without emitting any event

#### Scenario: Response JSON malformed or missing version field
- **WHEN** the HTTP response body cannot be decoded as `{ version: string }` (schema validation fails)
- **THEN** the system SHALL silently swallow the error and return without emitting any event

### Requirement: Replace auto-upgrade with check-only in CLI upgrade flow
The `upgrade()` function in `src/cli/upgrade.ts` SHALL call `Installation.checkUpdate()` instead of the previous flow (detect method → query latest → auto-upgrade). It SHALL NOT attempt any package-manager-based or curl-based upgrade execution.

#### Scenario: TUI worker calls upgrade on startup
- **WHEN** the TUI worker's `checkUpgrade` RPC handler invokes `upgrade()`
- **THEN** `upgrade()` SHALL call `Installation.checkUpdate()` which fetches the lzcode version and emits `installation.update-available` if a newer version exists

#### Scenario: Auto-upgrade config disabled
- **WHEN** `config.autoupdate === false` or `OPENCODE_DISABLE_AUTOUPDATE` is set
- **THEN** `upgrade()` SHALL skip the check entirely and return immediately (matching existing early-return behavior)

### Requirement: TUI shows update notification dialog
The TUI SHALL display a `DialogAlert` popup when it receives an `installation.update-available` event, showing the title "Update Available" and message "A new version v{version} is available. Please update manually."

#### Scenario: Update event received
- **WHEN** the TUI receives an `installation.update-available` event with `{ version: "X.Y.Z" }`
- **THEN** a `DialogAlert` SHALL appear with title "Update Available" and message "A new version vX.Y.Z is available. Please update manually."

#### Scenario: Same version already skipped
- **WHEN** the TUI receives an `installation.update-available` event and the event version is not greater than the stored `skipped_version`
- **THEN** the dialog SHALL NOT be shown