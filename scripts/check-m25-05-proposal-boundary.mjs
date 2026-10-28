#!/usr/bin/env node
/**
 * scripts/check-m25-05-proposal-boundary.mjs
 *
 * M25-05 gate: the Cosmos/Time explorer exists only as a proposal document, and
 * is not discoverable as a shipped Dock feature.
 *
 * What this proves:
 *   1. The design document still carries its PROPOSAL / NOT SHIPPED /
 *      NOT DISCOVERABLE markers and names its open prerequisites (P3, M25-01,
 *      M25-02, M25-04). The audit still pins baseline_sha `dfc6556`.
 *   2. The design document contains no instruction to add a live route, page,
 *      navigation entry, sitemap entry, metadata record, search record or
 *      component, and no cosmos/time route literal.
 *   3. apps/dock/src/app has no cosmos / astronomy / time route directory other
 *      than the pre-existing narrative `timeline` page.
 *   4. NAV_LINKS (apps/dock/src/ui/components/shell.tsx) has no cosmos /
 *      astronomy / time destination.
 *   5. DOCK_SITEMAP_ROUTES (apps/dock/src/app/sitemap.ts) has no cosmos /
 *      astronomy / time entry.
 *   6. apps/dock/src contains no cosmos / astronomy vocabulary.
 *
 * What this does not prove: that no other application or document mentions the
 * idea; that a future authorised implementation would be good or honest; or
 * that this document is secret. It is a tripwire against accidental shipping,
 * not an access control.
 *
 * Run:            node scripts/check-m25-05-proposal-boundary.mjs
 * Negative test:  node scripts/check-m25-05-proposal-boundary.mjs --self-test
 *
 * Exit 0 when clean, 1 on any violation. No third-party dependencies.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'

const DOC = 'docs/design/M25-05-cosmos-time-explorer-sketch.md'
const AUDIT = 'docs/audit/M25-05-cosmos-explorer-proposal.md'
const APP_DIR = 'apps/dock/src/app'
const APP_SRC = 'apps/dock/src'
const SHELL = 'apps/dock/src/ui/components/shell.tsx'
const SITEMAP = 'apps/dock/src/app/sitemap.ts'

const DOC_MARKERS = [
  'PROPOSAL STATUS: PROPOSAL',
  'NOT SHIPPED',
  'NOT DISCOVERABLE',
  'P3',
  'M25-01',
  'M25-02',
  'M25-04',
]

const AUDIT_MARKERS = ['baseline_sha', 'dfc6556', 'PROPOSAL', 'P3', 'M25-02', 'M25-04', 'Rollback']

// A route segment is forbidden when it names the proposed explorer or an
// astronomy/time surface. `timeline` is the pre-existing narrative page and is
// deliberately allowed; a bare `time` segment is not.
const SEGMENT_PATTERN = /cosmos|cosmic|astronom|astro|observator|explorer|celestial|sidereal|ephemeris/
const FORBIDDEN_SEGMENTS = new Set(['time', 'times'])

// Doc-level instruction heuristic: an action verb aimed at a shipping surface.
const ACTION = /\b(add|create|register|mount|ship|publish|expose|wire|implement|introduce|build|launch)\b/i
const TARGET = /\b(route|page|nav|navigation|sitemap|metadata|search|component)\b/i
const NEGATION = /\b(no|not|never|cannot|can't|must not|does not|do not|without|nor|none|neither|zero|absent|avoid|forbid|forbids|prohibit|prohibits|non-)\b/i

// Slash-prefixed route literals the proposal must never name.
const ROUTE_LITERAL =
  /(^|[\s`(])\/(cosmos|cosmic|time|astronomy|astro|explorer|observatory|celestial|sidereal)(?=[\s)`.,;:!?]|$)/im

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.mjs', '.js', '.jsx', '.css', '.json'])
const SOURCE_PATTERN = /cosmos|cosmic|astronom|ephemeris|celestial|sidereal/i

function walkFiles(root) {
  const files = []
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) visit(path)
      else if (entry.isFile()) files.push(path)
    }
  }
  visit(root)
  return files
}

function normalize(path) {
  return path.split(sep).join('/')
}

function appRoutePaths() {
  if (!existsSync(APP_DIR)) return []
  return walkFiles(APP_DIR).map((path) => normalize(relative(APP_DIR, path)))
}

function appSourceFiles() {
  if (!existsSync(APP_SRC)) return []
  return walkFiles(APP_SRC)
    .filter((path) => SOURCE_EXTENSIONS.has(extname(path).toLowerCase()))
    .map((path) => ({ path: normalize(path), text: readFileSync(path, 'utf8') }))
}

function loadBaseline() {
  const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : null)
  return {
    docText: read(DOC),
    auditText: read(AUDIT),
    navText: read(SHELL),
    sitemapText: read(SITEMAP),
    appPaths: appRoutePaths(),
    sourceFiles: appSourceFiles(),
  }
}

function extractNavArray(text) {
  if (typeof text !== 'string') return null
  const match = /export const NAV_LINKS[^=]*=\s*\[([\s\S]*?)\]\s*as const/.exec(text)
  return match ? match[1] : null
}

function extractSitemapArray(text) {
  if (typeof text !== 'string') return null
  const match = /DOCK_SITEMAP_ROUTES\s*=\s*\[([\s\S]*?)\]\s*as const/.exec(text)
  return match ? match[1] : null
}

function quotedValues(block) {
  return [...block.matchAll(/'([^']*)'/g)].map((match) => match[1])
}

function isForbiddenSegment(segment) {
  const value = String(segment).trim().toLowerCase()
  if (value === '') return false
  if (FORBIDDEN_SEGMENTS.has(value)) return true
  return SEGMENT_PATTERN.test(value)
}

function forbiddenHref(href) {
  const path = String(href).split('#')[0]
  return path.split('/').filter(Boolean).some(isForbiddenSegment)
}

function forbiddenLabel(label) {
  const value = String(label).trim().toLowerCase()
  if (value === '') return false
  if (FORBIDDEN_SEGMENTS.has(value)) return true
  if (SEGMENT_PATTERN.test(value)) return true
  return value.split(/[^a-z0-9]+/).some((part) => FORBIDDEN_SEGMENTS.has(part))
}

function sentences(text) {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?;])\s+/))
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function validate(input) {
  const errors = []
  const fail = (message) => errors.push(message)
  const { docText, auditText, navText, sitemapText, appPaths = [], sourceFiles = [] } = input

  if (typeof docText !== 'string' || docText.trim() === '') {
    fail(`design document ${DOC} is missing or empty`)
  }
  if (typeof auditText !== 'string' || auditText.trim() === '') {
    fail(`audit ${AUDIT} is missing or empty`)
  }

  if (typeof docText === 'string') {
    for (const marker of DOC_MARKERS) {
      if (!docText.includes(marker)) fail(`design document lost marker ${JSON.stringify(marker)}`)
    }

    for (const sentence of sentences(docText)) {
      if (ACTION.test(sentence) && TARGET.test(sentence) && !NEGATION.test(sentence)) {
        fail(`design document reads as an implementation instruction: ${JSON.stringify(sentence.slice(0, 160))}`)
      }
    }

    const literal = ROUTE_LITERAL.exec(docText)
    if (literal) fail(`design document names a cosmos/time route literal ${JSON.stringify(literal[0].trim())}`)
  }

  if (typeof auditText === 'string') {
    for (const marker of AUDIT_MARKERS) {
      if (!auditText.includes(marker)) fail(`audit lost marker ${JSON.stringify(marker)}`)
    }
  }

  for (const path of appPaths) {
    const segments = normalize(path).split('/').filter(Boolean)
    const hit = segments.find(isForbiddenSegment)
    if (hit) fail(`shipped Dock route path ${JSON.stringify(path)} contains forbidden segment ${JSON.stringify(hit)}`)
  }

  const navBlock = extractNavArray(navText)
  if (navBlock === null) {
    fail(`could not locate the NAV_LINKS array in ${SHELL}`)
  } else {
    for (const value of quotedValues(navBlock)) {
      if (forbiddenHref(value) || forbiddenLabel(value)) {
        fail(`NAV_LINKS contains a cosmos/time entry ${JSON.stringify(value)}`)
      }
    }
  }

  const sitemapBlock = extractSitemapArray(sitemapText)
  if (sitemapBlock === null) {
    fail(`could not locate DOCK_SITEMAP_ROUTES in ${SITEMAP}`)
  } else {
    for (const value of quotedValues(sitemapBlock)) {
      if (forbiddenHref(value)) {
        fail(`DOCK_SITEMAP_ROUTES contains a cosmos/time entry ${JSON.stringify(value)}`)
      }
    }
  }

  for (const file of sourceFiles) {
    const lines = String(file.text).split(/\r?\n/)
    for (let index = 0; index < lines.length; index++) {
      if (SOURCE_PATTERN.test(lines[index])) {
        fail(`apps/dock/src still contains cosmos/astronomy vocabulary at ${file.path}:${index + 1}`)
        break
      }
    }
  }

  return errors
}

function countNavEntries(navText) {
  const block = extractNavArray(navText)
  return block ? (block.match(/\{\s*href:/g) ?? []).length : 0
}

function countSitemapRoutes(sitemapText) {
  const block = extractSitemapArray(sitemapText)
  return block ? quotedValues(block).length : 0
}

function selfTest() {
  const base = loadBaseline()
  const baseErrors = validate(base)
  if (baseErrors.length > 0) {
    console.log(`SELF-TEST FAIL: baseline is invalid: ${baseErrors[0]}`)
    return 1
  }

  const clone = () => ({
    docText: base.docText,
    auditText: base.auditText,
    navText: base.navText,
    sitemapText: base.sitemapText,
    appPaths: [...base.appPaths],
    sourceFiles: base.sourceFiles.map((file) => ({ path: file.path, text: file.text })),
  })

  const cases = [
    {
      name: 'design document without the NOT SHIPPED marker is rejected',
      mutate: (input) => {
        input.docText = input.docText.replace('NOT SHIPPED', 'shipped')
      },
    },
    {
      name: 'design document without the M25-02 prerequisite is rejected',
      mutate: (input) => {
        input.docText = input.docText.replaceAll('M25-02', 'M25-99')
      },
    },
    {
      name: 'design document that instructs adding a route is rejected',
      mutate: (input) => {
        input.docText += '\n\nAdd a cosmos route to the public header before release.\n'
      },
    },
    {
      name: 'design document that instructs registering a sitemap page is rejected',
      mutate: (input) => {
        input.docText += '\n\nRegister the page in the sitemap after M25-04.\n'
      },
    },
    {
      name: 'design document naming a cosmos route literal is rejected',
      mutate: (input) => {
        input.docText += '\n\nDraft surface: `/cosmos`.\n'
      },
    },
    {
      name: 'audit without the baseline_sha marker is rejected',
      mutate: (input) => {
        input.auditText = input.auditText.replaceAll('baseline_sha', 'baseline')
      },
    },
    {
      name: 'a cosmos NAV_LINKS entry is rejected',
      mutate: (input) => {
        input.navText = input.navText.replace(
          "  { href: '/#zine-poster', label: 'ABOUT' },",
          "  { href: '/#zine-poster', label: 'ABOUT' },\n  { href: '/cosmos', label: 'COSMOS' },",
        )
      },
    },
    {
      name: 'a bare time NAV_LINKS entry is rejected',
      mutate: (input) => {
        input.navText = input.navText.replace(
          "  { href: '/timeline', label: 'TIMELINE' },",
          "  { href: '/timeline', label: 'TIMELINE' },\n  { href: '/time', label: 'TIME' },",
        )
      },
    },
    {
      name: 'a cosmos sitemap entry is rejected',
      mutate: (input) => {
        input.sitemapText = input.sitemapText.replace("  '/studio',", "  '/studio',\n  '/cosmos',")
      },
    },
    {
      name: 'an astronomy sitemap entry is rejected',
      mutate: (input) => {
        input.sitemapText = input.sitemapText.replace("  '/studio',", "  '/studio',\n  '/astronomy',")
      },
    },
    {
      name: 'a cosmos route directory is rejected',
      mutate: (input) => {
        input.appPaths.push('cosmos/page.tsx')
      },
    },
    {
      name: 'a bare time route directory is rejected',
      mutate: (input) => {
        input.appPaths.push('(public)/time/page.tsx')
      },
    },
    {
      name: 'cosmos vocabulary inside apps/dock/src is rejected',
      mutate: (input) => {
        input.sourceFiles.push({ path: 'apps/dock/src/ui/fixture.ts', text: "export const label = 'celestial'\n" })
      },
    },
  ]

  let failed = 0
  for (const testCase of cases) {
    const input = clone()
    testCase.mutate(input)
    const errors = validate(input)
    const rejected = errors.length > 0
    console.log(`${rejected ? 'PASS' : 'FAIL'}  negative: ${testCase.name}`)
    if (rejected) console.log(`      first error: ${errors[0]}`)
    else failed++
  }

  const positives = [
    {
      name: 'the pre-existing narrative timeline route is allowed',
      mutate: (input) => {
        input.appPaths.push('timeline/page.tsx')
        input.navText = input.navText.replace(
          "  { href: '/#zine-poster', label: 'ABOUT' },",
          "  { href: '/#zine-poster', label: 'ABOUT' },\n  { href: '/timeline', label: 'TIMELINE' },",
        )
        input.sitemapText = input.sitemapText.replace("  '/studio',", "  '/studio',\n  '/timeline',")
      },
    },
    {
      name: 'a negated route sentence is not an instruction',
      mutate: (input) => {
        input.docText += '\n\nThis document does not add a route, a page or a nav entry.\n'
      },
    },
    {
      name: 'an allowed timeline archive path is not a forbidden segment',
      mutate: (input) => {
        input.sourceFiles.push({ path: 'apps/dock/src/ui/allowed.ts', text: "export const path = '/timeline'\n" })
      },
    },
  ]

  for (const testCase of positives) {
    const input = clone()
    testCase.mutate(input)
    const errors = validate(input)
    const accepted = errors.length === 0
    console.log(`${accepted ? 'PASS' : 'FAIL'}  positive: ${testCase.name}`)
    if (!accepted) {
      console.log(`      first error: ${errors[0]}`)
      failed++
    }
  }

  console.log(
    failed === 0
      ? `SELF-TEST PASS: all ${cases.length} invalid fixtures rejected and all ${positives.length} valid fixtures accepted`
      : `SELF-TEST FAIL: ${failed} fixture(s) behaved incorrectly`,
  )
  return failed
}

const args = process.argv.slice(2)
if (args.includes('--self-test')) {
  process.exit(selfTest() === 0 ? 0 : 1)
}

const input = loadBaseline()
const errors = validate(input)
if (errors.length > 0) {
  for (const error of errors) console.error('VIOLATION ' + error)
  console.error(`FAIL: ${errors.length} violation(s)`)
  process.exit(1)
}

console.log(`PASS proposal markers present in ${DOC}`)
console.log(`PASS no implementation instruction and no cosmos/time route literal in the sketch`)
console.log('PASS baseline dfc6556 pinned in the audit')
console.log(`PASS ${input.appPaths.length} Dock app paths scanned; no cosmos/astronomy/time route besides timeline`)
console.log(`PASS NAV_LINKS entries=${countNavEntries(input.navText)}; no cosmos/time destination`)
console.log(`PASS DOCK_SITEMAP_ROUTES entries=${countSitemapRoutes(input.sitemapText)}; no cosmos/time route`)
console.log(`PASS ${input.sourceFiles.length} apps/dock/src source files scanned; no cosmos/astronomy vocabulary`)
console.log('NOTE absence is the mechanism: the explorer is a document, not a hidden feature')
