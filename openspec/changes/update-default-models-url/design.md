## Context

The project fetches a JSON model configuration at runtime to populate the list of available LLM providers and models. Currently, the default source URL is `https://models.dev`, a third-party service. When `OPENCODE_MODELS_URL` is not set, the system falls back to this URL. The build script (`packages/opencode/script/generate.ts`) already uses `https://gh-proxy.org/https://github.com/ingbyr/lzmodels/releases/latest/download` for snapshot generation, meaning the project already maintains its own model list at that location. The runtime default should match this to ensure consistency and reliability.

The current code in `packages/core/src/models-dev.ts` uses:
1. A hardcoded default URL `"https://models.dev"` (line 140)
2. A cache file name derived by comparing the source against `"https://models.dev"` — when matching, it uses `models.json`; otherwise, it hashes the source URL (line 143)
3. The API endpoint `/api.json` appended to the source URL (line 156)

## Goals / Non-Goals

**Goals:**
- Replace the default URL so runtime model fetching uses the project's own hosted model list
- Preserve the `OPENCODE_MODELS_URL` env var override mechanism unchanged
- Ensure the cache file naming strategy works correctly with the new default URL

**Non-Goals:**
- Changing how the models JSON is parsed or consumed downstream
- Modifying the build/snapshot script (it already uses the new URL)
- Updating documentation references to `models.dev` (separate concern)
- Adding new env vars or configuration options

## Decisions

### Decision 1: Extract the default URL into a named constant

**Choice**: Define `DEFAULT_MODELS_URL` as a constant at the module level instead of inlining the string in two places.

**Rationale**: The default URL string appears in both the fallback expression (`Flag.OPENCODE_MODELS_URL || DEFAULT_MODELS_URL`) and the cache file name comparison. A named constant eliminates duplication, makes the value easy to find/change, and is self-documenting.

**Alternative considered**: Keep the string inline in both locations — rejected because it duplicates a long URL string and makes future changes error-prone.

### Decision 2: Use `"models.json"` as cache file name for the new default URL

**Choice**: Update the cache file name comparison to match against the new `DEFAULT_MODELS_URL` instead of `"https://models.dev"`, so the default source still uses the simple `models.json` filename.

**Rationale**: The special-case comparison exists to give the default URL a human-readable cache file name (`models.json`) instead of a hash-derived name. Since we're simply replacing the default, we should keep this convenience for the new default URL as well. The comparison should reference the constant so both uses stay synchronized.

**Alternative considered**: Always use the hashed file name for every URL — rejected because it makes debugging harder for the common (default) case.

### Decision 3: Verify the API endpoint path is correct with the new URL

**Choice**: The current code constructs the fetch URL as `${source}/api.json`. The new default URL `https://gh-proxy.org/https://github.com/ingbyr/lzmodels/releases/latest/download` already serves files at the root, so `/api.json` correctly resolves to `https://gh-proxy.org/https://github.com/ingbyr/lzmodels/releases/latest/download/api.json`. No path change is needed.

**Rationale**: The GitHub release artifact `api.json` is served at `<release-url>/api.json`, matching the existing path construction pattern.

## Risks / Trade-offs

- **[Cache migration]** → Users with an existing `models.json` cache (downloaded from `models.dev`) will have stale data. The file name is the same (`models.json`), so the TTL mechanism (5 minutes) will naturally trigger a refresh from the new source. No explicit migration needed.
- **[Proxy availability]** → The `gh-proxy.org` GitHub proxy could become unavailable. Mitigation: users can set `OPENCODE_MODELS_URL` to any alternative URL; the build snapshot serves as a fallback when network fetch fails.
- **[URL length]** → The new default URL is significantly longer than `models.dev`. Mitigation: using a constant keeps it DRY; it only appears once in the source code.