## Context

The desktop app (`packages/desktop`) uses electron-builder to package an Electron application. It currently uses `extraResources` for a single item: native modules (`native/` → `native/`). The opencode engine (running in a sidecar utility process) discovers skills and commands by scanning directories returned by `config.directories()`, which includes `Global.Path.config` — resolved via `xdg-basedir` to `~/.config/opencode` on all platforms.

The built-in skills and commands live in `src-tauri/lz-assets/` (with `commands/` and `skills/` subdirectories), but they are not currently deployed anywhere the opencode engine can discover them. The directory structure matches opencode's discovery patterns: `{skill,skills}/**/SKILL.md` for skills and `{command,commands}/**/*.md` for commands.

The project already has a similar pattern: `migrate.ts` handles migration from Tauri-era data to electron-store, using a store key to track completion. This provides a proven template for first-run setup logic.

## Goals / Non-Goals

**Goals:**
- Bundle lz-assets into the installer so they are available offline after installation
- Deploy lz-assets to the XDG config directory on first run (packaged mode only)
- Update lz-assets on version upgrade by overwriting previously installed files
- Maintain directory structure so opencode's skill/command discovery works without any engine changes
- Skip redundant copies when the app version hasn't changed

**Non-Goals:**
- Protect user-modified built-in skills from being overwritten on upgrade (explicitly accepted trade-off: upgrades always overwrite)
- Deploy lz-assets in dev/unpackaged mode (dev mode doesn't need this — assets can be referenced directly)
- Clean up lz-assets on uninstall (user config should persist per standard practice)
- Handle XSD schemas, Python scripts, or other asset types differently from markdown — all files are treated uniformly as blob assets to copy

## Decisions

### 1. Use `extraResources` for packaging (not `extraFiles` or `files`)

**Chosen**: `extraResources` — assets land in `<installDir>/resources/lz-assets/`, accessible via `process.resourcesPath + "/lz-assets"`.

**Alternatives considered**:
- `extraFiles`: Copies to arbitrary locations during install, but only works for NSIS on Windows, not cross-platform
- `files` (in asar): Assets would be inside asar archive, requiring `original-fs` or `asar` package to read, and they can't be executed as scripts

**Rationale**: `extraResources` is the same pattern already used for `native/`. It works identically on all three platforms (Windows NSIS, macOS DMG, Linux AppImage/deb/rpm). Files are outside the asar and can be read directly with `fs`.

### 2. Copy on first run (not during NSIS install)

**Chosen**: Copy at app startup time, not during the NSIS installer phase.

**Alternatives considered**:
- NSIS custom script (`!macro customInstall`): Would require platform-specific NSIS scripting for Windows, plus different mechanisms for macOS/Linux
- Copy during installer: Only works on Windows; macOS DMG and Linux AppImage don't have equivalent hooks

**Rationale**: First-run copy is cross-platform, debuggable in Node.js, and consistent with the existing `migrate.ts` pattern. The slight delay (copying ~2MB) is imperceptible on first launch.

### 3. Version-based skip via electron-store

**Chosen**: Store the app version string in electron-store under the `lzAssetsVersion` key. If it matches `app.getVersion()`, skip the copy entirely.

**Alternatives considered**:
- Marker file in config directory: Requires knowing the config directory path at store time; could get out of sync if user clears electron-store
- File hash comparison: Over-engineered for this use case; version is sufficient
- Always copy on startup: Wastes ~2MB write I/O on every launch

**Rationale**: A single string comparison is the simplest possible check. The `migrate.ts` module uses the same pattern (`tauriMigrated` key). Version change triggers a full re-copy, ensuring assets always match the installed app.

### 4. Full overwrite on upgrade (no merge/diff)

**Chosen**: On version change, copy all files from `lz-assets/` to the config directory, overwriting any existing files with the same name.

**Alternatives considered**:
- Skip existing files: Would prevent built-in skill updates from reaching the user
- Three-way merge: Extremely complex for nested directory structures with mixed file types
- Per-file version tracking: Over-engineered — the entire lz-assets tree is a single atomic unit shipped with the app

**Rationale**: lz-assets are product-owned functional files (skill definitions, scripts, references), not user configuration. Overwriting on upgrade ensures users always have the latest built-in skills. User-created skills (in different directory names) are never affected.

### 5. Target path resolution using `xdg-basedir`

**Chosen**: Use `xdg-basedir`'s `xdgConfig` export to resolve the config directory, then append `"opencode"`. This matches exactly what `packages/core/src/global.ts` does for `Global.Path.config`.

**Alternatives considered**:
- Hardcode `~/.config/opencode`: Would fail on systems where `XDG_CONFIG_HOME` is set to a non-default path
- Use `process.env.XDG_CONFIG_HOME` directly: Would miss the `xdg-basedir` fallback logic on platforms where the env var isn't set

**Rationale**: Using the same library as the core package guarantees path consistency. On all platforms, `xdgConfig` resolves to the correct base directory, and appending `"opencode"` matches the opencode engine's expectation.

## Risks / Trade-offs

- **[User modifications lost on upgrade]** → Accepted. Built-in skills are product functionality; users who customize them should expect upgrades to overwrite. Custom skills in new directory names are unaffected.
- **[Config directory may not exist yet at copy time]** → Mitigated by creating the target directory with `mkdirSync({ recursive: true })` before copying.
- **[Copy failure (permissions, disk full)] → Mitigated by wrapping in try/catch and logging the error but not blocking app startup. The app remains usable without lz-assets; skills simply won't be available.
- **[Package size increase]** → ~2MB added to installer. Acceptable for a desktop application.
- **[Stale assets after downgrade]** → If a user installs an older version, newer lz-assets remain in the config directory. This is unlikely in practice and harmless — unknown skill fields are ignored by the engine.
