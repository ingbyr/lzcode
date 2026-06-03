## Context

The LZ fork of opencode uses a version scheme where the semver patch segment encodes both the upstream (original) patch number and a LZ build sequence number. Specifically:

```
upstream patch × 100 + LZ sequence = fork patch
```

Examples from git tags:
- upstream `1.4.3` → fork `1.4.301`, `1.4.302`, `1.4.303`
- upstream `1.14.29` → fork `1.14.2902`

The `@opencode-ai/plugin` npm package is published under upstream version numbers only. When the runtime installs or checks compatibility with `@opencode-ai/plugin`, it must use the upstream version — e.g. `1.14.29`, not `1.14.2902` (which does not exist on npm).

Currently, `LZ_BASE_OPENCODE_VERSION` is derived from a global `LZ_OPENCODE_VERSION` define, which is injected via a required CI workflow input (`lz_opencode_version`). This has two problems:
1. **Human error**: Every release requires someone to manually calculate and input the upstream version.
2. **Incomplete consumption**: Two key installation points (`config.ts` and `tui.ts`) still use `InstallationVersion` (the fork version) instead of `LZ_BASE_OPENCODE_VERSION`, and the plugin compatibility check in `loader.ts` also uses the fork version.

## Goals / Non-Goals

**Goals:**
- Automatically derive the upstream (base) version from `InstallationVersion` at runtime — no manual CI input required.
- Fix all plugin dependency installation and compatibility check points to use the derived upstream version.
- Remove the `LZ_OPENCODE_VERSION` global define and CI workflow input entirely.

**Non-Goals:**
- Changing the LZ fork version numbering scheme itself.
- Publishing fork versions to npm (fork versions are never published to npm).
- Handling the case where upstream patch ≥ 100 (not seen in practice; current max upstream patch is ~53).
- Changing how `InstallationVersion` is displayed or used for user-agent strings, update checks, or version reporting.

## Decisions

### Decision 1: Derive upstream version via `Math.floor(patch / 100)`

**Choice**: Use arithmetic derivation: `upstreamPatch = Math.floor(forkPatch / 100)`.

**Alternatives considered**:
- **String slicing** (`patch.slice(0, -2)`): Fails for `300` → `"30"` instead of `"3"`. The correct result for fork `1.2.300` (upstream `1.2.3`) would be wrong.
- **Substring with parseInt**: `parseInt(patch.slice(0, -2))` — same issue, `"300".slice(0,-2)` = `"30"`.

**Rationale**: The version encoding is arithmetic by design: `upstreamPatch × 100 + lzSeq`. Arithmetic reversal is the correct inverse. `Math.floor(300 / 100) = 3` ✓, `Math.floor(2902 / 100) = 29` ✓.

### Decision 2: Guard for non-LZ versions

When `patch < 100`, the version is not a LZ fork version (it's either the upstream itself or a preview). The function must return the version unchanged in this case.

When `major === 0`, the version is a preview/development build (e.g., `0.0.0-dev-20260417T0816`). These have non-numeric patch segments and must be returned unchanged.

When `InstallationVersion === "local"`, the function returns `"local"`.

### Decision 3: Co-locate derivation in `version.ts`

**Choice**: Place `lzBaseVersion()` in `packages/core/src/installation/version.ts`.

**Alternatives considered**:
- Separate `lz-version.ts` module: Over-engineering for a single pure function.
- Inline at each consumption site: Duplicates logic and makes it harder to change the derivation rule.

**Rationale**: `version.ts` already owns `InstallationVersion`, `InstallationChannel`, `InstallationLocal`, and the legacy `LZ_BASE_OPENCODE_VERSION`. The derivation function belongs there — it transforms `InstallationVersion` into a related constant.

### Decision 4: Remove `LZ_OPENCODE_VERSION` global define and CI input

**Choice**: Delete the `LZ_OPENCODE_VERSION` declare global, build.ts define, and publish.yml input.

**Rationale**: The auto-derived `LZ_BASE_OPENCODE_VERSION` replaces the manual mechanism entirely. Keeping the old define would create two sources of truth and confuse future maintainers.

### Decision 5: Use `LZ_BASE_OPENCODE_VERSION` at all consumption points

All three current consumption points for plugin versioning must switch:

| File | Current | New |
|---|---|---|
| `config.ts:639` | `InstallationVersion` | `LZ_BASE_OPENCODE_VERSION` |
| `tui.ts:279` | `InstallationVersion` | `LZ_BASE_OPENCODE_VERSION` |
| `loader.ts:126` | `InstallationVersion` | `LZ_BASE_OPENCODE_VERSION` |

For the compatibility check in `loader.ts`, using the upstream version is correct because `@opencode-ai/plugin`'s `engines.opencode` field specifies ranges against upstream version numbers (e.g., `>=1.14.0`). Checking `1.14.2902` against `^1.14.29` would technically pass (semver sees 2902 > 29), but `1.14.2902` against `^1.15.0` would incorrectly fail (since minor 14 ≠ 15). Using the upstream version avoids this class of bugs.

## Risks / Trade-offs

**[Risk] Upstream patch ≥ 100**: If the upstream ever publishes a version like `1.14.100`, the LZ fork would need `1.14.100XX` (5-digit patch). `Math.floor(100XX / 100) = 100` still works. The guard `patch < 100` would need to be `patch < 100` still — but if upstream is `1.14.100`, fork is `1.14.10001`, patch is `10001`, which is ≥ 100, so the guard would correctly trigger derivation. → **No issue.**

**[Risk] Fork patch exactly equals upstream (no LZ suffix encoded)**: If someone builds with an upstream version directly (patch < 100), the guard returns it unchanged. This is correct — it's not a LZ version. → **Mitigated by guard.**

**[Risk] semver.valid() returns null for preview versions**: Preview versions like `0.0.0-dev-20260417T0816` would fail semver.valid(). The `lzBaseVersion()` function handles this by returning the version string unchanged when it's not a valid semver or has major=0. → **Mitigated by guards.**

**[Trade-off] Removing CI input reduces flexibility**: The `lz_opencode_version` input allowed overriding the base version for testing. However, this can be achieved by setting `OPENCODE_VERSION` directly (which controls `InstallationVersion`), and the auto-derivation will compute the correct base version from that. → **Acceptable trade-off.**
