// schema-diff CLI — the typed classifier in `@moonwitness/moonql` (schema-diff.ts),
// read against two `_schema` documents on disk.
//
//   node scripts/schema-diff.mjs <committed.json> <new.json>
//
// The gate that runs on every `pnpm verify` is `pnpm gen:sdk:check`, which compares
// the committed snapshot with the live registry and fails on a breaking change unless
// the advertised major went up. This file exists for the times someone wants to ask
// the question about two files by hand — a review, an incident, a "was this release
// allowed to say it was minor?" check — without going through codegen.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const moonql = async () => {
  try {
    return await import('@moonwitness/moonql')
  } catch {
    // outside a workspace install (CI job with only the built tree), reach the dist
    return import(pathToFileURL(resolve(import.meta.dirname, '../packages/moonql/dist/index.js')).href)
  }
}

const [fromPath, toPath] = process.argv.slice(2)
if (!fromPath || !toPath) {
  console.error('usage: node scripts/schema-diff.mjs <committed.json> <new.json>')
  process.exitCode = 2
} else {
  const { gateDecision } = await moonql()
  const prev = JSON.parse(readFileSync(resolve(fromPath), 'utf8'))
  const next = JSON.parse(readFileSync(resolve(toPath), 'utf8'))
  const decision = gateDecision(prev, next)
  for (const line of decision.breaking) console.log(`BREAKING  ${line}`)
  for (const line of decision.added) console.log(`added     ${line}`)
  for (const line of decision.changed) console.log(`changed   ${line}`)
  console.log(decision.reason)
  process.exitCode = decision.ok ? 0 : 1
}
