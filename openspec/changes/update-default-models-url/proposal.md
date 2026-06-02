## Why

The current default URL for fetching model configuration (`https://models.dev`) is an external third-party service that may be slow or inaccessible in certain network environments. The project already maintains a custom models list hosted on GitHub (`ingbyr/lzmodels`), which is used in the build script. Changing the default URL to use this hosted release ensures reliable access to the project's own curated model list and removes dependency on an external service for the primary runtime behavior.

## What Changes

- Change the default fallback URL from `"https://models.dev"` to `"https://gh-proxy.org/https://github.com/ingbyr/lzmodels/releases/latest/download"` in `packages/core/src/models-dev.ts`
- Update the cache file name logic that compares against the default URL to use the new default value
- Ensure the API endpoint path (`/api.json`) remains correctly appended to the new base URL

## Capabilities

### New Capabilities

- `models-url-default`: Defines the default models source URL and cache file naming behavior

### Modified Capabilities

_(None — no existing specs are being changed)_

## Impact

- **Code**: `packages/core/src/models-dev.ts` (default URL constant and cache file name logic)
- **Runtime behavior**: Users who do not set `OPENCODE_MODELS_URL` will now fetch models from the GitHub-hosted release instead of models.dev
- **Cache**: Existing cache file `models.json` (stored under the old default URL name) will no longer match the new default; users will get a fresh download with the new cache file name on first run
- **API compatibility**: No breaking changes — the `OPENCODE_MODELS_URL` env var override continues to work as before