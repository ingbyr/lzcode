import { describe, expect, test } from "bun:test"
import { Effect, Layer } from "effect"
import { HttpClient, HttpClientRequest, HttpClientResponse } from "effect/unstable/http"
import { Installation } from "../../src/installation"

function mockHttpClient(handler: (request: HttpClientRequest.HttpClientRequest) => Response) {
  const client = HttpClient.make((request) => Effect.succeed(HttpClientResponse.fromWeb(request, handler(request))))
  return Layer.succeed(HttpClient.HttpClient, client)
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}

function testLayer(httpHandler: (request: HttpClientRequest.HttpClientRequest) => Response) {
  return Installation.layer.pipe(Layer.provide(mockHttpClient(httpHandler)))
}

describe("installation", () => {
  describe("latest", () => {
    test("reads version from lzcode release API", async () => {
      const layer = testLayer(() => jsonResponse({ version: "1.2.3", pub_date: "2025-01-01" }))

      const result = await Effect.runPromise(
        Installation.Service.use((svc) => svc.latest()).pipe(Effect.provide(layer)),
      )
      expect(result).toBe("1.2.3")
    })

    test("returns pre-release version string as-is", async () => {
      const layer = testLayer(() => jsonResponse({ version: "4.0.0-beta.1", pub_date: "2025-01-01" }))

      const result = await Effect.runPromise(
        Installation.Service.use((svc) => svc.latest()).pipe(Effect.provide(layer)),
      )
      expect(result).toBe("4.0.0-beta.1")
    })
  })

  describe("method", () => {
    test("always returns curl", async () => {
      const layer = testLayer(() => jsonResponse({ version: "1.0.0", pub_date: "2025-01-01" }))

      const result = await Effect.runPromise(
        Installation.Service.use((svc) => svc.method()).pipe(Effect.provide(layer)),
      )
      expect(result).toBe("curl")
    })
  })

  describe("info", () => {
    test("returns current version and latest", async () => {
      const layer = testLayer(() => jsonResponse({ version: "9.9.9", pub_date: "2025-01-01" }))

      const result = await Effect.runPromise(Installation.Service.use((svc) => svc.info()).pipe(Effect.provide(layer)))
      expect(result.latest).toBe("9.9.9")
    })
  })
})
