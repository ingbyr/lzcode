# Windows Installer Skills Copy Configuration

## TL;DR

> **Quick Summary**: Configure Tauri v2 Windows installer to copy skills directory to user's global config folder during installation.
> 
> **Deliverables**:
> - Modified `tauri.conf.json` with resources and installerHooks configuration
> - Modified `tauri.prod.conf.json` with same configuration
> - New `windows/hooks.nsh` NSIS hook script
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - sequential file modifications
> **Critical Path**: Config files → Create hooks.nsh → Build test

---

## Context

### Original Request
User wants to copy `packages/desktop/src-tauri/lz-assets/skills/explain-code/` directory to user's global config directory `~/.config/opencode/skills/` during Windows installation.

**Source**: `lz-assets/skills/explain-code/SKILL.md`
**Target**: `%USERPROFILE%\.config\opencode\skills\explain-code\SKILL.md`

### Technical Findings

**Tauri v2 Resource Path Resolution**:
- Resources configured in `bundle.resources` are placed at `$INSTDIR\resources\` after installation
- Path `lz-assets/skills/` → `$INSTDIR\resources\lz-assets\skills\`

**NSIS Variables**:
- `$PROFILE` = User home directory (equivalent to `%USERPROFILE%`)
- `$INSTDIR` = Application installation directory
- `$INSTDIR\resources\` = Bundled resources location

### Metis Review - Gaps Addressed

| Gap | Resolution |
|-----|------------|
| Overwrite policy | **Overwrite** - Always copy latest skills |
| Uninstall behavior | **Preserve** - Keep user data, don't delete skills |
| Target directory missing | Create recursively with `CreateDirectory` |
| Error handling | Continue installation, log warning on copy failure |

---

## Work Objectives

### Core Objective
Configure Windows NSIS installer to copy skills files to user config directory during installation.

### Concrete Deliverables
- `packages/desktop/src-tauri/tauri.conf.json` - Updated with resources + installerHooks
- `packages/desktop/src-tauri/tauri.prod.conf.json` - Updated with resources + installerHooks
- `packages/desktop/src-tauri/windows/hooks.nsh` - New NSIS hook script

### Definition of Done
- [ ] Installer copies skills to `%USERPROFILE%\.config\opencode\skills\explain-code\`
- [ ] SKILL.md exists at target location after install
- [ ] Uninstaller preserves user data
- [ ] Build completes without errors

### Must Have
- Skills copied to correct user config directory
- Directory structure preserved (explain-code/SKILL.md)
- Works on both dev and prod builds

### Must NOT Have (Guardrails)
- Do NOT delete user's existing skills on uninstall
- Do NOT fail installation if copy fails (continue with warning)
- Do NOT hardcode user paths (use NSIS variables)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (no automated installer tests)
- **Automated tests**: None
- **Agent-Executed QA**: YES - manual verification after build

### QA Policy
Verify by building installer and checking file system state after installation.

---

## Execution Strategy

### Sequential Execution (file dependencies)

```
Task 1: Update tauri.conf.json [quick]
    ↓
Task 2: Update tauri.prod.conf.json [quick]  
    ↓
Task 3: Create windows/hooks.nsh [quick]
    ↓
