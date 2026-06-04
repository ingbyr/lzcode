import type { Configuration } from "electron-builder"

// Parse GH_REPO env var (e.g. "ingbyr/lzcode") into owner and repo name
// for the electron-builder publish config.
function getGhRepoParts() {
  const repo = process.env.GH_REPO
  if (!repo) return { owner: "ingbyr", name: "lzcode" }
  const parts = repo.split("/")
  return { owner: parts[0] ?? "ingbyr", name: parts[1] ?? "lzcode" }
}

const { owner: ghOwner, name: ghRepo } = getGhRepoParts()

const config: Configuration = {
  artifactName: "lzcode-desktop-${os}-${arch}.${ext}",
  appId: "ai.lzcode.desktop",
  productName: "LzCode",
  directories: {
    output: "dist",
    buildResources: "resources",
  },
  files: ["out/**/*", "resources/**/*"],
  extraResources: [
    {
      from: "native/",
      to: "native/",
      filter: ["index.js", "index.d.ts", "build/Release/mac_window.node", "swift-build/**"],
    },
    {
      from: "src-tauri/lz-assets/",
      to: "lz-assets/",
    },
  ],
  protocols: {
    name: "LzCode",
    schemes: ["lzcode"],
  },
  win: {
    icon: "resources/icons/icon.ico",
    // No signtoolOptions — lzcode desktop is unsigned
    target: ["nsis"],
    verifyUpdateCodeSignature: false,
  },
  nsis: {
    oneClick: true,
    perMachine: false,
    installerIcon: "resources/icons/icon.ico",
    installerHeaderIcon: "resources/icons/icon.ico",
  },
  publish: {
    provider: "github",
    owner: ghOwner,
    repo: ghRepo,
    channel: "latest",
  },
}

export default config