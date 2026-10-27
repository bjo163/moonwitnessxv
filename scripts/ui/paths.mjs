// Path contract for the UI visual harness (todo-ui.md UI-F18).
//
// Everything the harness writes lives in exactly one place: docs/audit/screens/.
// The names are deterministic and carry no date, so a re-run after another
// agent's edit simply overwrites the same evidence set instead of accumulating
// timestamped duplicates.
import { existsSync, appendFileSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** apps/dock — the app under test. Never written by the harness. */
export const DOCK_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'apps', 'dock')
export const REPO_ROOT = resolve(DOCK_ROOT, '..', '..')

/**
 * The evidence directory: PNGs + geometry.json, nothing else.
 *
 * `UI_SCREENS_DIR` redirects the whole evidence set outside the repository for
 * an exploratory run. Concurrent sessions keep uncommitted screenshots in
 * `docs/audit/screens/`, and a re-run overwrites the same deterministic names,
 * so a measurement that only needs to prove a geometry claim can write to a
 * scratch directory instead of destroying another session's committed-intent
 * evidence. A run that is meant to become repository evidence omits the
 * variable and lands in the default path.
 */
export const SCREENS_DIR = process.env.UI_SCREENS_DIR
  ? resolve(process.env.UI_SCREENS_DIR)
  : join(REPO_ROOT, 'docs', 'audit', 'screens')
export const GEOMETRY_PATH = join(SCREENS_DIR, 'geometry.json')

/** Design baseline the covered screens were audited against. */
export const DESIGN_BASELINE = 'd54ad43'

export function mkdirScreens() {
  mkdirSync(SCREENS_DIR, { recursive: true })
}

export function pngName(screen, locale, width, suffix = '') {
  return `${screen}-${locale}${suffix}-${width}.png`
}

/**
 * The status vocabulary is read from the app's own landing catalogue instead of
 * being hard-coded, so a copy change makes the harness compare against the new
 * words rather than fail on a stale literal.
 */
export function statusWordVocabulary() {
  const fallback = { en: ['REAL', 'PLANNED', 'DEMO'], id: ['NYATA', 'RENCANA', 'DEMO'] }
  const copyPath = join(DOCK_ROOT, 'src', 'lib', 'landing-copy.ts')
  if (!existsSync(copyPath)) return fallback
  const source = readFileSync(copyPath, 'utf8')
  const words = {}
  for (const locale of ['en', 'id']) {
    const block = source.match(new RegExp(`\\n  ${locale}:\\s*\\{[\\s\\S]*?\\n  \\}`))
    const found = []
    if (block) {
      for (const key of ['statusReal', 'statusPlanned', 'statusDemo']) {
        const value = block[0].match(new RegExp(`${key}:\\s*'([^']+)'`))
        if (value) found.push(value[1])
      }
    }
    words[locale] = found.length === 3 ? found : fallback[locale]
  }
  return words
}

/** Lists the evidence PNGs currently on disk (used by the run summary). */
export function listEvidence() {
  if (!existsSync(SCREENS_DIR)) return []
  return readdirSync(SCREENS_DIR).filter((name) => name.endsWith('.png'))
}

/**
 * Scratch ledger for one run, outside the repository.
 *
 * Each case appends its record the moment it is measured, so a worker that dies
 * mid-run (Playwright restarts workers on some internal errors) cannot silently
 * drop evidence: geometry.json is assembled from this file, not from module
 * state. It is cleared at setup and is never committed.
 */
export const RECORDS_FILE = join(os.tmpdir(), 'moonwitness-ui-visual-harness', 'records.jsonl')

export function resetRecords() {
  rmSync(RECORDS_FILE, { force: true })
}

export function appendRecord(kind, payload) {
  mkdirSync(dirname(RECORDS_FILE), { recursive: true })
  appendFileSync(RECORDS_FILE, `${JSON.stringify({ kind, ...payload })}\n`)
}

export function readRecords() {
  if (!existsSync(RECORDS_FILE)) return []
  return readFileSync(RECORDS_FILE, 'utf8')
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line))
}
