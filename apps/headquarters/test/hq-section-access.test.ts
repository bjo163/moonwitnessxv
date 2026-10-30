/**
 * M20-07 — every HQ admin section sits behind the one redirecting layout, and a
 * denied or failed section load never turns into an approval. The behavioral
 * anonymous/stale-cookie/viewer cases live in `hq-authz-guard.test.ts`; this
 * file pins the section matrix and the loader's fail-closed edges.
 */
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import type { ModelMeta } from '@moonwitness/moonql-client'
import { loadSourceRightsInventory } from '../src/lib/source-rights-inventory.js'
import type { ListResult } from '../src/data/queries/records.js'

const adminRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../src/app/(admin)')

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = join(directory, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

const files = walk(adminRoot)
const relativePath = (file: string): string => relative(adminRoot, file).split(sep).join('/')

void test('the admin section matrix is complete and every page shares one layout', () => {
  const pages = files.filter((file) => relativePath(file).endsWith('page.tsx')).map((file) => relativePath(file).replace(/\/?page\.tsx$/, '') || '.')
  assert.deepEqual(pages.sort(), [
    '.',
    'decisions',
    'models',
    'models/[model]',
    'models/[model]/[id]',
    'models/[model]/new',
    'shadow',
    'system',
    'views',
    'views/[view]',
    'world-monitor',
  ], 'a new HQ section must be added to this access matrix')

  const layouts = files.filter((file) => relativePath(file).endsWith('layout.tsx')).map(relativePath)
  assert.deepEqual(layouts, ['layout.tsx'], 'no section may carry its own layout that could bypass the session gate')
})

void test('the shared admin layout redirects before rendering a section', () => {
  const source = readFileSync(join(adminRoot, 'layout.tsx'), 'utf8')
  assert.match(source, /const user = await me\(\)/, 'the layout asks the hub for the session')
  assert.match(source, /if \(!user\)\s*redirect\('\/login\?error=expired'\)/, 'a missing session redirects to login instead of rendering')
  assert.ok(source.indexOf('redirect(') < source.indexOf('<VerticalLayout'), 'the redirect happens before any shell is rendered')
})

void test('a denied section load is not an approval and fetches nothing', async () => {
  const model = { operations: { list: true } } as unknown as ModelMeta
  const inventory = await loadSourceRightsInventory(
    model,
    async () => false,
    async () => {
      assert.fail('a denied list must not fetch rows')
    },
  )
  assert.deepEqual(inventory, { accessAllowed: false, sources: null })
})

void test('a section without a list operation stays closed and silent', async () => {
  const model = { operations: { list: false } } as unknown as ModelMeta
  let guardCalled = false
  const inventory = await loadSourceRightsInventory(
    model,
    async () => {
      guardCalled = true
      return true
    },
    async () => {
      assert.fail('a model without list must not fetch rows')
    },
  )
  assert.deepEqual(inventory, { accessAllowed: false, sources: null })
  assert.equal(guardCalled, false, 'no ACL is consulted when the operation does not exist')
})

void test('a failed load is not treated as empty or approved', async () => {
  const model = { operations: { list: true } } as unknown as ModelMeta
  const inventory = await loadSourceRightsInventory(
    model,
    async () => true,
    async () => {
      throw new Error('synthetic hub failure')
    },
  )
  assert.deepEqual(inventory, { accessAllowed: true, sources: null }, 'access was allowed but no rows exist: never an empty approval')

  const rows = { rows: [{ id: 'e1' }], total: 1, page: 1, pageSize: 25 } as ListResult
  const allowed = await loadSourceRightsInventory(model, async () => true, async () => rows)
  assert.equal(allowed.sources, rows)
})
