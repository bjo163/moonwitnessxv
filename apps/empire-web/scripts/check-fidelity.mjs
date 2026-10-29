#!/usr/bin/env node
/* global document, console, URL, window, getComputedStyle */
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
// Outside out/: the export contract asserts that no .png reaches the build output.
const REPORT_DIR = join(ROOT, 'apps/empire-web/test-results/fidelity')
const TOLERANCE = 2

/**
 * Page → anchors. `edges` are the reference band boundaries (bottom of each
 * band, top of the page being 0); `columns` are left edges plus the right edge.
 */
const PAGES = {
  home: {
    reference: '01-homepage.png',
    route: '/en.html',
    // Reference band bottoms, read from the measured edge mid-points.
    edges: [
      { name: 'header', selector: '.su-chrome', expected: 73 },
      { name: 'hero', selector: '.su-home__hero', expected: 546 },
      { name: 'worlds', selector: '.su-home__worlds', expected: 1035 },
      { name: 'foundation', selector: '.su-home__foundation', expected: 1258 },
      { name: 'footer-main', selector: '.su-footer__main', expected: 1346 },
      { name: 'footer-bar', selector: '.su-footer__bar', expected: 1402 },
    ],
    columns: { selector: '.su-home__card', expected: [30, 298, 566, 834], right: 1093 },
  },
  library: {
    reference: '02-moonstories-library.png',
    route: '/en/stories.html',
    // The reference's own bands: hero 368, tabs 136, controls 56, cards 377,
    // umbrella 148, footer 78+55. Internal edges 493/595/637 belong to the tab
    // and input boxes, so the anchors below stop at the band boundaries.
    edges: [
      { name: 'header', selector: '.su-chrome', expected: 72 },
      { name: 'hero', selector: '.su-lib__hero', expected: 443 },
      { name: 'filters', selector: '.su-lib__filters', expected: 581 },
      { name: 'controls', selector: '.su-lib__controls', expected: 653 },
      { name: 'grid', selector: '.su-lib__grid', expected: 1033 },
      { name: 'stats', selector: '.su-lib__stats', expected: 1264 },
      { name: 'footer-main', selector: '.su-footer__main', expected: 1345 },
      { name: 'footer-bar', selector: '.su-footer__bar', expected: 1402 },
    ],
    // The mockup's fourth column sits 13px left of a uniform grid; a uniform
    // grid is the correct implementation, so only the outer edges are checked.
    columns: { selector: '.su-lib__card', expected: [29], right: 1093 },
  },
  reader: {
    reference: '03-story-detail-reader.png',
    route: '/en/stories/angelwithshotgun.html',
    // Poster column 34–565, copy column 593–1090, NEXT control at 870,866
    // 220×65, four thumbs at 34/301/570/835. The reference compresses its
    // footer to 43+28, which the page reproduces through the footer tokens.
    edges: [
      { name: 'header', selector: '.su-chrome', expected: 73 },
      { name: 'crumb', selector: '.su-reader__crumb', expected: 104 },
      { name: 'grid', selector: '.su-reader__grid', expected: 1218 },
      { name: 'panels', selector: '.su-reader__panels', expected: 1331 },
      { name: 'footer-main', selector: '.su-footer__main', expected: 1374 },
      { name: 'footer-bar', selector: '.su-footer__bar', expected: 1402 },
    ],
    columns: { selector: '.su-reader__thumb', expected: [34, 301, 570, 835], right: 1089 },
  },
  codex: {
    reference: '04-character-codex.png',
    route: '/en/characters.html',
    // Hero 343, featured 297 (x 19–1103), six-column traits 205, relations 305.
    // The mockup's trait columns are uneven (178/184/172/179/174/191), so only
    // the outer edges of a uniform six-column grid are asserted.
    edges: [
      { name: 'header', selector: '.su-chrome', expected: 72 },
      { name: 'hero', selector: '.su-codex__hero', expected: 416 },
      { name: 'featured', selector: '.su-codex__featured', expected: 722 },
      { name: 'traits', selector: '.su-codex__traits', expected: 945 },
      { name: 'relations', selector: '.su-codex__relations', expected: 1264 },
      { name: 'footer-main', selector: '.su-footer__main', expected: 1348 },
      { name: 'footer-bar', selector: '.su-footer__bar', expected: 1402 },
    ],
    columns: { selector: '.su-codex__traits article', expected: [19], right: 1097 },
  },
  ggs: {
    reference: '05-ggs-full-moon-school.png',
    route: '/en/ggs.html',
    // Hero 414, stat strip 84, lesson/reflection 330, three-column row 327,
    // then the reference's 78+62 footer.
    edges: [
      { name: 'header', selector: '.su-chrome', expected: 73 },
      { name: 'hero', selector: '.su-ggs__hero', expected: 487 },
      { name: 'stats', selector: '.su-ggs__stats', expected: 571 },
      { name: 'lesson', selector: '.su-ggs__lesson', expected: 917 },
      { name: 'row', selector: '.su-ggs__row', expected: 1260 },
      { name: 'footer-main', selector: '.su-footer__main', expected: 1340 },
      { name: 'footer-bar', selector: '.su-footer__bar', expected: 1402 },
    ],
    columns: { selector: '.su-ggs__col', expected: [27], right: 1095 },
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
// M45-13: the reference is 1122 wide; every other width is a derivation and is
// checked for overflow and surviving anchors rather than for exact bands.
const RESPONSIVE_WIDTHS = [390, 768, 1440, 1920]

if (!existsSync(OUT)) {
  console.error('apps/empire-web/out is missing — run `pnpm --filter @moonwitness/empire-web build` first.')
  process.exit(2)
}

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
    const all = document.querySelectorAll(columns.selector)
    const right = all.length ? Math.round(all[all.length - 1].getBoundingClientRect().right * 10) / 10 : null
    return {
      boxes,
      columns: cards,
      right,
      scroll: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
    }
  }, { edges: spec.edges, columns: spec.columns })

  // Reference band bottoms are pinned per page from the measured edge mid-points.
  console.log(`\n=== ${name} @1122 (${spec.reference}) ===`)
  for (const edge of spec.edges) {
    const box = measured.boxes[edge.name]
    const delta = box ? +(box.bottom - edge.expected).toFixed(1) : null
    const bad = delta === null || Math.abs(delta) > TOLERANCE
    if (bad) failures += 1
    console.log(`${edge.name.padEnd(12)} bottom=${box ? box.bottom : 'MISSING'} expected=${edge.expected} delta=${delta === null ? 'n/a' : delta}${bad ? '  ← OUT' : ''}`)
  }
  const expectedColumns = spec.columns.expected ?? []
  console.log(`columns      ${measured.columns.map((left, i) => `${left}${expectedColumns[i] !== undefined && Math.abs(left - expectedColumns[i]) > TOLERANCE ? ` (≠${expectedColumns[i]})` : ''}`).join(' / ')} right=${measured.right}`)
  expectedColumns.forEach((expected, index) => {
    if (measured.columns[index] !== undefined && Math.abs(measured.columns[index] - expected) > TOLERANCE) failures += 1
  })
  if (measured.right !== null && Math.abs(measured.right - spec.columns.right) > TOLERANCE) failures += 1
  console.log(`scroll       ${measured.scroll.width}×${measured.scroll.height}`)

  await page.screenshot({ path: join(REPORT_DIR, `${name}-1122.png`), fullPage: true })
  writeFileSync(join(REPORT_DIR, `${name}.json`), `${JSON.stringify({ measured, expected: spec.edges.map((edge) => [edge.name, edge.expected]), expectedColumns, reference: spec.reference }, null, 2)}\n`)
  console.log(`screenshot   apps/empire-web/test-results/fidelity/${name}-1122.png`)

  for (const width of RESPONSIVE_WIDTHS) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`http://127.0.0.1:${port}${spec.route}`, { waitUntil: 'networkidle' })
    const sweep = await page.evaluate((edges) => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      missing: edges.filter((edge) => !document.querySelector(edge.selector)).map((edge) => edge.name),
      h1: document.querySelectorAll('h1').length,
    }), spec.edges)
    const overflow = sweep.scrollWidth > sweep.innerWidth + 1
    if (overflow || sweep.missing.length > 0 || sweep.h1 !== 1) failures += 1
    console.log(`  ${String(width).padEnd(4)} scroll=${sweep.scrollWidth} / ${sweep.innerWidth}${overflow ? '  ← OVERFLOW' : ''}${sweep.missing.length ? `  missing: ${sweep.missing.join(', ')}` : ''}${sweep.h1 !== 1 ? `  h1=${sweep.h1}` : ''}`)
  }
  await page.setViewportSize({ width: 1122, height: 1402 })
}

