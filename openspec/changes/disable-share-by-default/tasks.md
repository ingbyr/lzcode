## 1. Config Schema Change

- [x] 1.1 Change `share` from `Schema.optional(...)` to `Schema.Literals(["manual", "auto", "disabled"]).pipe(Schema.withDefault("disabled"))` in `packages/opencode/src/config/config.ts:163`
- [x] 1.2 Remove the `autoshare` → `share` migration code (lines 767-769) in `packages/opencode/src/config/config.ts`

## 2. Test Updates

- [x] 2.1 Remove the `"migrates autoshare to share field"` test (lines 683-694) in `packages/opencode/test/config/config.test.ts`
- [x] 2.2 Run existing config tests to verify no regressions: `bun test packages/opencode/test/config/config.test.ts`

## 3. Verification

- [x] 3.1 Verify UI share commands are hidden when no `share` is configured (check `packages/app/src/pages/session/use-session-commands.tsx:358` — `config.share === "disabled"` now true by default)
- [x] 3.2 Verify message timeline share button is disabled when no `share` is configured (check `packages/app/src/pages/session/message-timeline.tsx:361`)
- [x] 3.3 Verify server-side share API rejects requests when no `share` is configured (check `packages/opencode/src/share/session.ts:29`)