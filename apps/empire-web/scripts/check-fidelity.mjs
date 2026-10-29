#!/usr/bin/env node
/* global document, console, URL */
/**
 * M45-14 — measure the built export against the reference numbers.
 *
 * `reference_measurements.json` came out of the PNGs (M45-01). This script
 * measures the same anchors in `out/` at 1122×1402 and prints the delta.
 * `--strict` fails on any drift beyond the tolerance, which is what CI will use;
 * without it the run is a report so a page can be iterated while it is rebuilt.
 *
 * Usage:
 *   node apps/empire-web/scripts/check-fidelity.mjs [--strict] [--page home]
 */
import { createServer } from 'node:http'
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import { chromium } from '@playwright/test'

const ROOT = resolve(fileURLToPath(new URL('../../..', import.meta.url)))
const OUT = join(ROOT, 'apps/empire-web/out')
const MANIFEST = join(ROOT, 'apps/empire-web/docs/story-universe/contracts/reference_measurements.json')
const REPORT_DIR = join(OUT, '.fidelity')
const TOLERANCE = 2

/**
 * Page → anchors. `edges` are the reference band boundaries (bottom of each
 * band, top of the page being 0); `columns` are left edges plus the right edge.
 */
const PAGES = {
  home: {
    reference: '01-homepage.png',
    route: '/en.html',
    edges: [
      { name: 'header', selector: '.su-chrome' },
      { name: 'hero', selector: '.su-home__hero' },
      { name: 'worlds', selector: '.su-home__worlds' },
      { name: 'foundation', selector: '.su-home__foundation' },
      { name: 'footer-main', selector: '.su-footer__main' },
      { name: 'footer-bar', selector: '.su-footer__bar' },
    ],
    columns: { selector: '.su-home__card', edge: '.su-home__worlds' },
  },
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml' }

function serve() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname)
    const candidates = [join(OUT, path), join(OUT, `${path}.html`), join(OUT, path, 'index.html')]
    const file = candidates.find((candidate) => candidate.startsWith(OUT) && existsSync(candidate) && !candidate.endsWith('\\') && !candidate.endsWith('/'))
    if (!file) {
      res.writeHead(404).end('not found')
      return
    }
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
    res.end(readFileSync(file))
  })
  return new Promise((done) => server.listen(0, '127.0.0.1', () => done(server)))
}

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const pageFilter = args.includes('--page') ? args[args.indexOf('--page') + 1] : null

if (!existsSync(OUT)) {
  console.error('apps/empire-web/out is missing — run `pnpm --filter @moonwitness/empire-web build` first.')
  process.exit(2)
}

const references = JSON.parse(readFileSync(MANIFEST, 'utf8'))
const server = await serve()
const { port } = server.address()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1122, height: 1402 } })

let failures = 0
mkdirSync(REPORT_DIR, { recursive: true })

for (const [name, spec] of Object.entries(PAGES)) {
  if (pageFilter && pageFilter !== name) continue
  await page.goto(`http://127.0.0.1:${port}${spec.route}`, { waitUntil: 'networkidle' })

  const measured = await page.evaluate(({ edges, columns }) => {
    const boxes = {}
    for (const edge of edges) {
      const element = document.querySelector(edge.selector)
      if (element) {
        const rect = element.getBoundingClientRect()
        boxes[edge.name] = { top: Math.round(rect.top * 10) / 10, bottom: Math.round(rect.bottom * 10) / 10, height: Math.round(rect.height * 10) / 10 }
      }
    }
    const cards = [...document.querySelectorAll(columns.selector)].map((card) => Math.round(card.getBoundingClientRect().left * 10) / 10)
    const last = document.querySelectorAll(columns.selector)
    const right = last.length ? Math.round(last[last.length - 1].getBoundingClientRect().right * 10) / 10 : null
    const wrapper = document.querySelector(columns.edge)
    return {
      boxes,
      columns: cards,
      right,
      wrapper: wrapper ? { left: Math.round(wrapper.getBoundingClientRect().left * 10) / 10, right: Math.round(wrapper.getBoundingClientRect().right * 10) / 10 } : null,
      scroll: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
    }
  }, { edges: spec.edges, columns: spec.columns })

  // Reference band bottoms: the mid-point of each detected 2–3px edge band,
  // because a CSS border sits inside one element and anti-aliases across two rows.
  const reference = references[spec.reference]
  const referenceBands = [0, ...reference.edges.map((edge) => Math.round((edge.from + edge.to) / 2))]
  const expectedBottoms = []
  for (let i = 0; i < referenceBands.length; i += 1) {
    const next = referenceBands[i + 1]
    if (next === undefined) expectedBottoms.push(reference.height)
    else expectedBottoms.push(next)
  }

  console.log(`\n=== ${name} @1122 (${spec.reference}) ===`)
  let index = 0
  for (const edge of spec.edges) {
    const box = measured.boxes[edge.name]
    const expected = expectedBottoms[index] ?? null
    const delta = box && expected !== null ? +(box.bottom - expected).toFixed(1) : null
    const bad = delta !== null && Math.abs(delta) > TOLERANCE
    if (bad) failures += 1
    console.log(`${edge.name.padEnd(12)} bottom=${box ? box.bottom : 'MISSING'} expected=${expected} delta=${delta === null ? 'n/a' : delta}${bad ? '  ← OUT' : ''}`)
    index += 1
  }
  const expectedColumns = [30, 298, 566, 834]
  console.log(`columns      ${measured.columns.map((left, i) => `${left}${Math.abs(left - (expectedColumns[i] ?? left)) > TOLERANCE ? ` (≠${expectedColumns[i]})` : ''}`).join(' / ')} right=${measured.right}`)
  if (measured.right !== null && Math.abs(measured.right - 1093) > TOLERANCE) failures += 1
  console.log(`scroll       ${measured.scroll.width}×${measured.scroll.height}`)

  await page.screenshot({ path: join(REPORT_DIR, `${name}-1122.png`), fullPage: true })
  writeFileSync(join(REPORT_DIR, `${name}.json`), `${JSON.stringify({ measured, expectedBottoms, expectedColumns, reference: spec.reference }, null, 2)}\n`)
  console.log(`screenshot   apps/empire-web/out/.fidelity/${name}-1122.png`)
}

await browser.close()
server.close()

if (failures > 0) {
  console.log(`\n${failures} anchor(s) outside ±${TOLERANCE}px`)
  process.exit(strict ? 1 : 0)
}
console.log(`\nall anchors within ±${TOLERANCE}px`)
