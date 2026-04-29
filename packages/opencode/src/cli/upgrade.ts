import { Bus } from "@/bus"
import { Installation } from "@/installation"
import { Log } from "../util/log"

export async function upgrade() {
  const log = Log.create({ service: "installation" })
  const meta = await Installation.latestWithMeta().catch((e) => {
    log.error("[upgrade] latestWithMeta failed:", e)
    return undefined
  })
  log.info("[upgrade] meta:" + meta + ", current:" + Installation.VERSION)
  if (!meta) return
  if (Installation.VERSION === meta.version) return

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
  // const kind = Installation.getReleaseType(Installation.VERSION, meta.version)
  // if (config.autoupdate === "notify" || kind !== "patch") {
  //   await Bus.publish(Installation.Event.UpdateAvailable, { version: meta.version, pub_date: meta.pub_date })
  //   return
  // }
  // if (method === "unknown") return
  // await Installation.upgrade(method, meta.version)
  //   .then(() => Bus.publish(Installation.Event.Updated, { version: meta.version }))
  //   .catch(() => {})
}
