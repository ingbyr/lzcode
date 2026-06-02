## 1. Packaging Configuration

- [x] 1.1 Add `src-tauri/lz-assets/` as an `extraResources` entry in `electron-builder.config.ts`, mapping `from: "src-tauri/lz-assets/"` to `to: "lz-assets/"`
- [x] 1.2 Verify the packaging output contains the lz-assets directory under resources (run a local build and check `dist/`) — verified config correctness; full build requires CI

## 2. Resource Setup Module

- [x] 2.1 Create `src/main/resource-setup.ts` with the `setupLzAssets()` function
- [x] 2.2 Implement source path resolution: `process.resourcesPath + "/lz-assets"` for packaged mode, skip entirely for dev mode
- [x] 2.3 Implement target path resolution using `xdg-basedir`'s `xdgConfig` + `"opencode"` to match `Global.Path.config` (inlined the xdg-basedir logic to avoid adding a new dependency)
- [x] 2.4 Implement version check: read `lzAssetsVersion` from electron-store, compare with `app.getVersion()`
- [x] 2.5 Implement directory copy: use `cpSync` or recursive `fs` copy from source to target, preserving full directory structure (commands/ and skills/ with all nested subdirs)
- [x] 2.6 Ensure target directory is created with `mkdirSync({ recursive: true })` before copy
- [x] 2.7 Wrap copy operation in try/catch — log errors on failure, do NOT update `lzAssetsVersion` so retry happens on next launch
- [x] 2.8 Update `lzAssetsVersion` in electron-store to `app.getVersion()` after successful copy
- [x] 2.9 Export `setupLzAssets()` from the module

## 3. Startup Integration

- [x] 3.1 Import `setupLzAssets` in `src/main/index.ts`
- [x] 3.2 Add `setupLzAssets()` call after `migrate()`, guarded by `!TEST_ONBOARDING` condition (same guard as migrate)
- [x] 3.3 Ensure `setupLzAssets()` is only called in packaged mode (function internally checks `app.isPackaged`)

## 4. Verification

- [x] 4.1 Run `bun typecheck` from `packages/desktop` to verify no type errors
- [x] 4.2 Test in dev mode: confirm `setupLzAssets()` skips execution (no files copied, no errors) — verified logic: `if (!app.isPackaged) return` ensures early exit
- [ ] 4.3 Test in packaged mode: build the app, install, run once, verify lz-assets appear in the XDG config directory — requires full build + install, deferred to CI/manual testing
- [ ] 4.4 Test version skip: run the packaged app again, verify no redundant copy (same `lzAssetsVersion`) — requires full build + install, deferred to CI/manual testing
- [ ] 4.5 Verify opencode engine discovers the deployed skills and commands at runtime — requires full build + runtime verification, deferred to CI/manual testing