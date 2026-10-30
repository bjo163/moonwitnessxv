import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { REQUIREMENTS, SOURCE_SHA, validateBoundary } from '../../scripts/check-m51-01-d20-boundary.mjs'

// M51-01 — D20 ownership and source boundary.
// Positive: every canonical index states the same owner map and the same
// exclusions. Negative: an index that claims a third SQL owner, a second Hub
// or a public/customer ISP surface stops the check. Synthetic text only.

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const realText = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8')

const idsOf = (failures) => failures

test('D20 boundary is recorded identically in every canonical index', () => {
  const result = validateBoundary(realText)
  assert.deepEqual(result.failures, [])
  assert.equal(result.checked, REQUIREMENTS.length)
  assert.ok(result.needles >= 40, `expected at least 40 phrases, saw ${result.needles}`)
})

test('boundary checker runs from the repository and reports the pinned source', () => {
  const result = spawnSync(process.execPath, ['scripts/check-m51-01-d20-boundary.mjs'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /D20 boundary contract valid/)
})

test('a canonical index that claims a third SQL owner fails the check', () => {
  const read = (relative) => realText(relative).replace(
    'D20 adds no SQL owner, second Hub, second login, public ISP surface or duplicate customer/invoice/payment data.',
    'D20 adds its own SQL owner, a second Hub and a public ISP surface.',
  )
  const { failures } = validateBoundary(read)
  assert.deepEqual(idsOf(failures), ['BLUEPRINT.md: BP_EXCLUSIONS boundary phrase absent'])
})

test('dropping the ADR no-third-SQL-owner and no-second-Hub sentence fails the check', () => {
  const read = (relative) => realText(relative).replace(
    'D20 is not a third SQL owner or a second Hub.',
    'D20 owns its own database and control plane.',
  )
  const { failures } = validateBoundary(read)
  assert.deepEqual(idsOf(failures), ['docs/decisions/ADR-0018-isp-network-operations.md: ADR_NO_THIRD_SQL_OWNER boundary phrase absent'])
})

test('an unapproved public customer portal claim fails the check', () => {
  const read = (relative) => realText(relative).replace(
    'it has no browser-to-database path and no public Dock route',
    'it has a browser-to-database path and a public customer portal on Dock',
  )
  const { failures } = validateBoundary(read)
  assert.deepEqual(idsOf(failures), ['MASTER_DESIGN.md: MD_NO_DOCK_ROUTE boundary phrase absent'])
})

test('a missing canonical index is reported as a boundary failure', () => {
  const read = (relative) => (relative === 'docs/planning/DOMAIN_COVERAGE.md' ? (() => { throw new Error('missing') })() : realText(relative))
  const { failures } = validateBoundary(read)
  assert.deepEqual(failures, ['docs/planning/DOMAIN_COVERAGE.md: missing (domain coverage register)'])
})

test('the source baseline stays pinned and the dirty source worktree stays excluded', () => {
  const adr = realText('docs/decisions/ADR-0018-isp-network-operations.md')
  const matrix = realText('docs/research/mwx-isp-into-xv-migration-matrix.md')
  assert.match(adr, new RegExp(SOURCE_SHA))
  assert.match(matrix, new RegExp(SOURCE_SHA))
  assert.match(adr, /they are excluded from this decision and any initial port/)
  assert.match(matrix, /this matrix does not include them/)
  for (const relative of ['docs/decisions/ADR-0018-isp-network-operations.md', 'docs/research/mwx-isp-into-xv-migration-matrix.md']) {
    // TR-F025 may only be named as absent; it never becomes a mapped feature row.
    assert.doesNotMatch(realText(relative), /^\|\s*TR-F025\b/m, `${relative} must not invent a TR-F025 feature row`)
  }
})
