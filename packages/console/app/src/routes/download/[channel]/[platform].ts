import type { APIEvent } from "@solidjs/start"
import type { DownloadPlatform } from "../types"

const prodAssetNames: Record<string, string> = {
  "darwin-aarch64-dmg": "lzcode-desktop-darwin-aarch64.dmg",
  "darwin-x64-dmg": "lzcode-desktop-darwin-x64.dmg",
  "windows-x64-nsis": "lzcode-desktop-windows-x64.exe",
  "linux-x64-deb": "lzcode-desktop-linux-amd64.deb",
  "linux-x64-appimage": "lzcode-desktop-linux-amd64.AppImage",
  "linux-x64-rpm": "lzcode-desktop-linux-x86_64.rpm",
} satisfies Record<DownloadPlatform, string>

const betaAssetNames: Record<string, string> = {
  "darwin-aarch64-dmg": "lzcode-electron-mac-arm64.dmg",
  "darwin-x64-dmg": "lzcode-electron-mac-x64.dmg",
  "windows-x64-nsis": "lzcode-electron-win-x64.exe",
  "linux-x64-deb": "lzcode-electron-linux-amd64.deb",
  "linux-x64-appimage": "lzcode-electron-linux-x86_64.AppImage",
  "linux-x64-rpm": "lzcode-electron-linux-x86_64.rpm",
} satisfies Record<DownloadPlatform, string>

// Doing this on the server lets us preserve the original name for platforms we don't care to rename for
const downloadNames: Record<string, string> = {
  "darwin-aarch64-dmg": "LzCode Desktop.dmg",
  "darwin-x64-dmg": "LzCode Desktop.dmg",
  "windows-x64-nsis": "LzCode Desktop Installer.exe",
} satisfies { [K in DownloadPlatform]?: string }

export async function GET({ params: { platform, channel } }: APIEvent) {
  const assetName = channel === "stable" ? prodAssetNames[platform] : betaAssetNames[platform]
  if (!assetName) return new Response(null, { status: 404 })

  const resp = await fetch(
    `https://github.com/anomalyco/${channel === "stable" ? "lzcode" : "lzcode-beta"}/releases/latest/download/${assetName}`,
    {
      cf: {
        // in case gh releases has rate limits
        cacheTtl: 60 * 5,
        cacheEverything: true,
      },
    } as any,
  )

  const downloadName = downloadNames[platform]

  const headers = new Headers(resp.headers)
  if (downloadName) headers.set("content-disposition", `attachment; filename="${downloadName}"`)

  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers })
}
