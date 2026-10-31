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
  for (const group of ['apps', 'packages', 'tools']) {
    const base = join(repoRoot, group)
    if (!existsSync(base)) continue
    for (const entry of readdirSync(base)) {
      if (existsSync(join(base, entry, 'package.json'))) members.push(join(base, entry))
    }
  }
  return members
}

test('every workspace import is declared as a runtime dependency', () => {
  const members = workspaceMembers()
  const dirByName = new Map<string, string>()
  for (const dir of members) {
    dirByName.set((JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as { name: string }).name, dir)
  }

  const offenders: string[] = []
  for (const dir of members) {
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    // name -> the subpaths used against it ('' means the package root)
    const used = new Map<string, Set<string>>()
    for (const file of sourceFiles(join(dir, 'src'))) {
      // a closing quote after the name alone used to hide every subpath import:
      // `@moonwitness/moonui/client` slipped through the contract entirely
      for (const match of readFileSync(file, 'utf8').matchAll(/['"]@moonwitness\/([a-z0-9-]+)((?:\/[^'"]*)?)['"]/g)) {
        const name = `@moonwitness/${match[1]}`
        if (!used.has(name)) used.set(name, new Set())
        used.get(name)!.add(match[2] ?? '')
      }
    }
    for (const [name, subs] of used) {
      if (!pkg.dependencies?.[name]) {
        const where = pkg.devDependencies?.[name] ? 'devDependencies only' : 'not declared'
        offenders.push(`${relative(repoRoot, dir)} imports ${name} at runtime but has ${where}`)
        continue
      }
      // A subpath is a promise the depended package must make in its exports map.
      // Without one, deep imports resolve by accident and silently become API.
      const target = dirByName.get(name)
      if (!target) {
        offenders.push(`${relative(repoRoot, dir)} imports ${name}, which is not a workspace member`)
        continue
      }
      const exports = (JSON.parse(readFileSync(join(target, 'package.json'), 'utf8')) as { exports?: Record<string, unknown> }).exports
      for (const sub of subs) {
        if (!sub) continue
        if (!exports) {
          offenders.push(`${relative(repoRoot, dir)} imports ${name}${sub} but ${name} declares no exports map`)
        } else if (!(('.' + sub) in exports)) {
          offenders.push(`${relative(repoRoot, dir)} imports ${name}${sub} but ${name} does not export ".${sub}"`)
        }
      }
    }
  }
  assert.deepEqual(offenders, [], offenders.join('\n'))
})
