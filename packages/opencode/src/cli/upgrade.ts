import { Bus } from "@/bus"
import { Config } from "@/config/config"
import { AppRuntime } from "@/effect/app-runtime"
import { Flag } from "@opencode-ai/core/flag/flag"
import { Installation } from "@/installation"
import { InstallationVersion } from "@opencode-ai/core/installation/version"

export async function upgrade() {
  const config = await AppRuntime.runPromise(Config.Service.use((cfg) => cfg.getGlobal()))
  if (config.autoupdate === false || Flag.OPENCODE_DISABLE_AUTOUPDATE) return
  const method = await Installation.method()
  const latest = await Installation.latest(method).catch(() => {})
  if (!latest) return

  if (Flag.OPENCODE_ALWAYS_NOTIFY_UPDATE) {
    await Bus.publish(Installation.Event.UpdateAvailable, { version: latest })
    return
  }

  if (InstallationVersion === latest) return
  await Bus.publish(Installation.Event.UpdateAvailable, {
    version: meta.version,
    pub_date: meta.pub_date,
  })

  // [BLOCKED] auto-upgrade disabled — user must update manually
  // const config = await Config.getGlobal()
  // const method = await Installation.method()
  // if (Flag.OPENCODE_ALWAYS_NOTIFY_UPDATE) {
  //   await Bus.publish(Installation.Event.UpdateAvailable, { version: meta.version, pub_date: meta.pub_date })
  //   return
  // }
  // if (config.autoupdate === false || Flag.OPENCODE_DISABLE_AUTOUPDATE) return
  // const kind = Installation.getReleaseType(InstallationVersion, meta.version)
  // if (config.autoupdate === "notify" || kind !== "patch") {
  //   await Bus.publish(Installation.Event.UpdateAvailable, { version: meta.version, pub_date: meta.pub_date })
  //   return
  // }
  // if (method === "unknown") return
  // await Installation.upgrade(method, meta.version)
  //   .then(() => Bus.publish(Installation.Event.Updated, { version: meta.version }))
  //   .catch(() => {})
}
