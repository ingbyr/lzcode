## ADDED Requirements

### Requirement: Share is disabled by default

The session sharing feature SHALL be disabled by default. Users MUST explicitly set `share: "manual"` or `share: "auto"` in their configuration to enable sharing functionality.

#### Scenario: User has no share config

- **WHEN** a user has not set the `share` field in any configuration file (global, project, or managed)
- **THEN** the effective `share` value SHALL be `"disabled"`
- **AND** share commands and buttons SHALL NOT be visible in the UI
- **AND** the share API SHALL reject requests with an error indicating sharing is disabled

#### Scenario: User explicitly sets share to manual

- **WHEN** a user sets `share: "manual"` in their configuration
- **THEN** the effective `share` value SHALL be `"manual"`
- **AND** share commands and buttons SHALL be visible in the UI
- **AND** sessions SHALL NOT be auto-shared on creation

#### Scenario: User explicitly sets share to auto

- **WHEN** a user sets `share: "auto"` in their configuration
- **THEN** the effective `share` value SHALL be `"auto"`
- **AND** share commands and buttons SHALL be visible in the UI
- **AND** new sessions SHALL be automatically shared on creation

#### Scenario: Managed config overrides the default

- **WHEN** a managed/MDM configuration sets `share: "auto"`
- **AND** the user has not set `share` in their local configuration
- **THEN** the effective `share` value SHALL be `"auto"`
- **AND** the managed config value SHALL take precedence over the default

### Requirement: Deprecated autoshare field is no longer migrated

The deprecated `autoshare` field SHALL continue to be parsed (for backward compatibility with existing configs) but SHALL NOT be automatically migrated to the `share` field.

#### Scenario: User has autoshare but no share

- **WHEN** a user has `autoshare: true` in their configuration
- **AND** has not set `share`
- **THEN** the effective `share` value SHALL be `"disabled"` (the default)
- **AND** sharing SHALL NOT be enabled

#### Scenario: User has both autoshare and share

- **WHEN** a user has both `autoshare: true` and `share: "auto"` in their configuration
- **THEN** the effective `share` value SHALL be `"auto"` (from the explicit `share` field)
- **AND** the `autoshare` field SHALL be ignored