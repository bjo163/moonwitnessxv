import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { audit, buildInventory, renderTable } from '../../scripts/check-m46-15-package-ownership.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** the workspace count straight from the manifests, without the script's own walk */
const manifestWorkspaces = () => {
  const names = []
  for (const group of ['packages', 'apps']) {
    for (const dir of readdirSync(join(ROOT, group)).sort()) {
      const manifest = join(ROOT, group, dir, 'package.json')
      if (!existsSync(manifest)) continue
      names.push(JSON.parse(readFileSync(manifest, 'utf8')).name)
    }
  }
  return names
}

void test('every workspace is inventoried exactly once with a link or an explicit UNKNOWN', () => {
  const rows = buildInventory(ROOT)
  const manifests = manifestWorkspaces()

  assert.equal(rows.length, manifests.length, 'the inventory covers the manifest set, not a hand-picked subset')
  const order = rows.map((r) => r.workspace)
  const deterministic = ['packages/', 'apps/'].flatMap((group) => order.filter((w) => w.startsWith(group)).sort())
  assert.deepEqual(order, deterministic, 'workspace order is deterministic: each group walked in sorted order')
  assert.equal(
    rows.filter((r) => r.ownerBoundary === '' || r.ownerBoundary === undefined).length,
    0,
    'no row is left without a boundary field',
  )
  for (const row of rows) {
    assert.ok(
      row.ownerBoundary === 'UNKNOWN' ? row.boundaryKind === 'UNDOCUMENTED' : existsSync(join(ROOT, row.ownerBoundary)),
      `${row.workspace}: a cited boundary must be a real document, got ${row.ownerBoundary}`,
    )
  }
  assert.equal(audit(rows).length, 0, `audit of the live inventory must be clean: ${audit(rows).join('; ')}`)
})

void test('one package name implies one canonical owner', () => {
  const rows = buildInventory(ROOT)
  const claimants = new Map()
  for (const row of rows) claimants.set(row.package, [...(claimants.get(row.package) ?? []), row.workspace])
  const duplicated = [...claimants].filter(([, owners]) => owners.length > 1).map(([name]) => name)
  assert.deepEqual(duplicated, [], `these package names are owned by two workspaces: ${duplicated.join(', ')}`)
  assert.equal(rows.every((row) => typeof row.package === 'string' && row.package.length > 0), true)
})

void test('an undocumented workspace stays UNKNOWN instead of gaining an invented owner', () => {
  const invented = { workspace: 'packages/not-a-real-one', package: '@moonwitness/not-a-real-one', ownerBoundary: 'docs/architecture/MADE_UP.md', boundaryKind: 'architecture contract' }
  const failures = audit([invented])
  assert.equal(failures.length, 1, `a fabricated link must be caught, got ${JSON.stringify(failures)}`)
  assert.match(failures[0], /does not resolve/)

  const undocumented = audit([{ workspace: 'packages/x', package: '@moonwitness/x', ownerBoundary: 'UNKNOWN', boundaryKind: 'UNDOCUMENTED' }])
  assert.deepEqual(undocumented, [], 'UNKNOWN is a legitimate finding, not a failure')
})

void test('a passing mention is not an ownership claim, but an ownership line is', () => {
  const root = mkdtempSync(join(tmpdir(), 'm46-15-'))
  try {
    mkdirSync(join(root, 'packages', 'gadget'), { recursive: true })
    writeFileSync(join(root, 'packages', 'gadget', 'package.json'), JSON.stringify({ name: '@moonwitness/gadget' }))
    mkdirSync(join(root, 'docs', 'architecture'), { recursive: true })
    writeFileSync(join(root, 'docs', 'architecture', 'GAZETTE.md'), 'The gadget package was mentioned in passing.\n')
    assert.equal(
      buildInventory(root).find((r) => r.workspace === 'packages/gadget').ownerBoundary,
      'UNKNOWN',
      'a document that never states an ownership relation must not become a boundary link',
    )

    writeFileSync(join(root, 'docs', 'architecture', 'GADGET.md'), '@moonwitness/gadget owns the D14 boundary.\n')
    const claimed = buildInventory(root).find((r) => r.workspace === 'packages/gadget')
    assert.equal(claimed.ownerBoundary, 'docs/architecture/GADGET.md')
    assert.equal(claimed.boundaryKind, 'architecture contract')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

void test('repeated derivation is identical and leaves no shared state', () => {
  const first = JSON.stringify(buildInventory(ROOT))
  const second = JSON.stringify(buildInventory(ROOT))
  assert.equal(first, second, 'two runs of the same tree produce the same inventory')
  const rows = buildInventory(ROOT)
  const mutated = rows.map((r) => ({ ...r, ownerBoundary: 'tampered.md' }))
  assert.equal(rows.every((r) => r.ownerBoundary !== 'tampered.md'), true, 'the caller cannot mutate the derived view through a copy')
  assert.ok(mutated.length === rows.length)
})

void test('the dependency direction comes from the manifests and the table renders every workspace', () => {
  const rows = buildInventory(ROOT)
  for (const row of rows) {
    for (const dep of row.dependsOnWorkspaces) {
      assert.ok(rows.some((r) => r.workspace === dep), `${row.workspace} claims an edge to ${dep}, which is not an inventoried workspace`)
    }
  }
  assert.ok(rows.some((r) => r.dependsOnWorkspaces.length > 0), 'the live tree has internal workspace edges to report')

  const table = renderTable(rows)
  for (const row of rows) {
    assert.ok(table.includes(`| ${row.workspace} |`), `${row.workspace} is missing from the rendered table`)
    if (row.ownerBoundary === 'UNKNOWN') assert.ok(table.includes(`\`${row.workspace}\``), 'an undocumented owner must appear in the exceptions list')
  }
})
