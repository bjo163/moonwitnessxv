#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * M46-15 — package ownership and dependency-boundary inventory.
 *
 * A second hand-maintained owner registry is exactly how this repository
 * already got stale status tables, so this inventory is DERIVED: every
 * workspace comes from its own package.json, and every owner/boundary link
 * comes from the first authoritative document that states an ownership
 * relation about that workspace. A workspace no document claims is recorded as
 * UNKNOWN rather than guessed, because an invented owner is worse than an
 * absent one.
 *
 * Read-only: no manifest is modified, no dependency direction is asserted
 * beyond what the cited document states, and nothing here promotes a package
 * to a new owner.
 */

const ROOT = process.argv[2] ?? process.cwd()

const DOC_PRECEDENCE = [
  ['docs/architecture', 'architecture contract'],
  ['docs/decisions', 'accepted ADR'],
  ['docs/planning', 'planning contract'],
  ['.', 'root authority'],
]

const BOUNDARY_DOCS = [
  'BLUEPRINT.md',
  'MASTER_DESIGN.md',
  'AGENTS.md',
  'README.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
]

const listMarkdown = (root, dir) => {
  const full = join(root, dir)
  if (!existsSync(full)) return []
  return readdirSync(full)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => `${dir}/${f}`)
}

const docSet = (root) => {
  const docs = []
  for (const [dir, kind] of DOC_PRECEDENCE) {
    if (dir === '.') {
      for (const f of BOUNDARY_DOCS) if (existsSync(join(root, f))) docs.push({ path: f, kind })
      continue
    }
    for (const p of listMarkdown(root, dir)) docs.push({ path: p, kind: DOC_PRECEDENCE.find(([d]) => d === dir)[1] })
  }
  return docs
}

const workspaces = (root) => {
  const found = []
  for (const group of ['packages', 'apps', 'tools']) {
    const base = join(root, group)
    if (!existsSync(base)) continue
    for (const dir of readdirSync(base).sort()) {
      const manifest = join(base, dir, 'package.json')
      if (!existsSync(manifest)) continue
      let parsed
      try {
        parsed = JSON.parse(readFileSync(manifest, 'utf8'))
      } catch {
        parsed = {}
      }
      const deps = { ...(parsed.dependencies ?? {}), ...(parsed.devDependencies ?? {}) }
      found.push({
        dir: `${group}/${dir}`,
        name: typeof parsed.name === 'string' ? parsed.name : null,
        dependsOn: Object.keys(deps).sort(),
      })
    }
  }
  return found
}

/**
 * A document only claims a workspace when the line that names it also speaks of
 * an ownership relation. A passing mention is not a boundary, and recording one
 * as a boundary would be exactly the invented owner this script avoids. Domain
 * identifiers (`D11`) count because the domain table is how this repository
 * assigns a package to a boundary.
 */
const OWNERSHIP_LANGUAGE = /\bowner\b|\bowns\b|\bownership\b|\bboundar|\bdomain\b|\bresponsib|\bsole writes\b|\bsteps on\b|\bd\d{2}\b/i

const claimFor = (ws, docs, cache, root) => {
  const tokens = [ws.dir.split('/')[1], ws.name].filter(Boolean)
  for (const doc of docs) {
    const text = cache.get(doc.path) ?? readFileSync(join(root, doc.path), 'utf8')
    cache.set(doc.path, text)
    const owns = text.split('\n').some((line) => tokens.some((token) => line.includes(token)) && OWNERSHIP_LANGUAGE.test(line))
    if (owns) return doc
  }
  return null
}

