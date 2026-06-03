## ADDED Requirements

### Requirement: Auto-derive upstream version from LZ fork version
The system SHALL derive the upstream (base) opencode version from the LZ fork version by applying `Math.floor(patch / 100)` to the semver patch segment. The result SHALL be exported as `LZ_BASE_OPENCODE_VERSION` from `packages/core/src/installation/version.ts`.

#### Scenario: Standard LZ fork version (3-digit patch)
- **WHEN** `InstallationVersion` is `"1.4.303"`
- **THEN** `LZ_BASE_OPENCODE_VERSION` SHALL be `"1.4.3"` (Math.floor(303 / 100) = 3)

#### Scenario: LZ fork version with 2-digit upstream patch
- **WHEN** `InstallationVersion` is `"1.14.2902"`
- **THEN** `LZ_BASE_OPENCODE_VERSION` SHALL be `"1.14.29"` (Math.floor(2902 / 100) = 29)

#### Scenario: LZ fork version with trailing zeros
- **WHEN** `InstallationVersion` is `"1.2.300"`
- **THEN** `LZ_BASE_OPENCODE_VERSION` SHALL be `"1.2.3"` (Math.floor(300 / 100) = 3)

#### Scenario: LZ fork version with upstream patch ≥ 10
- **WHEN** `InstallationVersion` is `"1.15.1001"`
- **THEN** `LZ_BASE_OPENCODE_VERSION` SHALL be `"1.15.10"` (Math.floor(1001 / 100) = 10)

### Requirement: Pass through non-LZ versions unchanged
The system SHALL return the version string unchanged when it is not a LZ fork version (patch < 100), a local build, or a preview/development build.

#### Scenario: Upstream version (patch < 100)
- **WHEN** `InstallationVersion` is `"1.15.3"`
- **THEN** `LZ_BASE_OPENCODE_VERSION` SHALL be `"1.15.3"` (patch 3 < 100, no derivation)

#### Scenario: Local development build
- **WHEN** `InstallationVersion` is `"local"`
- **THEN** `LZ_BASE_OPENCODE_VERSION` SHALL be `"local"`

#### Scenario: Preview/development version
- **WHEN** `InstallationVersion` is `"0.0.0-dev-20260417T0816"`
- **THEN** `LZ_BASE_OPENCODE_VERSION` SHALL be `"0.0.0-dev-20260417T0816"` (major = 0, no derivation)

### Requirement: Plugin dependency installation uses upstream version
The system SHALL use `LZ_BASE_OPENCODE_VERSION` (not `InstallationVersion`) as the version specifier when installing `@opencode-ai/plugin` via npm.

#### Scenario: Installing plugin dependency in production
- **WHEN** the system installs `@opencode-ai/plugin` for a project directory and `InstallationLocal` is `false`
- **THEN** the npm install SHALL specify `@opencode-ai/plugin@<LZ_BASE_OPENCODE_VERSION>` (e.g., `@opencode-ai/plugin@1.14.29`)

#### Scenario: Installing plugin dependency in local dev
- **WHEN** the system installs `@opencode-ai/plugin` for a project directory and `InstallationLocal` is `true`
- **THEN** the npm install SHALL specify `@opencode-ai/plugin` with no version constraint (equivalent to `*`)

### Requirement: Plugin compatibility check uses upstream version
The system SHALL use `LZ_BASE_OPENCODE_VERSION` (not `InstallationVersion`) when checking plugin compatibility via `checkPluginCompatibility()`.

#### Scenario: Checking compatibility of an npm plugin
- **WHEN** the system checks whether an npm plugin's `engines.opencode` range is satisfied
- **THEN** it SHALL compare `LZ_BASE_OPENCODE_VERSION` against the range (e.g., `"1.14.29"` against `">=1.14.0"`)

### Requirement: Remove manual LZ version injection mechanism
The system SHALL NOT require a manual `LZ_OPENCODE_VERSION` environment variable or CI workflow input. The `LZ_OPENCODE_VERSION` global declare, build define, and workflow input SHALL be removed.

#### Scenario: CI build without manual version input
- **WHEN** the publish workflow runs
- **THEN** it SHALL NOT include an `lz_opencode_version` input and SHALL NOT pass `LZ_OPENCODE_VERSION` as an environment variable

#### Scenario: Build without LZ_OPENCODE_VERSION env
- **WHEN** `LZ_OPENCODE_VERSION` environment variable is not set
- **THEN** the build SHALL succeed and `LZ_BASE_OPENCODE_VERSION` SHALL still be correctly derived from `InstallationVersion`
