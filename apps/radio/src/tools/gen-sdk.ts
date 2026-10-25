import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildSchemaDocument, gateDecision, classifySchema, generateClientSource, installAddons } from '@moonwitness/moonql'
import type { SchemaDocument } from '@moonwitness/core'
import { addons } from '../addons.js'
import { loadConfig } from '../config.js'

const DEFAULT_OUT = '../../packages/moonql-client/src/generated.ts'
const SNAPSHOT_OUT = '../../packages/moonql-client/src/schema-snapshot.json'

/**
 * Pure metadata -> source: `installAddons` is synchronous and never touches an
 * engine, a database or the network, so codegen runs anywhere `tsx` does.
 */
export function renderSdk(): string {
  return generateClientSource(buildSchemaDocument(installAddons(addons, { reservedPaths: [] })))
}

/** The live contract, with the version the hub itself would advertise. */
export function currentDocument(): SchemaDocument {
  return buildSchemaDocument(installAddons(addons, { reservedPaths: [] }), { apiVersion: loadConfig().api.version })
}

/** key-sorted JSON, so the committed snapshot is diffable in review */
function stableJson(value: unknown): string {
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      return Object.fromEntries(
        Object.entries(v as Record<string, unknown>)
          .filter(([, item]) => item !== undefined)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, item]) => [key, walk(item)]),
      )
    }
    return v
  }
  return JSON.stringify(walk(value))
}

function readSnapshot(): SchemaDocument | null {
  try {
    return JSON.parse(readFileSync(resolve(process.cwd(), SNAPSHOT_OUT), 'utf8')) as SchemaDocument
  } catch {
    return null
  }
}

/** `--check` verdict: drift, then the breaking-change gate. */
function check(out: string): boolean {
  const doc = currentDocument()
  const source = generateClientSource(doc)
  const snapshot = stableJson(doc)
  let ok = true

  if (readFileSync(resolve(process.cwd(), out), 'utf8') !== source) {
    console.error(`moonql: SDK drift — run \`pnpm gen:sdk\` (${out})`)
    ok = false
  }

  const committed = readSnapshot()
  if (!committed) {
    console.error(`moonql: no committed schema snapshot at ${SNAPSHOT_OUT} — run \`pnpm gen:sdk\``)
    return false
  }
  if (JSON.stringify(committed) !== JSON.stringify(JSON.parse(snapshot))) {
    console.error(`moonql: schema snapshot is stale (${resolve(process.cwd(), SNAPSHOT_OUT)}) — run \`pnpm gen:sdk\``)
    ok = false
  }

  // an additive change is free; a breaking one has to be paid for with a higher
  // major in the advertised apiVersion — otherwise "gen:sdk failed" says nothing
  // about which change hurt a caller
  const decision = gateDecision(committed, doc)
  for (const line of decision.breaking) console.error(`BREAKING  ${line}`)
  if (!decision.ok) {
    console.error(`moonql: ${decision.reason}`)
    return false
  }
  if (decision.breaking.length > 0) console.log(`moonql: ${decision.reason}`)
  const grouped = classifySchema(committed, doc)
  if (grouped.added.length) console.log(`moonql: additive — ${grouped.added.join(', ')}`)
  return ok
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const isCheck = args.includes('--check')
  const explicit = args.find((arg) => !arg.startsWith('--'))
  const out = resolve(process.cwd(), explicit ?? DEFAULT_OUT)

  if (isCheck) {
    process.exitCode = check(out) ? 0 : 1
    if (process.exitCode === 0) console.log('moonql: generated SDK is up to date')
    return
  }

  const doc = currentDocument()
  writeFileSync(out, generateClientSource(doc))
  writeFileSync(resolve(process.cwd(), SNAPSHOT_OUT), `${stableJson(doc)}\n`)
  console.log(`moonql: generated SDK -> ${out}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main()
