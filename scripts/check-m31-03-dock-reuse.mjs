#!/usr/bin/env node
// M31-03 — structural evidence that LIGHTHOUSE reuses the Dock application.
// Verifies the accepted ADR-0011 decision against the repository: one public
// web app, no lighthouse workspace, no private-surface reference in Dock src.
// Run from the repository root: node scripts/check-m31-03-dock-reuse.mjs
// Negative fixtures: --self-test

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = process.cwd()
const failures = []
const pass = []

function read(path) {
  return readFileSync(join(ROOT, path), 'utf8')
}

function walk(dir, predicate, out = []) {
  const absolute = join(ROOT, dir)
  if (!existsSync(absolute)) return out
  for (const entry of readdirSync(absolute)) {
    const child = join(absolute, entry)
    if (statSync(child).isDirectory()) walk(relative(ROOT, child), predicate, out)
    else if (predicate(entry)) out.push(relative(ROOT, child).split(sep).join('/'))
  }
  return out
}

function parseComposeServices(text) {
  const start = text.indexOf('\nservices:')
  const end = text.indexOf('\nvolumes:')
  if (start === -1) return []
  const body = text.slice(start, end === -1 ? text.length : end)
  const names = []
  for (const line of body.split('\n')) {
    const match = /^ {2}([a-z][a-z0-9-]*):\s*$/.exec(line)
    if (match) names.push(match[1])
  }
  return names
}

function parseComposeBlock(text, service) {
  const marker = `\n  ${service}:`
  const start = text.indexOf(marker)
  if (start === -1) return ''
  const rest = text.slice(start + 1)
  const next = /\n {2}[a-z][a-z0-9-]*:\s*\n/.exec(rest.slice(1))
  return next ? rest.slice(0, next.index + 1) : rest
}

