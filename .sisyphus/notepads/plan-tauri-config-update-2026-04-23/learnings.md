Update: tauri.conf.json for desktop bundle resources and NSIS installer hooks

- Action taken: Added bundle.resources with ["lz-assets/skills/"] and installerHooks for Windows NSIS as specified.
- Rationale: Ensure resources are packaged into the installer and NSIS hooks can run during install.
- Verification: JSON parses via `jq .` without errors after changes; file edited preserved existing config intact.
- Next steps: If there are additional NSIS or resource paths to include, add them in a single patch to avoid drift.
