/**
 * UI-F12 contract: a Dock link never decides a locale on its own.
 *
 * Middleware rewrites `/id/terms` to the bare route and forwards the locale in a
 * header, so a page rendered under `/id` that emits `href="/terms"` hands the
 * visitor a link back to their default language. Every internal destination must
 * therefore be built by `localizedDockHref` (directly or through the bound
 * `dockHrefFor`), and every view that can build such a link must be handed the
 * rendered locale by the page that renders it.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(appDir, 'src')

/** The two files allowed to originate a locale prefix: the helper and the edge router it pairs with. */
const HELPER_FILE = 'lib/locale-context.mjs'
const PREFIX_WRITERS = new Set([HELPER_FILE, 'middleware.ts'])

/**
 * Internal paths that may stay unprefixed, each with the reason it is not a locale
 * leak. Both directions are asserted: nothing may bypass unlisted, and a rule whose
 * lines are gone fails, so exceptions cannot quietly accumulate.
 */
const ALLOWED_BYPASSES = [
  {
    file: 'ui/components/shell.tsx',
    prefixes: ['/'],
    why: 'NAV_LINKS is the canonical route table; SiteHeader passes every entry through getLocalizedNavHref',
  },
  {
    file: 'data/queries/program.ts',
    prefixes: ['/stations/'],
    why: 'the data layer emits route paths and never names a locale; the view binds it',
  },
  {
    file: 'app/embed/[id]/page.tsx',
    prefixes: ['/stations/'],
    why: '/embed/* is locale-free by contract, so there is no locale to preserve',
  },
  {
    file: 'app/reader/compare/page.tsx',
    prefixes: ['/', '/reader'],
    why: 'route under a concurrent rewrite; carried as a follow-up in the UI-F12 evidence note',
  },
]

function sourceFiles(dir, prefix = '') {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) out.push(...sourceFiles(path.join(dir, entry.name), rel))
    else if (/\.(ts|tsx|mjs)$/.test(entry.name)) out.push(rel)
  }
  return out
}

/** Drops comment lines so a documented route example is never read as a rendered link. */
function codeOnly(source) {
  return source
    .split('\n')
    .filter((line) => !/^\s*(\/\/|\/\*|\*)/.test(line))
    .join('\n')
}

/** Every absolute destination the file asks the browser to navigate or submit to. */
function internalTargets(source) {
  const code = codeOnly(source)
  const patterns = [
    /\b(?:href|action)="([^"]+)"/g,
    /\b(?:href|action)=\{(`[^`]+`)\}/g,
    /\bhref:\s*(?:'([^']+)'|`([^`]+)`)/g,
  ]
  const targets = []
  for (const pattern of patterns) {
    for (const match of code.matchAll(pattern)) {
      const value = (match[1] ?? match[2] ?? '').replace(/^["'`]|\s*["'`]$/g, '')
      if (value.startsWith('/') && !value.startsWith('//')) targets.push(value)
    }
  }
  return targets
}

/** Reads an opening tag forward, honouring `{ }` nesting so multi-line props are captured. */
function openingTag(source, start) {
  let depth = 0
  for (let i = start; i < source.length; i += 1) {
    const char = source[i]
    if (char === '{') depth += 1
    else if (char === '}') depth -= 1
    else if (char === '>' && depth === 0) return source.slice(start, i + 1)
    else if (char === '<' && i > start) return null
  }
  return null
}

const files = sourceFiles(srcDir).filter((rel) => rel !== HELPER_FILE)
const byFile = new Map(files.map((rel) => [rel, fs.readFileSync(path.join(srcDir, rel), 'utf8')]))

const hits = []
for (const [rel, source] of byFile) {
  for (const target of internalTargets(source)) hits.push({ file: rel, target })
}

function coveredBy(hit) {
  return ALLOWED_BYPASSES.find(
    (rule) => rule.file === hit.file && rule.prefixes.some((prefix) => hit.target.startsWith(prefix)),
  )
}

test('no internal Dock link decides its own locale', () => {
  const unjustified = hits.filter((hit) => !coveredBy(hit))
  assert.deepEqual(
    unjustified.map((hit) => `${hit.file} -> ${hit.target}`),
    [],
    'internal links must go through localizedDockHref/dockHrefFor, or be recorded with a reason',
  )
})

test('every recorded locale-bypass exception is still doing work', () => {
  for (const rule of ALLOWED_BYPASSES) {
    assert.ok(byFile.has(rule.file), `stale exception: ${rule.file} no longer exists`)
    const covered = hits.filter((hit) => coveredBy(hit) === rule)
    assert.ok(covered.length > 0, `stale exception: nothing in ${rule.file} needs "${rule.prefixes.join(', ')}"`)
  }
})

test('only the locale helper can write a language prefix', () => {
  for (const [rel, source] of byFile) {
    if (PREFIX_WRITERS.has(rel)) continue
    const code = codeOnly(source)
    assert.doesNotMatch(
      code,
      /['"`]\/(?:id|en)(?:\/|['"`])/,
      `${rel} hardcodes a locale segment; localizedDockHref is the only writer`,
    )
    assert.doesNotMatch(
      code,
      /\/\$\{(?:locale|initialLocale|resolvedLocale)\}/,
      `${rel} interpolates a locale into a path instead of calling the helper`,
    )
  }
})

test('a view that binds locale receives it from its caller', () => {
  const localeBound = new Set()
  for (const [rel, source] of byFile) {
    if (!rel.startsWith('ui/')) continue
    for (const match of source.matchAll(/function ([A-Z][A-Za-z]*)\(\{([^}]*)\}/g)) {
      if (/locale\s*=\s*'en'/.test(match[2])) localeBound.add(match[1])
    }
  }

  const offenders = []
  for (const [rel, source] of byFile) {
    for (const name of localeBound) {
      for (const match of source.matchAll(new RegExp(`<${name}\\b`, 'g'))) {
        const tag = openingTag(source, match.index)
        if (tag && !/\blocale=\{/.test(tag)) offenders.push(`${rel} -> <${name}> without locale`)
      }
    }
  }
  assert.deepEqual(offenders, [], 'a page that forgets locale leaves its view on the English default')
})

test('a locale-bound view imports the locale module', () => {
  for (const [rel, source] of byFile) {
    if (!rel.startsWith('ui/') || !source.includes('localeHref(')) continue
    assert.match(source, /from '@\/lib\/locale-context\.mjs'/, `${rel} builds locale links without the locale module`)
  }
})
