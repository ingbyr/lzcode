import { app } from "electron"
import log from "electron-log/main.js"
import { cpSync, mkdirSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { getStore } from "./store"

const LZ_ASSETS_VERSION_KEY = "lzAssetsVersion"

// Resolve the XDG config directory, matching xdg-basedir and packages/core/src/global.ts.
// On Windows/macOS/Linux: XDG_CONFIG_HOME if set, otherwise ~/.config
function xdgConfigDir() {
  return process.env.XDG_CONFIG_HOME || join(homedir(), ".config")
}

export function setupLzAssets() {
  if (!app.isPackaged) return

  const store = getStore()
  const currentVersion = app.getVersion()
  const installedVersion = store.get(LZ_ASSETS_VERSION_KEY)

  if (installedVersion === currentVersion) {
    log.log("lz-assets setup: already installed for version", currentVersion, ", skipping")
    return
  }

  const src = join(process.resourcesPath, "lz-assets")
  const dest = join(xdgConfigDir(), "opencode")

  log.log("lz-assets setup: starting", { src, dest, version: currentVersion })

  try {
    mkdirSync(dest, { recursive: true })
    cpSync(src, dest, { recursive: true, force: true })
    store.set(LZ_ASSETS_VERSION_KEY, currentVersion)
    log.log("lz-assets setup: complete")
  } catch (err) {
    log.warn("lz-assets setup: failed", err)
    // Do not update lzAssetsVersion so retry happens on next launch
  }
}