Task 4: Build and verify [unspecified-high]
```

---

## TODOs

- [x] 1. Update tauri.conf.json with resources and installerHooks

  **What to do**:
  - Add `"resources": ["lz-assets/skills/"]` to bundle object
  - Add `"installerHooks": "./windows/hooks.nsh"` to windows.nsis object
  
  **Must NOT do**:
  - Do not modify other existing configurations
  - Do not change icon paths or other settings

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `packages/desktop/src-tauri/tauri.conf.json` - Current configuration to modify
  - https://tauri.app/develop/resources - Official docs for bundle.resources

  **Acceptance Criteria**:
  - [ ] `bundle.resources` array contains `"lz-assets/skills/"`
  - [ ] `windows.nsis.installerHooks` set to `"./windows/hooks.nsh"`
  - [ ] JSON is valid syntax

  **QA Scenarios**:
  ```
  Scenario: Config file is valid JSON
    Tool: Bash
    Steps:
      1. cat packages/desktop/src-tauri/tauri.conf.json | jq .
    Expected Result: JSON parses without error
    Evidence: .sisyphus/evidence/task-1-config-valid.txt
  ```

  **Commit**: YES
  - Message: `feat(desktop): add skills resource to tauri.conf.json`
  - Files: `packages/desktop/src-tauri/tauri.conf.json`

---

- [x] 2. Update tauri.prod.conf.json with resources and installerHooks

  **What to do**:
  - Add `"resources": ["lz-assets/skills/"]` to bundle object
  - Add `"installerHooks": "./windows/hooks.nsh"` to windows.nsis object
  
  **Must NOT do**:
  - Do not modify icon paths or other prod-specific settings

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - `packages/desktop/src-tauri/tauri.prod.conf.json` - Current production config
  - Task 1 changes for consistency

  **Acceptance Criteria**:
  - [ ] `bundle.resources` array contains `"lz-assets/skills/"`
  - [ ] `windows.nsis.installerHooks` set to `"./windows/hooks.nsh"`
  - [ ] JSON is valid syntax

  **QA Scenarios**:
  ```
  Scenario: Prod config is valid JSON
    Tool: Bash
    Steps:
      1. cat packages/desktop/src-tauri/tauri.prod.conf.json | jq .
    Expected Result: JSON parses without error
    Evidence: .sisyphus/evidence/task-2-prod-config-valid.txt
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `feat(desktop): add skills resource to tauri configs`
  - Files: `packages/desktop/src-tauri/tauri.prod.conf.json`

---

