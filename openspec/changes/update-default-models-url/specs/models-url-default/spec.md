## ADDED Requirements

### Requirement: Default models source URL
The system SHALL use `"https://gh-proxy.org/https://github.com/ingbyr/lzmodels/releases/latest/download"` as the default URL for fetching model configuration when the `OPENCODE_MODELS_URL` environment variable is not set.

#### Scenario: No OPENCODE_MODELS_URL env var set
- **WHEN** the `OPENCODE_MODELS_URL` environment variable is not defined
- **THEN** the system SHALL fetch model configuration from `https://gh-proxy.org/https://github.com/ingbyr/lzmodels/releases/latest/download/api.json`

#### Scenario: OPENCODE_MODELS_URL env var is set
- **WHEN** the `OPENCODE_MODELS_URL` environment variable is set to a custom URL
- **THEN** the system SHALL fetch model configuration from the custom URL instead of the default

### Requirement: Default URL defined as module constant
The default models URL SHALL be defined as a named constant (`DEFAULT_MODELS_URL`) at the module level in `packages/core/src/models-dev.ts`, referenced in both the fallback expression and the cache file name logic.

#### Scenario: Constant used in fallback
- **WHEN** the source URL is determined via `Flag.OPENCODE_MODELS_URL || DEFAULT_MODELS_URL`
- **THEN** the value of `DEFAULT_MODELS_URL` SHALL be `"https://gh-proxy.org/https://github.com/ingbyr/lzmodels/releases/latest/download"`

#### Scenario: Constant used in cache file name
- **WHEN** the cache file name is computed for the default source
- **THEN** the comparison SHALL use `DEFAULT_MODELS_URL` instead of the hardcoded `"https://models.dev"` string, yielding `"models.json"` for the default case and a hash-derived name for custom URLs

### Requirement: API endpoint path compatibility
The system SHALL append `/api.json` to the resolved source URL to construct the full fetch endpoint, and this SHALL work correctly with the new default URL.

#### Scenario: Fetch URL construction with default
- **WHEN** the source URL is the new default
- **THEN** the constructed fetch URL SHALL be `https://gh-proxy.org/https://github.com/ingbyr/lzmodels/releases/latest/download/api.json`

#### Scenario: Fetch URL construction with custom URL
- **WHEN** the source URL is a custom value provided via `OPENCODE_MODELS_URL`
- **THEN** the constructed fetch URL SHALL be `${customUrl}/api.json`