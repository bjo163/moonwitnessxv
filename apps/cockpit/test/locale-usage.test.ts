import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCockpitCopy } from '../client/lib/cockpit-copy.js'

/**
 * Catalog usage guard.
 *
 * `locale.test.ts` proves the two catalogs agree with each other; it cannot see
 * whether anything *renders* a key. A localized string that no component reads
 * is dead weight that silently reverts the UI to hardcoded English — exactly the
 * defect that shipped a half-translated progress panel.
 */

const CLIENT_DIR = fileURLToPath(new URL('../client', import.meta.url))
const CATALOG_FILE = join(CLIENT_DIR, 'lib', 'cockpit-copy.ts')

/** Keys that are legitimately not referenced from a component (none today). */
const ALLOW_UNUSED = new Set<string>([])

/**
 * Only the surfaces this guard was introduced for are enforced. The catalog also
 * carries ~40 keys belonging to other cockpit tabs that nothing renders yet;
 * that is pre-existing debt and fixing it is not part of this change, but hiding
 * it inside this guard would be.
 */
const EXTRA_ENFORCED = new Set<string>([
  'colTask',
  'colDeliverable',
  'colMilestone',
  'colGroup',
  'colDone',
  'colOpen',
  'colTotal',
  'colProgress',
  'groupFoundation',
  'groupSource',
  'groupResearch',
  'groupWitness',
  'groupOperations',
  'groupOptionalResearch',
  'groupRelease',
  'groupEcosystem',
])

function isEnforced(key: string): boolean {
  return (
    key.startsWith('progress') ||
    key.startsWith('provenance') ||
    key.startsWith('time') ||
    EXTRA_ENFORCED.has(key)
  )
}

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue
      sourceFiles(full, out)
    } else if (/\.(ts|tsx)$/.test(entry.name) && full !== CATALOG_FILE) {
      out.push(full)
    }
  }
  return out
}

void test('Cockpit Locale Catalog: every key is actually rendered somewhere', () => {
  const sources = sourceFiles(CLIENT_DIR)
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n')
  const catalog = getCockpitCopy('en') as unknown as Record<string, string>

  const unused = Object.keys(catalog).filter(
    (key) => isEnforced(key) && !ALLOW_UNUSED.has(key) && !new RegExp(`\\b${key}\\b`).test(sources),
  )

  assert.deepEqual(unused, [], `catalog keys nothing renders (dead or untranslated UI): ${unused.join(', ')}`)
})

void test('Cockpit Locale Catalog: the progress panel does not hardcode English copy', () => {
  const view = readFileSync(join(CLIENT_DIR, 'components', 'CockpitProgressView.tsx'), 'utf8')
  // Literals that used to live in the view; each must now come from the catalog.
  for (const literal of ['READ-ONLY PROJECTION', 'Milestone groups', 'Live checkbox activity', 'Provenance']) {
    assert.equal(view.includes(literal), false, `hardcoded copy must move to the catalog: "${literal}"`)
  }
})
