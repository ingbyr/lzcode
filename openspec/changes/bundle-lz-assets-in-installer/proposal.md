## Why

The desktop app bundles built-in skills and commands (lz-assets) that provide core functionality to users (e.g., brainstorming, docx, pptx skills, commit command). Currently these assets are not deployed to the user's config directory, so the opencode engine cannot discover them at runtime. We need to bundle these assets into the installer and deploy them to the XDG config directory (`~/.config/opencode`) on first run, so that the opencode engine's skill/command discovery mechanism naturally finds them.

## What Changes

- Add `src-tauri/lz-assets/` as an `extraResources` entry in `electron-builder.config.ts`, so the entire lz-assets directory (commands/ and skills/) is packed into the installer alongside the app
- Create a new `resource-setup.ts` module in `src/main/` that copies lz-assets from `process.resourcesPath/lz-assets/` to the XDG config directory on first run (packaged mode only)
- Integrate `setupLzAssets()` into the app startup sequence in `index.ts`, called after `migrate()` and only when `app.isPackaged` is true
- On version upgrades, overwrite previously installed lz-assets with the new version (full replacement strategy — user modifications to built-in skills are not preserved)
- Track the installed version in electron-store (`lzAssetsVersion` key) to skip redundant copies when the version hasn't changed

## Capabilities

### New Capabilities
- `lz-assets-bundle`: Bundles built-in skills and commands into the desktop installer and deploys them to the user's XDG config directory on first run, with version-aware update handling

### Modified Capabilities

## Impact

- **electron-builder.config.ts**: New `extraResources` entry for lz-assets
- **src/main/resource-setup.ts**: New module for first-run asset deployment
- **src/main/index.ts**: New `setupLzAssets()` call in startup sequence
- **src/main/store.ts**: New `lzAssetsVersion` key in electron-store
- **Package size**: lz-assets adds ~2MB of skill/command files to the installer
- **User config directory**: Skills and commands will appear in `~/.config/opencode/skills/` and `~/.config/opencode/commands/`