function parseNavHrefs(text) {
  const start = text.indexOf('NAV_LINKS')
  if (start === -1) return []
  const end = text.indexOf('as const', start)
  const body = text.slice(start, end === -1 ? text.length : end)
  return [...body.matchAll(/\{ href: '([^']+)'/g)].map((m) => m[1])
}

function collect() {
  const appDirs = existsSync(join(ROOT, 'apps'))
    ? readdirSync(join(ROOT, 'apps')).filter((name) => statSync(join(ROOT, 'apps', name)).isDirectory())
    : []

  const appPackages = appDirs.map((name) => {
    const manifest = join(ROOT, 'apps', name, 'package.json')
    if (!existsSync(manifest)) return { dir: name, name: '' }
    try {
      return { dir: name, name: JSON.parse(readFileSync(manifest, 'utf8')).name ?? '' }
    } catch {
      return { dir: name, name: '' }
    }
  })

  const pages = walk('apps/dock/src/app', (file) => file === 'page.tsx')
  const shell = existsSync(join(ROOT, 'apps/dock/src/ui/components/shell.tsx'))
    ? read('apps/dock/src/ui/components/shell.tsx')
    : ''
  const middleware = existsSync(join(ROOT, 'apps/dock/src/middleware.ts'))
    ? read('apps/dock/src/middleware.ts')
    : ''
  const coreLocale = existsSync(join(ROOT, 'packages/core/src/locale.ts'))
    ? read('packages/core/src/locale.ts')
    : ''
  const compose = existsSync(join(ROOT, 'docker-compose.yml')) ? read('docker-compose.yml') : ''
  const srcFiles = walk('apps/dock/src', (file) => /\.(ts|tsx|mjs)$/.test(file))
  const privateReferences = []
  const boundary = /\b(headquarters|cockpit|arsy|skylink|echolog)\b|\/admin\b/i
  for (const file of srcFiles) {
    const lines = read(file).split('\n')
    lines.forEach((line, index) => {
      if (boundary.test(line)) privateReferences.push(`${file}:${index + 1}: ${line.trim()}`)
    })
  }

  const dockManifest = existsSync(join(ROOT, 'apps/dock/package.json'))
    ? JSON.parse(read('apps/dock/package.json'))
    : {}

  return {
    workspace: existsSync(join(ROOT, 'pnpm-workspace.yaml')) ? read('pnpm-workspace.yaml') : '',
    appDirs,
    appPackages,
    dockPackageName: dockManifest.name ?? '',
    pages,
    navHrefs: parseNavHrefs(shell),
    middleware,
    coreLocale,
    composeServices: parseComposeServices(compose),
    dockComposeBlock: parseComposeBlock(compose, 'dock'),
    privateReferences,
    adr: existsSync(join(ROOT, 'docs/decisions/ADR-0011-lighthouse-dock-runtime.md'))
      ? read('docs/decisions/ADR-0011-lighthouse-dock-runtime.md')
      : '',
  }
}

const REQUIRED_ROUTES = [
  'apps/dock/src/app/page.tsx',
  'apps/dock/src/app/reader/page.tsx',
  'apps/dock/src/app/terms/page.tsx',
  'apps/dock/src/app/stations/page.tsx',
  'apps/dock/src/app/research/page.tsx',
]

const REQUIRED_NAV = ['/', '/reader', '/stations', '/terms']

function validate(facts) {
  const violations = []
  const check = (ok, message) => {
    if (!ok) violations.push(message)
  }

  check(/apps\/\*/.test(facts.workspace), 'pnpm-workspace.yaml no longer includes apps/*')
  check(facts.dockPackageName === '@moonwitness/dock', `Dock package is "${facts.dockPackageName}", expected "@moonwitness/dock"`)
  for (const route of REQUIRED_ROUTES) {
    check(facts.pages.includes(route), `reused Dock route missing: ${route}`)
  }
  check(!facts.appDirs.some((name) => /lighthouse/i.test(name)), 'a separate lighthouse application directory exists')
  check(
    !facts.appPackages.some((pkg) => /lighthouse/i.test(pkg.name) || /lighthouse/i.test(pkg.dir)),
    'a workspace package declares a lighthouse app',
  )
  check(facts.composeServices.includes('dock'), 'docker-compose.yml has no dock service')
  check(!facts.composeServices.some((name) => /lighthouse/i.test(name)), 'docker-compose.yml declares a lighthouse service')
  check(/Dockerfile\.web/.test(facts.dockComposeBlock), 'dock service does not build from Dockerfile.web')
  check(/APP:\s*dock\b/.test(facts.dockComposeBlock), 'dock service build arg APP is not dock')
  check(facts.privateReferences.length === 0, `Dock src references private surfaces: ${facts.privateReferences.slice(0, 3).join(' | ')}`)
  for (const href of REQUIRED_NAV) {
    check(facts.navHrefs.includes(href), `Dock navigation lost public link ${href}`)
  }
  check(/accept-language/i.test(facts.middleware), 'Dock middleware no longer negotiates Accept-Language')
  check(/\b(resolveLocale|isLocale)\b/.test(facts.middleware), 'Dock middleware no longer resolves locales through @moonwitness/core')
  check(
    /SUPPORTED_LOCALES\s*=\s*\[\s*'id'\s*,\s*'en'\s*\]/.test(facts.coreLocale),
    'shared locale authority no longer supports exactly id and en',
  )
  check(/Status:\s*ACCEPTED/.test(facts.adr), 'ADR-0011 is missing or not ACCEPTED')
  return violations
}

function report(label, violations) {
  if (violations.length === 0) {
    pass.push(`PASS ${label}`)
    return true
  }
  failures.push(`FAIL ${label}\n  - ${violations.join('\n  - ')}`)
  return false
}

function selfTest(base) {
  const fixtures = [
    ['workspace glob removed', { ...base, workspace: 'packages:\n  - packages/*\n' }],
    ['wrong dock package', { ...base, dockPackageName: '@moonwitness/web' }],
    ['reader route removed', { ...base, pages: base.pages.filter((p) => !p.endsWith('/reader/page.tsx')) }],
    ['lighthouse app directory', { ...base, appDirs: [...base.appDirs, 'lighthouse'] }],
    ['lighthouse package', { ...base, appPackages: [...base.appPackages, { dir: 'gateway', name: '@moonwitness/lighthouse' }] }],
    ['dock service removed', { ...base, composeServices: base.composeServices.filter((s) => s !== 'dock') }],
    ['lighthouse compose service', { ...base, composeServices: [...base.composeServices, 'lighthouse'] }],
    ['dock built from wrong Dockerfile', { ...base, dockComposeBlock: 'build:\n  dockerfile: Dockerfile\n  args:\n    APP: dock\n' }],
    ['dock APP arg changed', { ...base, dockComposeBlock: 'build:\n  dockerfile: Dockerfile.web\n  args:\n    APP: headquarters\n' }],
    ['private surface reference', { ...base, privateReferences: ['apps/dock/src/x.ts:1: import y from "@moonwitness/headquarters"'] }],
    ['nav link removed', { ...base, navHrefs: base.navHrefs.filter((h) => h !== '/reader') }],
    ['accept-language negotiation removed', { ...base, middleware: 'export const middleware = () => null' }],
    ['core locale resolution removed', { ...base, middleware: "headers.get('accept-language')\n" }],
    ['locale en removed from shared authority', { ...base, coreLocale: "export const SUPPORTED_LOCALES = ['id'] as const" }],
    ['ADR missing', { ...base, adr: '' }],
  ]

  let rejected = 0
  for (const [label, facts] of fixtures) {
    const violations = validate(facts)
    if (violations.length > 0) {
      rejected += 1
      pass.push(`PASS self-test rejects: ${label}`)
    } else {
      failures.push(`FAIL self-test accepted invalid fixture: ${label}`)
    }
  }
  pass.push(`PASS self-test summary ${rejected}/${fixtures.length} invalid fixtures rejected`)
  return rejected === fixtures.length
}

function main() {
  const facts = collect()
  const ok = report(
    `Dock reuse evidence: pages=${facts.pages.length} apps=${facts.appDirs.length} services=${facts.composeServices.length}`,
    validate(facts),
  )
  if (process.argv.includes('--self-test')) {
    const selfOk = selfTest(facts)
    for (const line of pass) console.log(line)
    for (const line of failures) console.error(line)
    process.exit(ok && selfOk ? 0 : 1)
  }
  for (const line of pass) console.log(line)
  for (const line of failures) console.error(line)
  process.exit(ok ? 0 : 1)
}

main()
