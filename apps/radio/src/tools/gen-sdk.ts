import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildSchemaDocument, gateDecision, classifySchema, generateClientSource, installAddons, parseVersion } from '@moonwitness/moonql'
import type { SchemaDocument } from '@moonwitness/core'
import { addons } from '../addons.js'
import { loadConfig } from '../config.js'

const DEFAULT_OUT = '../../packages/moonql-client/src/generated.ts'
const SNAPSHOT_OUT = '../../packages/moonql-client/src/schema-snapshot.json'
const HISTORY_OUT = '../../packages/moonql-client/src/schema-history.json'

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

/** One line per released contract: what callers could depend on, and since when. */
export interface HistoryEntry {
  apiVersion: string
  schemaHash: string
  date: string
}

function readHistory(): HistoryEntry[] {
  try {
    const parsed: unknown = JSON.parse(readFileSync(resolve(process.cwd(), HISTORY_OUT), 'utf8'))
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : []
  } catch {
    return [] // first release: the file is written with it
  }
}

export interface WriteOptions {
  /** an intentional break: only with the major already raised in API_VERSION */
  allowBreaking?: boolean
  /** last resort (local CI): write even though the gate says no */
  force?: boolean
}

export interface WritePlan {
  write: boolean
  breaking: string[]
  reason: string
}

/**
 * The decision the CLI must take *before* touching the committed files.
 *
 * `gateDecision` alone was not a gate: the write path rewrote `schema-snapshot.json`
 * first, so the "previous" contract the classifier compared against was the one it
 * had just produced. Here the committed snapshot is the baseline and a breaking
 * difference stops the write unless a human says so in the command line — the flag
 * is the acknowledgement, and it still insists on a real major bump, because
 * acknowledging a break without versioning it leaves callers nowhere to go.
 */
export function planWrite(prev: SchemaDocument | null, next: SchemaDocument, opts: WriteOptions = {}): WritePlan {
  if (!prev) return { write: true, breaking: [], reason: 'no committed snapshot: this is the first release' }

  const decision = gateDecision(prev, next)
  if (decision.breaking.length === 0) return { write: true, breaking: [], reason: decision.reason }

  if (opts.force) return { write: true, breaking: decision.breaking, reason: `forced past the gate — ${decision.reason}` }

  const before = parseVersion(prev.apiVersion)
  const after = parseVersion(next.apiVersion)
  if (!opts.allowBreaking) {
    return {
      write: false,
      breaking: decision.breaking,
      reason: `${decision.reason}; raise API_VERSION's major and re-run with --allow-breaking`,
    }
  }
  if (!before || !after || after.major <= before.major) {
    // --allow-breaking cannot stand in for a version: a caller needs the new major
    return {
      write: false,
      breaking: decision.breaking,
      reason: `--allow-breaking needs API_VERSION at major ${(before?.major ?? 0) + 1} or higher (it is "${next.apiVersion}")`,
    }
  }
  return { write: true, breaking: decision.breaking, reason: `breaking accepted with --allow-breaking: major ${before.major} -> ${after.major}` }
}

/**
 * Append-only release history, one entry per distinct contract. The last entry is
 * what `--check` holds the snapshot to, so "when did callers last see this hash"
 * is answerable from the repo instead of a release ticket.
 */
export function appendHistory(history: readonly HistoryEntry[], doc: SchemaDocument, date: string): HistoryEntry[] {
  const last = history.at(-1)
  if (last?.schemaHash === doc.schemaHash) return [...history]
  return [...history, { apiVersion: doc.apiVersion, schemaHash: doc.schemaHash, date }]
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

  // the history is part of the contract artifacts: a snapshot that no release
  // recorded means one of the two was edited by hand
  const lastRelease = readHistory().at(-1)
  if (lastRelease && lastRelease.schemaHash !== committed.schemaHash) {
    console.error(`moonql: ${HISTORY_OUT} does not record the committed snapshot — run \`pnpm gen:sdk\``)
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
  const plan = planWrite(readSnapshot(), doc, {
    allowBreaking: args.includes('--allow-breaking'),
    force: args.includes('--force'),
  })
  for (const line of plan.breaking) console.error(`BREAKING  ${line}`)
  if (!plan.write) {
    console.error(`moonql: refusing to write — ${plan.reason}`)
    process.exitCode = 1
    return
  }
  if (plan.breaking.length > 0) console.warn(`moonql: ${plan.reason}`)

  writeFileSync(out, generateClientSource(doc))
  writeFileSync(resolve(process.cwd(), SNAPSHOT_OUT), `${stableJson(doc)}\n`)
  writeFileSync(resolve(process.cwd(), HISTORY_OUT), `${JSON.stringify(appendHistory(readHistory(), doc, new Date().toISOString()), null, 2)}\n`)
  console.log(`moonql: generated SDK -> ${out}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main()
