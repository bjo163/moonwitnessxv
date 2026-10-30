import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const checker = path.join(root, 'scripts/check-isp-migration-matrix.mjs')
const matrix = path.join(root, 'docs/research/mwx-isp-into-xv-migration-matrix.md')

test('MWX-ISP matrix covers each accepted source feature exactly once', () => {
  const result = spawnSync(process.execPath, [checker], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /32 feature IDs/)
  assert.match(result.stdout, /ab8a512b468c4a9b979418f8b05720a58651ebfe/)
})

test('matrix rejects a duplicate feature row and a fabricated source feature', async () => {
  const source = await readFile(matrix, 'utf8')
  const temp = await mkdtemp(path.join(tmpdir(), 'isp-matrix-'))
  try {
    const duplicate = `${source}\n| TR-F001 duplicate | D20 | invalid fixture |\n`
    const duplicatePath = path.join(temp, 'duplicate.md')
    await writeFile(duplicatePath, duplicate, 'utf8')
    const duplicateResult = spawnSync(process.execPath, [checker, '--input', duplicatePath], { encoding: 'utf8' })
    assert.equal(duplicateResult.status, 1)
    assert.match(duplicateResult.stderr, /duplicate feature ID TR-F001/)

    const invented = `${source}\n| TR-F025 invented | D20 | invalid fixture |\n`
    const inventedPath = path.join(temp, 'invented.md')
    await writeFile(inventedPath, invented, 'utf8')
    const inventedResult = spawnSync(process.execPath, [checker, '--input', inventedPath], { encoding: 'utf8' })
    assert.equal(inventedResult.status, 1)
    assert.match(inventedResult.stderr, /unexpected source feature ID TR-F025/)
  } finally {
    await rm(temp, { recursive: true, force: true })
  }
})
