# Draft: Desktop App Post-Install Hook

## Requirements (confirmed)

- **Goal**: Execute `bunx oh-my-openagent install` after desktop app installation completes
- **Platform**: Windows (primary), but should consider cross-platform
- **Technology**: Tauri v2 desktop app

## Research Findings

### Current Setup

- Desktop app uses Tauri v2 (`@tauri-apps/cli: 2.10.1`)
- Build config: `packages/desktop/src-tauri/tauri.conf.json`
- Bundle targets: `["deb", "rpm", "dmg", "nsis", "app"]`
- Existing sidecar: `sidecars/lzcode-cli`

### Platform Support Matrix (from librarian research)

| Platform | Bundle Format  | Post-Install Support       | Configuration Key                    |
| -------- | -------------- | -------------------------- | ------------------------------------ |
| Windows  | NSIS (.exe)    | ✅ Full (4 hooks)          | `bundle.windows.nsis.installerHooks` |
| Windows  | WiX/MSI (.msi) | ⚠️ Via fragments/templates | `bundle.windows.wix.template`        |
| Linux    | DEB            | ✅ Full (4 scripts)        | `bundle.linux.deb.*Script`           |
| Linux    | RPM            | ✅ Full (4 scripts)        | `bundle.linux.rpm.*Script`           |
| Linux    | AppImage       | ❌ Not supported           | N/A                                  |
| macOS    | DMG            | ❌ Not supported           | N/A                                  |

### Key Insight from Research

> **Critical**: Package managers should NOT be run from installer hooks directly.
> Instead, use **First-Run Setup** pattern or bundle bun as sidecar.

## Technical Decisions (pending)

- [ ] Which approach: installer hook vs first-run detection?
- [ ] Target platforms: Windows only or all?
- [ ] How to handle bun dependency: bundled or system?

## Open Questions

1. Is `bun` expected to be installed on user's system, or should we bundle it?
2. What does `bunx oh-my-openagent install` do? (installs additional dependencies/plugins?)
3. Should this run silently or show output to user?
4. What happens if the command fails?
