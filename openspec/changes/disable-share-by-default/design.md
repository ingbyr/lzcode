## Context

The `share` config field controls session sharing behavior. It accepts three values: `"manual"`, `"auto"`, `"disabled"`. Currently it is defined as `Schema.optional(...)` — meaning when users don't set it, `share` is `undefined` and all downstream checks treat it as "enabled" (buttons visible, commands available).

The config loading pipeline merges multiple sources in order: agent configs → project-level `opencode.json` → `.opencode` directory → `OPENCODE_CONFIG_CONTENT` → remote account config → managed config → MDM. Each source is decoded through the `Config.Info` Schema, so the Schema default applies at the individual file level before merging.

## Goals / Non-Goals

**Goals:**
- Make sharing disabled by default — users must explicitly opt in
- Preserve the behavior for users who have already set `share` to `"manual"` or `"auto"`
- Minimize code changes by leveraging the Schema default

**Non-Goals:**
- Changing the share API endpoint or protocol
- Changing the `OPENCODE_AUTO_SHARE` or `OPENCODE_DISABLE_SHARE` environment variables
- Enforcing disabled share at the server level beyond what the config already does

## Decisions

### Decision 1: Use `Schema.withDefault("disabled")` instead of UI-level checks

**Chosen**: Change the Schema to `Schema.Literals(["manual", "auto", "disabled"]).pipe(Schema.withDefault("disabled"))` at `config.ts:163`.

**Rationale**: This is a single-line change that propagates through the entire system. Every config source (global, project, managed, MDM) is decoded through this Schema, so the default applies uniformly. All downstream checks (`config.share === "disabled"`) automatically pick up the new default.

**Alternatives considered**:
- Changing UI checks only (`config.share !== "manual" → hide`) — fragile, inconsistent between UI and server
- Changing server-side checks only — doesn't affect UI visibility

### Decision 2: Remove the `autoshare` → `share` migration code

**Chosen**: Delete lines 767-769 in `config.ts`:
```typescript
if (result.autoshare === true && !result.share) {
  result.share = "auto"
}
```

**Rationale**: With the Schema default, `share` is always `"disabled"` (never `undefined`), so `!result.share` is always `false`. The migration code becomes dead. The `autoshare` field is already marked `@deprecated`; removing the migration is a clean break.

**Alternatives considered**:
- Rewriting migration to check `result.share === "disabled" && result.autoshare === true` — adds complexity for a deprecated feature
- Keeping the code as-is — dead code, confusing for future readers

### Decision 3: Keep the `autoshare` Schema definition

**Chosen**: Keep the `autoshare` Schema field (lines 167-169) but remove the migration code.

**Rationale**: The Schema definition allows users with existing `autoshare: true` to still have it parsed (though it won't be migrated). Removing the Schema would cause a decode error for configs that still have `autoshare`. We can clean up the Schema in a future change.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Users with `autoshare: true` but no `share` silently lose auto-sharing | Low risk — `autoshare` is deprecated. Users should migrate to `share: "auto"`. |
| Breakage for scripts/tools that assume sharing is available | The change is opt-out via explicit config. Document in release notes. |
| Managed/MDM configs that rely on default being enabled | MDM configs typically set `share` explicitly, so they are unaffected. |

## Migration Plan

1. Apply the Schema change and remove the migration code
2. Update the test
3. No database migration needed — the `share` config is runtime-only
4. Document in release notes: users who want sharing must set `share: "manual"` or `share: "auto"` in their config
5. Rollback: revert the Schema change line (trivial one-line revert)