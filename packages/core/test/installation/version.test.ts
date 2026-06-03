import { describe, expect, test } from "bun:test"
import { lzBaseVersion } from "@opencode-ai/core/installation/version"

describe("lzBaseVersion", () => {
  test("standard LZ fork version (3-digit patch)", () => {
    expect(lzBaseVersion("1.4.303")).toBe("1.4.3")
  })

  test("LZ fork version with 2-digit upstream patch", () => {
    expect(lzBaseVersion("1.14.2902")).toBe("1.14.29")
  })

  test("LZ fork version with trailing zeros", () => {
    expect(lzBaseVersion("1.2.300")).toBe("1.2.3")
  })

  test("LZ fork version with upstream patch >= 10", () => {
    expect(lzBaseVersion("1.15.1001")).toBe("1.15.10")
  })

  test("upstream version (patch < 100) passed through unchanged", () => {
    expect(lzBaseVersion("1.15.3")).toBe("1.15.3")
  })

  test("local build returns 'local'", () => {
    expect(lzBaseVersion("local")).toBe("local")
  })

  test("preview/development version passed through unchanged", () => {
    expect(lzBaseVersion("0.0.0-dev-20260417T0816")).toBe("0.0.0-dev-20260417T0816")
  })

  test("invalid version string passed through unchanged", () => {
    expect(lzBaseVersion("not-a-version")).toBe("not-a-version")
  })
})