; NSIS Installation Hooks for LzCode Desktop
; Copies skills to user config directory

!macro NSIS_HOOK_POSTINSTALL
  ; Copy skills to user config directory
  ; Source: $INSTDIR\resources\lz-assets\skills\
  ; Target: %USERPROFILE%\.config\opencode\skills\
  
  StrCpy $R0 "$PROFILE\.config\opencode\skills"
  
  ; Create target directory structure
  CreateDirectory "$R0"
  CreateDirectory "$R0\explain-code"
  
  ; Copy skills files from installer resources
  ${If} ${FileExists} "$INSTDIR\resources\lz-assets\skills\explain-code" 
    DetailPrint "Copying skills to user config directory..."
    CopyFiles "$INSTDIR\resources\lz-assets\skills\explain-code\*.*" "$R0\explain-code" 
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
