import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * The lint gate is only a gate if the escape hatches are counted. `eslint-disable`
 * is legitimate at a real seam (drizzle generics, a runtime-chosen model) and
 * illegitimate as a way to make a new rule pass, so the number is pinned here:
 * adding one costs a bump of this budget, which is a reviewable line in the diff.
 *
 * The budget only ratchets down. M4 deletes `crud.ts` and the duplicate log/json
 * helpers; the count should follow.
 */

const BUDGET = 14

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))

/** every hand-written source file the lint gate covers */
function sourceFiles(): string[] {
  const out: string[] = []
  for (const group of ['apps', 'packages']) {
    const base = join(ROOT, group)
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === 'node_modules') continue
      const src = join(base, entry.name, 'src')
      let files: Array<string | Buffer>
      try {
        files = readdirSync(src, { recursive: true })
      } catch {
        continue // package has no src (pure config)
      }
      for (const file of files) {
        const path = String(file)
        if (!/\.tsx?$/.test(path) || path.startsWith('dist')) continue
        out.push(join(src, path))
      }
    }
  }
  return out
}

test('lint: eslint-disable tidak bertambah tanpa keputusan', () => {
  const offenders: Array<{ file: string; count: number }> = []
  let total = 0
  for (const file of sourceFiles()) {
    const count = readFileSync(file, 'utf8').split('\n').filter((line) => line.includes('eslint-disable')).length
    if (count === 0) continue
    total += count
    offenders.push({ file: file.slice(ROOT.length).replace(/\\/g, '/'), count })
  }

  const detail = offenders.map((o) => `${o.count} ${o.file}`).join('\n')
  assert.ok(
    total <= BUDGET,
    `eslint-disable budget is ${BUDGET}, found ${total} — fix the violation or raise the budget on purpose:\n${detail}`,
  )
})

test('lint: gerbang ini benar-benar membaca sesuatu', () => {
  // a guard that scans an empty tree would pass forever
  const files = sourceFiles()
  assert.ok(files.length > 50, `only ${files.length} source files found — the walk is wrong`)
  assert.ok(files.some((f) => f.endsWith(join('packages', 'moonql', 'src', 'table.ts'))), 'moonql sources are in scope')
})
