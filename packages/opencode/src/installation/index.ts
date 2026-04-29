import { Context, Effect, Layer, Schema } from "effect"
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/unstable/http"
import { withTransientReadRetry } from "@/util/effect-http-client"
import z from "zod"
import { BusEvent } from "@/bus/bus-event"
import * as Log from "@opencode-ai/core/util/log"
import { makeRuntime } from "@opencode-ai/core/effect/runtime"
import { Flag } from "@opencode-ai/core/flag/flag"
import semver from "semver"
import {
  InstallationChannel,
  InstallationVersion,
  LZ_BASE_OPENCODE_VERSION
} from "@opencode-ai/core/installation/version"

const log = Log.create({ service: "installation" })

export type Method = "curl" | "unknown"

export type ReleaseType = "patch" | "minor" | "major"

export const Event = {
  Updated: BusEvent.define(
    "installation.updated",
    Schema.Struct({
      version: Schema.String
    })
  ),
  UpdateAvailable: BusEvent.define(
    "installation.update-available",
    Schema.Struct({
      version: Schema.String,
    })
  )
}

export function getReleaseType(current: string, latest: string): ReleaseType {
  const currMajor = semver.major(current)
  const currMinor = semver.minor(current)
  const newMajor = semver.major(latest)
  const newMinor = semver.minor(latest)

  if (newMajor > currMajor) return "major"
  if (newMinor > currMinor) return "minor"
  return "patch"
}

export const Info = z
  .object({
    version: z.string(),
    latest: z.string()
  })
  .meta({
    ref: "InstallationInfo"
  })
export type Info = z.infer<typeof Info>

export const USER_AGENT = `opencode/${InstallationChannel}/${InstallationVersion}/${Flag.OPENCODE_CLIENT}`


export function isPreview() {
  return InstallationChannel !== "latest"
}

export function isLocal() {
  return InstallationChannel === "local"
}

export class UpgradeFailedError extends Schema.TaggedErrorClass<UpgradeFailedError>()("UpgradeFailedError", {
  stderr: Schema.String
}) {
}

// Response schema for lzcode release API
const LzRelease = Schema.Struct({ version: Schema.String, pub_date: Schema.String })

const lzReleaseUrl = "https://gh-proxy.org/https://github.com/ingbyr/lzcode/releases/latest/download/latest.json"

export interface Interface {
  readonly info: () => Effect.Effect<Info>
  readonly method: () => Effect.Effect<Method>
  readonly latest: () => Effect.Effect<string>
  readonly upgrade: (method: Method, target: string) => Effect.Effect<void, UpgradeFailedError>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/Installation") {
}

export const layer: Layer.Layer<Service, never, HttpClient.HttpClient> = Layer.effect(
  Service,
  Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient
    const httpOk = HttpClient.filterStatusOk(withTransientReadRetry(http))

    const methodImpl = Effect.fn("Installation.method")(function* () {
      return "curl" as Method
    })

    const latestWithMetaImpl = Effect.fn("Installation.latestWithMeta")(function* () {
      log.info("fetching latest release info", { url: lzReleaseUrl })
      const response = yield* httpOk.execute(HttpClientRequest.get(lzReleaseUrl).pipe(HttpClientRequest.acceptJson))
      const raw = yield* response.text
      log.info("latest release raw response", { body: raw.slice(0, 500) })
      const data = yield* Schema.decodeUnknownEffect(Schema.fromJsonString(LzRelease))(raw)
      log.info("latest release parsed", { version: data.version, pub_date: data.pub_date })
      return data
    }, Effect.orDie)

    const latestImpl = Effect.fn("Installation.latest")(function* () {
      const meta = yield* latestWithMetaImpl()
      return meta.version
    }, Effect.orDie)

    const upgradeImpl = Effect.fn("Installation.upgrade")(function* (_m: Method, _target: string) {
      return yield* new UpgradeFailedError({ stderr: "Auto-upgrade is disabled. Please update manually." })
    })

    return Service.of({
      info: Effect.fn("Installation.info")(function* () {
        return {
          version: LZ_BASE_OPENCODE_VERSION,
          latest: yield* latestImpl()
        }
      }),
      method: methodImpl,
      latest: latestImpl,
      upgrade: upgradeImpl
    })
  })
)

export const defaultLayer = layer.pipe(Layer.provide(FetchHttpClient.layer))

const { runPromise } = makeRuntime(Service, defaultLayer)

export const latest = (...args: Parameters<Interface["latest"]>) => runPromise((s) => s.latest(...args))
export const method = () => runPromise((s) => s.method())
export const upgrade = (...args: Parameters<Interface["upgrade"]>) => runPromise((s) => s.upgrade(...args))

export * as Installation from "."
