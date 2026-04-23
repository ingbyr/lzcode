; NSIS Installation Hooks for LzCode Desktop
; Copies skills to user config directory

!macro NSIS_HOOK_POSTINSTALL
  ; Copy lz-assets to user config directory
  ; Source: $INSTDIR\lz-assets\
  ; Target: %USERPROFILE%\.config\opencode\
  
  ; Create target directory structure
  CreateDirectory "$PROFILE\.config\opencode"
  IfErrors 0 +2
    DetailPrint "Failed to create directory: $PROFILE\.config\opencode"

  ; Check if source directory exists before copying
  IfFileExists "$INSTDIR\lz-assets\*.*" 0 skip_copy
    ; Copy skills files from installer resources using /SILENT to avoid Windows dialog
    CopyFiles /SILENT "$INSTDIR\lz-assets\*.*" "$PROFILE\.config\opencode\"
    IfErrors 0 +2
      DetailPrint "Failed to copy files from $INSTDIR\lz-assets\ to $PROFILE\.config\opencode\"
  skip_copy:
!macroend

!macro NSIS_HOOK_PREINSTALL
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  ; Preserve user data - do not delete files on uninstall
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  ; Preserve user data - do not delete files on uninstall
  ; User can manually delete %USERPROFILE%\.config\opencode\ if desired
!macroend
