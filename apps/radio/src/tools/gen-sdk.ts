import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { cliMessage, resolveCliLocale } from '@moonwitness/cli'
import { buildSchemaDocument, gateDecision, classifySchema, generateClientSource, installAddons, parseVersion } from '@moonwitness/moonql'
import { canonicalJson, type SchemaDocument } from '@moonwitness/core'
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

/** the committed snapshot is key-sorted, so a review sees content and not insertion order */
const stableJson = (value: unknown): string => canonicalJson(value)

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
function check(out: string, locale: 'id' | 'en'): boolean {
  const doc = currentDocument()
  const source = generateClientSource(doc)
  const snapshot = stableJson(doc)
  let ok = true

  if (readFileSync(resolve(process.cwd(), out), 'utf8') !== source) {
    console.error(cliMessage(locale, 'sdkDrift', { path: out }))
    ok = false
  }

  const committed = readSnapshot()
  if (!committed) {
    console.error(cliMessage(locale, 'sdkSnapshotMissing', { path: SNAPSHOT_OUT }))
    return false
  }
  if (JSON.stringify(committed) !== JSON.stringify(JSON.parse(snapshot))) {
    console.error(cliMessage(locale, 'sdkSnapshotStale', { path: resolve(process.cwd(), SNAPSHOT_OUT) }))
    ok = false
  }

  // the history is part of the contract artifacts: a snapshot that no release
  // recorded means one of the two was edited by hand
  const lastRelease = readHistory().at(-1)
  if (lastRelease && lastRelease.schemaHash !== committed.schemaHash) {
    console.error(cliMessage(locale, 'sdkHistoryStale', { path: HISTORY_OUT }))
    ok = false
  }

  // an additive change is free; a breaking one has to be paid for with a higher
  // major in the advertised apiVersion — otherwise "gen:sdk failed" says nothing
  // about which change hurt a caller
  const decision = gateDecision(committed, doc)
  for (const line of decision.breaking) console.error(`BREAKING  ${line}`)
  if (!decision.ok) {
    console.error(cliMessage(locale, 'sdkGateRejected'))
    return false
  }
  if (decision.breaking.length > 0) console.log(cliMessage(locale, 'sdkGateAccepted'))
  const grouped = classifySchema(committed, doc)
  if (grouped.added.length) console.log(cliMessage(locale, 'sdkAdditive', { items: grouped.added.join(', ') }))
  return ok
}

export function formatPlanNotice(
  locale: 'id' | 'en',
  plan: WritePlan,
  previousVersion: string | null,
  nextVersion: string,
  options: WriteOptions,
): string | undefined {
  if (plan.write && plan.breaking.length === 0) return undefined
  if (options.force && plan.write) return cliMessage(locale, 'sdkForced')

  if (!plan.write && options.allowBreaking) {
    const before = previousVersion ? parseVersion(previousVersion) : null
    const after = parseVersion(nextVersion)
    if (!before || !after || after.major <= before.major) {
      return cliMessage(locale, 'sdkMajorRequired', {
        required: (before?.major ?? 0) + 1,
        version: nextVersion,
      })
    }
  }
  if (!plan.write) return cliMessage(locale, 'sdkRaiseMajor')

  const before = previousVersion ? parseVersion(previousVersion) : null
  const after = parseVersion(nextVersion)
  if (options.allowBreaking && before && after) {
    return cliMessage(locale, 'sdkBreakingAccepted', { before: before.major, after: after.major })
  }
  return cliMessage(locale, 'sdkForced')
}

async function main(): Promise<void> {
  const localeArgs = resolveCliLocale(process.argv.slice(2), process.env.MW_LOCALE)
  if (!localeArgs.ok) {
    console.error(localeArgs.error === 'missing'
      ? cliMessage(localeArgs.locale, 'localeMissing')
      : cliMessage(localeArgs.locale, 'localeInvalid', { locale: localeArgs.value ?? '' }))
    process.exitCode = 1
    return
  }
  const { args, locale } = localeArgs
  const isCheck = args.includes('--check')
  const explicit = args.find((arg) => !arg.startsWith('--'))
  const out = resolve(process.cwd(), explicit ?? DEFAULT_OUT)

  if (isCheck) {
    process.exitCode = check(out, locale) ? 0 : 1
    if (process.exitCode === 0) console.log(cliMessage(locale, 'sdkUpToDate'))
    return
  }

  const doc = currentDocument()
  const previous = readSnapshot()
  const options = {
    allowBreaking: args.includes('--allow-breaking'),
    force: args.includes('--force'),
  }
  const plan = planWrite(previous, doc, options)
  for (const line of plan.breaking) console.error(`BREAKING  ${line}`)
  if (!plan.write) {
    console.error(cliMessage(locale, 'sdkRefusing', {
      reason: formatPlanNotice(locale, plan, previous?.apiVersion ?? null, doc.apiVersion, options) ?? '',
    }))
    process.exitCode = 1
    return
  }
  const notice = formatPlanNotice(locale, plan, previous?.apiVersion ?? null, doc.apiVersion, options)
  if (notice) console.warn(`moonql: ${notice}`)

  writeFileSync(out, generateClientSource(doc))
  writeFileSync(resolve(process.cwd(), SNAPSHOT_OUT), `${stableJson(doc)}\n`)
  writeFileSync(resolve(process.cwd(), HISTORY_OUT), `${JSON.stringify(appendHistory(readHistory(), doc, new Date().toISOString()), null, 2)}\n`)
  console.log(cliMessage(locale, 'sdkGenerated', { path: out }))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main()