- [x] 3. Create windows/hooks.nsh NSIS hook script

  **What to do**:
  - Create directory `packages/desktop/src-tauri/windows/` if not exists
  - Create `hooks.nsh` with NSIS_HOOK_POSTINSTALL macro
  - Copy skills from installer resources to user config directory

  **NSIS Hook Script Content**:
  ```nsh
  ; NSIS Installation Hooks for LzCode Desktop
  ; Copies skills to user's global config directory

  !macro NSIS_HOOK_POSTINSTALL
    ; Copy skills to user config directory
    ; Source: $INSTDIR\resources\lz-assets\skills\
    ; Target: %USERPROFILE%\.config\opencode\skills\
    
    StrCpy $R0 "$PROFILE\.config\opencode\skills"
    
    ; Create target directory structure
    CreateDirectory "$R0"
    CreateDirectory "$R0\explain-code"
    
    ; Copy skills files from installer resources
    ${If} ${FileExists} "$INSTDIR\resources\lz-assets\skills\explain-code\"
      DetailPrint "Copying skills to user config directory..."
      CopyFiles "$INSTDIR\resources\lz-assets\skills\explain-code\*.*" "$R0\explain-code\"
    ${Else}
      DetailPrint "Warning: Skills directory not found in installer resources"
    ${EndIf}
  !macroend

  !macro NSIS_HOOK_PREINSTALL
  !macroend

  !macro NSIS_HOOK_PREUNINSTALL
    ; Preserve user data - do not delete skills on uninstall
  !macroend

  !macro NSIS_HOOK_POSTUNINSTALL
    ; Preserve user data - do not delete skills on uninstall
    ; User can manually delete %USERPROFILE%\.config\opencode\ if desired
  !macroend
  ```
  
  **Must NOT do**:
  - Do NOT delete user's skills directory on uninstall
  - Do NOT use hardcoded paths like `C:\Users\...`
  - Do NOT fail installation if copy fails

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Task 2)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1, Task 2

  **References**:
  - Current NSIS installer: `packages/desktop/src-tauri/target/release/nsis/x64/installer.nsi` - for understanding hook insertion points
  - NSIS docs: https://tauri.app/distribute/windows-installer
  - Tauri NSIS template: https://github.com/tauri-apps/tauri/blob/dev/crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi

  **Acceptance Criteria**:
  - [ ] File created at `packages/desktop/src-tauri/windows/hooks.nsh`
  - [ ] Contains NSIS_HOOK_POSTINSTALL macro
  - [ ] Copies files to `$PROFILE\.config\opencode\skills\`
  - [ ] Uninstall hooks preserve user data

  **QA Scenarios**:
  ```
  Scenario: hooks.nsh file exists with correct macros
    Tool: Bash
    Steps:
      1. cat packages/desktop/src-tauri/windows/hooks.nsh | grep "NSIS_HOOK_POSTINSTALL"
      2. cat packages/desktop/src-tauri/windows/hooks.nsh | grep "NSIS_HOOK_POSTUNINSTALL"
    Expected Result: Both macros defined
    Evidence: .sisyphus/evidence/task-3-hooks-exist.txt
  ```

  **Commit**: YES
  - Message: `feat(desktop): add NSIS hooks to copy skills on install`
  - Files: `packages/desktop/src-tauri/windows/hooks.nsh`

---

- [x] 4. Build and verify installer

  **What to do**:
  - Run `bun run --cwd packages/desktop tauri build`
  - Verify NSIS installer is generated
  - Verify hooks are included in generated installer.nsi
  
  **Must NOT do**:
  - Do not run full release build if just testing
  - Can use `--no-bundle` for faster iteration if testing config only

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None
  - **Blocked By**: Task 1, Task 2, Task 3

  **References**:
  - Current build output: `packages/desktop/src-tauri/target/release/nsis/x64/`
  - Generated installer.nsi should contain hook macro calls

  **Acceptance Criteria**:
  - [ ] Build completes without errors
  - [ ] Installer exe generated at `packages/desktop/src-tauri/target/release/bundle/nsis/`
  - [ ] Generated installer.nsi references hooks.nsh

  **QA Scenarios**:
  ```
  Scenario: Build completes successfully
    Tool: Bash
    Steps:
      1. cd packages/desktop && bun run tauri build --config tauri.conf.json
      2. ls packages/desktop/src-tauri/target/release/bundle/nsis/*.exe
    Expected Result: Installer exe file exists
    Evidence: .sisyphus/evidence/task-4-build-success.txt
    
  Scenario: Hooks are included in generated NSIS script
    Tool: Bash
    Steps:
      1. grep "NSIS_HOOK_POSTINSTALL" packages/desktop/src-tauri/target/release/nsis/x64/installer.nsi
    Expected Result: Hook macro is called in installer
    Evidence: .sisyphus/evidence/task-4-hooks-in-nsi.txt
    
  Scenario: Resources are copied in installer
    Tool: Bash
    Steps:
      1. grep "lz-assets" packages/desktop/src-tauri/target/release/nsis/x64/installer.nsi
    Expected Result: lz-assets path appears in File commands
    Evidence: .sisyphus/evidence/task-4-resources-in-nsi.txt
  ```

  **Commit**: NO
  - Build output should not be committed

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** — `oracle`
  Verify all config changes are correct, hooks.nsh exists, build passes.

- [x] F2. **Code Quality Review** — `unspecified-high`
  Check JSON syntax, NSIS script syntax, no hardcoded paths.

- [x] F3. **Real Manual QA** — `unspecified-high`
  Run installer, verify skills copied to `%USERPROFILE%\.config\opencode\skills\explain-code\SKILL.md`

- [x] F4. **Scope Fidelity Check** — `deep`
  Ensure only required files modified, no scope creep.

---

## Commit Strategy

- **Commit 1**: `feat(desktop): add skills resource and NSIS hooks for Windows installer`
  - Files: 
    - `packages/desktop/src-tauri/tauri.conf.json`
    - `packages/desktop/src-tauri/tauri.prod.conf.json`
    - `packages/desktop/src-tauri/windows/hooks.nsh`
  - Pre-commit: Verify JSON syntax valid

---

## Success Criteria

### Verification Commands
```bash
# Build installer
bun run --cwd packages/desktop tauri build

# Check generated NSIS script includes hooks
grep NSIS_HOOK_POSTINSTALL packages/desktop/src-tauri/target/release/nsis/x64/installer.nsi

# Check resources are packaged
grep lz-assets packages/desktop/src-tauri/target/release/nsis/x64/installer.nsi
```

### Expected Outcome After User Installation
```
%USERPROFILE%\.config\opencode\skills\explain-code\SKILL.md
```