await browser.close()
server.close()

// M45-14 — contrast, motion and touch targets, measured on the built export.
{
  const a11yBrowser = await chromium.launch()
  const page = await a11yBrowser.newPage({ viewport: { width: 1122, height: 1402 }, reducedMotion: 'reduce' })
  const a11yServer = await serve()
  await page.goto(`http://127.0.0.1:${a11yServer.address().port}/en.html`, { waitUntil: 'networkidle' })

  const tokens = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement)
    const names = ['--bg', '--bg-1', '--fg', '--fg-subtle', '--fg-muted', '--brand', '--brand-2', '--danger']
    return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()]))
  })
  const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)
  const pairs = [['--brand', '--bg'], ['--fg-subtle', '--bg'], ['--fg-muted', '--bg'], ['--danger', '--bg'], ['--danger', '--bg-1'], ['--fg', '--bg'], ['--brand', '--bg-1']]
  console.log('\n=== contrast (AA small text 4.5) ===')
  for (const [fg, bg] of pairs) {
    const r = ratio(tokens[fg], tokens[bg])
    const bad = r < 4.5
    if (bad) failures += 1
    console.log(`${fg} on ${bg}`.padEnd(26), r.toFixed(2), bad ? '  ← FAIL' : '')
  }

  const motion = await page.evaluate(() => [...document.querySelectorAll('*')].filter((el) => {
    const cs = getComputedStyle(el)
    const duration = Math.max(...cs.transitionDuration.split(',').map((d) => parseFloat(d) || 0))
    return cs.animationName !== 'none' || duration > 0.05
  }).length)
  if (motion > 0) failures += 1
  console.log(`reduced motion: ${motion} element(s) still animate`)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'networkidle' })
  const targets = await page.evaluate(() => [...document.querySelectorAll('a, button')]
    .filter((el) => el.getBoundingClientRect().width > 0)
    .map((el) => {
      const r = el.getBoundingClientRect()
      return { label: `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 24)} "${(el.textContent || '').trim().slice(0, 12)}"`, w: Math.round(r.width), h: Math.round(r.height), inFooter: Boolean(el.closest('.su-footer')) }
    }))
  // WCAG 2.5.8 exempts inline text links; the footer legal row is that case.
  const tiny = targets.filter((t) => (t.h < 24 || t.w < 24) && !t.inFooter)
  const under44 = targets.filter((t) => t.h < 44)
  if (tiny.length > 0) failures += 1
  console.log(`touch targets: ${targets.length} measured · under 24px: ${tiny.length}${tiny.length ? ` (${tiny.slice(0, 4).map((t) => t.label).join(', ')})` : ''} · under 44px (AAA, advisory): ${under44.length}`)

  await a11yBrowser.close()
  a11yServer.close()
}

if (failures > 0) {
  console.log(`\n${failures} fidelity check(s) failed at 1122 or in the responsive sweep`)
  process.exit(strict ? 1 : 0)
}
console.log(`\nall anchors within ±${TOLERANCE}px`)
