declare global {
  const OPENCODE_VERSION: string
  const OPENCODE_CHANNEL: string
}

export const InstallationVersion = typeof OPENCODE_VERSION === "string" ? OPENCODE_VERSION : "local"
export const InstallationChannel = typeof OPENCODE_CHANNEL === "string" ? OPENCODE_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"

import semver from "semver"

export function lzBaseVersion(version: string): string {
  if (version === "local") return "local"
  const parsed = semver.parse(version)
  if (!parsed || parsed.major === 0) return version
  if (parsed.patch < 100) return version
  return `${parsed.major}.${parsed.minor}.${Math.floor(parsed.patch / 100)}`
}

export const LZ_BASE_OPENCODE_VERSION = lzBaseVersion(InstallationVersion)
