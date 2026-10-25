import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Workspace dependency contract.
 *
 * `@moonwitness/denpa` used to list `@moonwitness/core` as a devDependency while
 * its built `dist/plugin.js` imported it at runtime. Locally that is invisible
 * (pnpm links dev deps too); the production image — installed with `--prod` —
 * crashed on boot with ERR_MODULE_NOT_FOUND. This test keeps that class of bug
 * out of every workspace package.
 */

const repoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))))

function sourceFiles(dir: string): string[] {
  const out: string[] = []
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...sourceFiles(full))
    else if (/\.(ts|tsx|mjs)$/.test(entry.name)) out.push(full)
  }
  return out
}

function workspaceMembers(): string[] {
  const members: string[] = []
  for (const group of ['apps', 'packages']) {
    const base = join(repoRoot, group)
    if (!existsSync(base)) continue
    for (const entry of readdirSync(base)) {
      if (existsSync(join(base, entry, 'package.json'))) members.push(join(base, entry))
    }
  }
  return members
}

test('every workspace import is declared as a runtime dependency', () => {
  const offenders: string[] = []
  for (const dir of workspaceMembers()) {
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    const used = new Set<string>()
    for (const file of sourceFiles(join(dir, 'src'))) {
      for (const match of readFileSync(file, 'utf8').matchAll(/['"]@moonwitness\/([a-z0-9-]+)['"]/g)) {
        used.add(`@moonwitness/${match[1]}`)
      }
    }
    for (const name of used) {
      if (pkg.dependencies?.[name]) continue
      const where = pkg.devDependencies?.[name] ? 'devDependencies only' : 'not declared'
      offenders.push(`${relative(repoRoot, dir)} imports ${name} at runtime but has ${where}`)
    }
  }
  assert.deepEqual(offenders, [], offenders.join('\n'))
})
