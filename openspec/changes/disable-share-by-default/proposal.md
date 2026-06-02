## Why

Sharing sessions is currently enabled by default: when users don't configure `share` in their config, the UI shows share buttons and commands. This is a privacy concern — users may unintentionally share sensitive conversations. The feature should be opt-in, requiring explicit configuration to enable sharing.

## What Changes

- **BREAKING**: Change the `share` config Schema from `Schema.optional(...)` to `Schema.Literals(...).pipe(Schema.withDefault("disabled"))` — share is now disabled by default
- Remove the deprecated `autoshare` → `share` migration code (lines 767-769 in config.ts), which becomes dead code because `share` is never `undefined`
- Remove the corresponding `autoshare` migration test
- UI and server-side code that checks `config.share === "disabled"` automatically picks up the new default — no changes needed

## Capabilities

### New Capabilities

- `share-default-disabled`: The session sharing feature is disabled by default; users must explicitly set `share: "manual"` or `share: "auto"` in their config to enable it

### Modified Capabilities

<!-- No existing specs to modify -->

## Impact

- **Config schema** (`packages/opencode/src/config/config.ts`): Schema default change + removal of `autoshare` migration code
- **Tests** (`packages/opencode/test/config/config.test.ts`): Remove the `autoshare` migration test
- **User experience**: Existing users who never set `share` will see share buttons/commands disappear. Users who had `autoshare: true` without `share` will lose auto-sharing. Users who explicitly set `share` are unaffected.
- **No API changes**: The share API itself is unchanged; only the default behavior is altered