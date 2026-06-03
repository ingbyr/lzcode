#!/usr/bin/env bun

import { rm } from "fs/promises"
import path from "path"
import { parseArgs } from "util"

const root = path.resolve(import.meta.dir, "..")
const file = path.join(root, "UPCOMING_CHANGELOG.md")
const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    from: { type: "string", short: "f" },
    to: { type: "string", short: "t" },
    variant: { type: "string", default: "low" },
    quiet: { type: "boolean", default: false },
    print: { type: "boolean", default: false },
    noai: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
  allowPositionals: true,
})
const args = [...positionals]

if (values.from) args.push("--from", values.from)
if (values.to) args.push("--to", values.to)

if (values.help) {
  console.log(`
Usage: bun script/changelog.ts [options]

Generates UPCOMING_CHANGELOG.md.

Options:
  -f, --from <version>   Starting version (default: latest non-draft GitHub release)
  -t, --to <ref>         Ending ref (default: HEAD)
      --variant <name>   Thinking variant for opencode run (default: low, only used with AI)
      --quiet            Suppress opencode command output unless it fails
      --print            Print the generated UPCOMING_CHANGELOG.md after success
      --noai             Generate changelog without AI (uses raw-changelog.ts directly)
  -h, --help             Show this help message

Examples:
  bun script/changelog.ts
  bun script/changelog.ts --from 1.0.200
  bun script/changelog.ts -f 1.0.200 -t 1.0.205 --noai
`)
  process.exit(0)
}

await rm(file, { force: true })

if (values.noai) {
  // Generate changelog directly from raw-changelog.ts without AI
  const rawArgs = ["bun", "script/raw-changelog.ts"]
  if (values.from) rawArgs.push("--from", values.from)
  if (values.to) rawArgs.push("--to", values.to)

  const proc = Bun.spawn(rawArgs, {
    cwd: root,
    stdin: "inherit",
    stdout: "pipe",
    stderr: "inherit",
  })

  const stdout = await new Response(proc.stdout).text()
  const code = await proc.exited

  if (code !== 0) {
    process.exit(code)
  }

  // Clean up raw changelog: strip metadata lines and sanitize commit messages
  const cleaned = cleanRawChangelog(stdout)
  await Bun.write(file, cleaned)

  if (values.print) process.stdout.write(cleaned)
  process.exit(0)
}

// AI-based changelog generation (original behavior)
const quiet = values.quiet
const cmd = ["opencode", "run"]
cmd.push("--variant", values.variant)
cmd.push("--command", "changelog", "--", ...args)

const proc = Bun.spawn(cmd, {
  cwd: root,
  stdin: "inherit",
  stdout: quiet ? "pipe" : "inherit",
  stderr: quiet ? "pipe" : "inherit",
})

const [out, err] = quiet
  ? await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()])
  : ["", ""]
const aiCode = await proc.exited
if (aiCode === 0) {
  if (values.print) process.stdout.write(await Bun.file(file).text())
  process.exit(0)
}

if (quiet) {
  if (out) process.stdout.write(out)
  if (err) process.stderr.write(err)
}

process.exit(aiCode)

function cleanRawChangelog(raw: string): string {
  const lines = raw.split("\n")
  const result: string[] = []

  for (const line of lines) {
    // Strip metadata lines (Last release, Target ref, ## Community Contributors Input)
    if (/^Last release:/i.test(line)) continue
    if (/^Target ref:/i.test(line)) continue
    if (/^## Community Contributors Input/i.test(line)) continue

    // Clean commit message lines: remove conventional commit prefixes and PR numbers
    const commitMatch = line.match(/^(- `[^`]+` )(.*)$/)
    if (commitMatch) {
      const [, prefix, message] = commitMatch
      let cleaned = message
      // Remove conventional commit prefixes (feat:, fix:, refactor:, etc.)
      cleaned = cleaned.replace(/^(feat|fix|refactor|docs|chore|test|style|perf|build|ci|revert|improve|enhance)\(!?\):\s*/i, "")
      // Remove trailing PR numbers like (#123)
      cleaned = cleaned.replace(/\s*\(#\d+\)\s*$/, "")
      // Capitalize first letter
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
      result.push(`${prefix}${cleaned}`)
      continue
    }

    result.push(line)
  }

  // Remove trailing empty lines
  while (result.length > 0 && result[result.length - 1] === "") {
    result.pop()
  }

  return result.join("\n")
}