export function buildInventory(root = ROOT) {
  const docs = docSet(root)
  const cache = new Map()
  const found = workspaces(root)
  const byName = new Map(found.map((ws) => [ws.name, ws.dir]))
  const rows = []
  for (const ws of found) {
    const claim = claimFor(ws, docs, cache, root)
    rows.push({
      workspace: ws.dir,
      package: ws.name ?? 'UNKNOWN',
      ownerBoundary: claim ? claim.path : 'UNKNOWN',
      boundaryKind: claim ? claim.kind : 'UNDOCUMENTED',
      // the observed dependency direction: which other workspaces this manifest
      // imports. Reported as facts, not as permission — a boundary document, not
      // this table, is what says whether an edge is allowed.
      dependsOnWorkspaces: ws.dependsOn.filter((dep) => byName.has(dep)).map((dep) => byName.get(dep)),
      externalDependencies: ws.dependsOn.filter((dep) => !byName.has(dep)).length,
    })
  }
  return rows
}

/** the same rows as a readable table, plus the undocumented exceptions */
export function renderTable(rows) {
  const lines = [
    '# M46-15 package ownership inventory',
    '',
    'Derived by `scripts/check-m46-15-package-ownership.mjs` from each workspace manifest and the first',
    'authoritative document that states an ownership relation about it. Not a second owner registry:',
    'the linked document stays the authority, and `UNKNOWN` is reported instead of a guess.',
    '',
    '| workspace | package | owner / boundary document | dependency direction (internal workspaces) |',
    '| --- | --- | --- | --- |',
  ]
  for (const row of rows) {
    const boundary = row.ownerBoundary === 'UNKNOWN' ? 'UNKNOWN' : `\`${row.ownerBoundary}\` · ${row.boundaryKind}`
    lines.push(`| ${row.workspace} | ${row.package} | ${boundary} | ${row.dependsOnWorkspaces.join(', ') || '—'} |`)
  }
  const unknown = rows.filter((r) => r.ownerBoundary === 'UNKNOWN')
  lines.push('', '## Exceptions: workspaces with no documented owner', '')
  if (unknown.length === 0) lines.push('None.')
  for (const row of unknown) lines.push(`- \`${row.workspace}\` (\`${row.package}\`) — no authoritative document states an ownership relation for it.`)
  return lines.join('\n') + '\n'
}

/**
 * Invariants the acceptance asks for: every package carries a boundary link or
 * an explicit UNKNOWN, no package name is claimed by two workspaces (which
 * would imply two canonical owners for one artifact), and a cited link is a
 * file that exists.
 */
export function audit(rows, root = ROOT) {
  const failures = []
  const byName = new Map()
  for (const row of rows) {
    if (!row.ownerBoundary) failures.push(`${row.workspace}: empty boundary field`)
    if (row.ownerBoundary !== 'UNKNOWN' && !existsSync(join(root, row.ownerBoundary))) {
      failures.push(`${row.workspace}: boundary link does not resolve: ${row.ownerBoundary}`)
    }
    if (row.package === 'UNKNOWN') failures.push(`${row.workspace}: manifest has no name`)
    byName.set(row.package, [...(byName.get(row.package) ?? []), row.workspace])
  }
  for (const [name, owners] of byName) {
    if (name !== 'UNKNOWN' && owners.length > 1) failures.push(`duplicate canonical owner implied: ${name} in ${owners.join(', ')}`)
  }
  return failures
}

const OUT_JSON = 'docs/data/M46-15-package-ownership.json'
const OUT_MD = 'docs/data/M46-15-package-ownership.md'
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/\\/).pop())
if (isMain) {
  const rows = buildInventory(ROOT)
  const failures = audit(rows)
  const unknown = rows.filter((r) => r.ownerBoundary === 'UNKNOWN')
  writeFileSync(
    join(ROOT, OUT_JSON),
    JSON.stringify({ kind: 'm46-15-package-ownership', derived: true, source: 'workspace manifests + authoritative docs', rows }, null, 2) + '\n',
    'utf8',
  )
  writeFileSync(join(ROOT, OUT_MD), renderTable(rows), 'utf8')
  console.log(`workspaces: ${rows.length} | documented: ${rows.length - unknown.length} | UNKNOWN: ${unknown.length}`)
  for (const r of unknown) console.log(`  UNKNOWN owner/boundary: ${r.workspace} (${r.package})`)
  for (const f of failures) console.log(`  FAIL ${f}`)
  process.exit(failures.length === 0 ? 0 : 1)
}
