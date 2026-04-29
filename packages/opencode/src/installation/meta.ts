declare global {
  const OPENCODE_VERSION: string
  const OPENCODE_CHANNEL: string
  const LZ_OPENCODE_VERSION: string
}

export const VERSION = typeof OPENCODE_VERSION === "string" ? OPENCODE_VERSION : "1.4.3"
export const CHANNEL = typeof OPENCODE_CHANNEL === "string" ? OPENCODE_CHANNEL : "local"
export const LZ_BASE_OPENCODE_VERSION = typeof LZ_OPENCODE_VERSION === "string" ? LZ_OPENCODE_VERSION: "local"
