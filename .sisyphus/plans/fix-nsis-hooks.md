# Fix NSIS Hooks Path Issue

## TL;DR

> **Quick Summary**: Fix the incorrect source path in NSIS hooks that prevents lz-assets from being copied to user config directory during installation.
>
> **Deliverables**: Modified `hooks.nsh` with correct path `$INSTDIR\lz-assets\` instead of `$INSTDIR\resources\lz-assets\`
>
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - single file change
> **Critical Path**: Task 1 → Verify

---

## Context

### Original Request
User reported that after installation, files from `lz-assets/` directory in the installer are not being copied to `%USERPROFILE%\.config\opencode\`.

### Root Cause Analysis
**Key Finding**:
- In `tauri.conf.json`, the bundle configuration has `"resources": ["lz-assets"]`
- Tauri bundles resources to the **install directory root**, not under a `resources/` subdirectory
- The installer package structure shows: `lz-assets/`, `LzCode.exe`, `lzcode-cli.exe`, `uninstall.exe` (all at root level)
- Current `hooks.nsh` uses path `$INSTDIR\resources\lz-assets\*.*` which does NOT exist
- `IfFileExists` check fails → copy operation is skipped

**Evidence from installer structure**:
```
drwxr-xr-x lz-assets/
-rwxr-xr-x LzCode.exe
-rwxr-xr-x lzcode-cli.exe
-rwxr-xr-x uninstall.exe
```

### Fix Required
Change source path from `$INSTDIR\resources\lz-assets\` to `$INSTDIR\lz-assets\`

---

## Work Objectives

### Core Objective
Correct the source path in `NSIS_HOOK_POSTINSTALL` macro to match actual Tauri bundle structure.

### Concrete Deliverables
- File: `packages/desktop/src-tauri/windows/hooks.nsh`
- Change: Update `IfFileExists` and `CopyFiles` paths from `$INSTDIR\resources\lz-assets\` to `$INSTDIR\lz-assets\`

### Definition of Done
- [ ] File modified with correct paths
- [ ] Comments updated to reflect correct source location
- [ ] Rebuild installer and verify files are copied

---

## TODOs

- [ ] 1. Fix NSIS hooks source path

  **What to do**:
  - Open `packages/desktop/src-tauri/windows/hooks.nsh`
  - Change line 6 comment: `Source: $INSTDIR\resources\lz-assets\` → `Source: $INSTDIR\lz-assets\ (Tauri bundles resources to install root)`
  - Change line 21: `IfFileExists "$INSTDIR\resources\lz-assets\*.*"` → `IfFileExists "$INSTDIR\lz-assets\*.*"`
  - Change line 23: `CopyFiles /SILENT "$INSTDIR\resources\lz-assets\*.*"` → `CopyFiles /SILENT "$INSTDIR\lz-assets\*.*"`
  - Change line 25: `DetailPrint "Failed to copy files from $INSTDIR\resources\lz-assets\ to $R0\"` → `DetailPrint "Failed to copy files from $INSTDIR\lz-assets\ to $R0\"`

  **Must NOT do**:
  - Change any other logic or structure
  - Remove error handling that was added earlier

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, minor path correction
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Verification task
  - **Blocked By**: None

  **References**:
  - `packages/desktop/src-tauri/windows/hooks.nsh` - File to modify
  - `packages/desktop/src-tauri/tauri.conf.json:37` - Shows `"resources": ["lz-assets"]` confirms bundle root placement

  **Acceptance Criteria**:
  - [ ] All four occurrences of `$INSTDIR\resources\lz-assets\` changed to `$INSTDIR\lz-assets\`
  - [ ] Comment updated to explain Tauri bundle behavior

  **QA Scenarios**:
  ```
  Scenario: Verify file modification
    Tool: Bash
    Steps:
      1. Read the modified hooks.nsh file
      2. grep for "lz-assets" to verify correct paths
    Expected Result: All paths show "$INSTDIR\lz-assets\" not "$INSTDIR\resources\lz-assets\"
    Evidence: .sisyphus/evidence/task-1-path-check.txt
  ```

  **Commit**: YES
  - Message: `fix(desktop): correct lz-assets path in NSIS hooks`
  - Files: `packages/desktop/src-tauri/windows/hooks.nsh`

---

## Final Verification Wave

- [ ] F1. **Path Verification** — `quick`
  Read hooks.nsh, verify all paths changed correctly. grep for "resources\lz-assets" should return nothing.

---

## Success Criteria

### Verification Commands
```bash
grep "resources\\\\lz-assets" packages/desktop/src-tauri/windows/hooks.nsh
# Expected: no output (path no longer exists in file)
```

### Final Checklist
- [ ] Source path corrected in all occurrences
- [ ] Comments updated
- [ ] File committed