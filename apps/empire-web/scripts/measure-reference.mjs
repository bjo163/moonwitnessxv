#!/usr/bin/env node
/* global document, Image, URL, console */
/**
 * M45-01 — measure a Story Universe reference PNG instead of eyeballing it.
 *
 * The five mockups are 1122×1402 screenshots. Their paintings make a generic
 * image diff useless, but the *interface* layers are measurable: hairline rules,
 * card edges and saturated CTA rectangles sit on flat colours that survive any
 * art behind them. This script loads a reference at 1:1 into Chromium, reads the
 * pixels, and prints the anchors the layout spec and the fidelity harness use:
 *
 *   - separator rows   : full-width 1px hairlines (section boundaries)
 *   - vertical rules   : long hairline columns (card edges / column gutters)
 *   - red boxes        : connected saturated-red rectangles (CTAs, active states)
 *   - row bands        : rows whose mean luminance differs from their neighbours
 *
 * Usage: node apps/empire-web/scripts/measure-reference.mjs [--json out.json] [file…]
 * Read-only: it writes nothing unless --json is given, and never touches a PNG.
 */
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import { chromium } from '@playwright/test'

const ROOT = resolve(fileURLToPath(new URL('../../..', import.meta.url)))
const ASSETS = 'apps/empire-web/docs/story-universe/assets'
const DEFAULTS = [
  '01-homepage.png',
  '02-moonstories-library.png',
  '03-story-detail-reader.png',
  '04-character-codex.png',
  '05-ggs-full-moon-school.png',
]

const args = process.argv.slice(2)
const jsonFlag = args.indexOf('--json')
const jsonOut = jsonFlag >= 0 ? args[jsonFlag + 1] : null
const files = args.filter((arg, i) => !arg.startsWith('--') && (jsonFlag < 0 || i !== jsonFlag + 1))
const targets = files.length > 0 ? files : DEFAULTS

const MIME = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' }

function serve() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname)
    // The page only needs an http origin so the canvas stays same-origin readable.
    if (path === '/') {
      res.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><title>measure</title>')
      return
    }
    const full = join(ROOT, path)
    if (!full.startsWith(ROOT) || !existsSync(full)) {
      res.writeHead(404).end('not found')
      return
    }
    res.writeHead(200, { 'content-type': MIME[extname(full)] ?? 'application/octet-stream' })
    res.end(readFileSync(full))
  })
  return new Promise((done) => server.listen(0, '127.0.0.1', () => done(server)))
}

/** Runs inside the page: pure pixel analysis, no DOM assumptions. */
function analyse(source) {
  const img = new Image()
  img.src = source
  return img.decode().then(() => {
    const { width: W, height: H } = img
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0)
    const data = ctx.getImageData(0, 0, W, H).data
    const at = (x, y) => (y * W + x) * 4

    // Hairline #514638 and the two saturated UI reds (#DB1E31 / #A91525).
    const isRule = (i) => {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      return Math.abs(r - 81) <= 16 && Math.abs(g - 70) <= 16 && Math.abs(b - 56) <= 18
    }
    const isRed = (i) => {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      return r >= 90 && g <= 110 && b <= 120 && r >= g * 1.55 && r >= b * 1.45
    }

    // 1. Structural edges: rows where a large share of columns jumps in
    // luminance. Unlike a hairline match this survives art, mist and gradients.
    const lum = (x, y) => {
      const i = at(x, y)
      return (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
    }
    const edgeRows = []
    for (let y = 0; y < H - 1; y += 1) {
      let count = 0
      for (let x = 0; x < W; x += 1) if (Math.abs(lum(x, y) - lum(x, y + 1)) > 18) count += 1
      if (count > W * 0.45) edgeRows.push({ y, coverage: +(count / W).toFixed(3) })
    }
    const edges = []
    for (const row of edgeRows) {
      const last = edges[edges.length - 1]
      if (last && row.y - last.to <= 2) last.to = row.y
      else edges.push({ from: row.y, to: row.y, coverage: row.coverage })
    }

    // 2. Full-width hairline separators (relaxed: cards and art break coverage).
    const ruleRows = []
    for (let y = 0; y < H; y += 1) {
      let count = 0
      for (let x = 0; x < W; x += 1) if (isRule(at(x, y))) count += 1
      if (count > W * 0.4) ruleRows.push({ y, coverage: +(count / W).toFixed(3) })
    }
    const separators = []
    for (const row of ruleRows) {
      const last = separators[separators.length - 1]
      if (last && row.y - last.to <= 2) last.to = row.y
      else separators.push({ from: row.y, to: row.y, coverage: row.coverage })
    }

    // 3. Long vertical hairline columns (card edges / column gutters).
    const ruleCols = []
    for (let x = 0; x < W; x += 1) {
      let longest = 0
      let run = 0
      for (let y = 80; y < H - 80; y += 1) {
        if (isRule(at(x, y))) {
          run += 1
          if (run > longest) longest = run
        } else run = 0
      }
      if (longest > 220) ruleCols.push(x)
    }
    const verticalRules = []
    for (const x of ruleCols) {
      const last = verticalRules[verticalRules.length - 1]
      if (last && x - last.to <= 2) last.to = x
      else verticalRules.push({ from: x, to: x })
    }

    // 3. Connected saturated-red rectangles (4-neighbour, bounding box + fill).
    const seen = new Uint8Array(W * H)
    const boxes = []
    for (let y = 0; y < H; y += 1) {
      for (let x = 0; x < W; x += 1) {
        const index = y * W + x
        if (seen[index] || !isRed(at(x, y))) continue
        const stack = [[x, y]]
        seen[index] = 1
        let minX = x, maxX = x, minY = y, maxY = y, area = 0
        while (stack.length) {
          const [cx, cy] = stack.pop()
          area += 1
          if (cx < minX) minX = cx
          if (cx > maxX) maxX = cx
          if (cy < minY) minY = cy
          if (cy > maxY) maxY = cy
          for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
            if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
            const ni = ny * W + nx
            if (seen[ni] || !isRed(at(nx, ny))) continue
            seen[ni] = 1
            stack.push([nx, ny])
          }
        }
        const w = maxX - minX + 1
        const h = maxY - minY + 1
        const fill = area / (w * h)
        if (area > 400 && fill > 0.55 && w >= 40 && h >= 16 && h <= 140 && w <= 700) {
          boxes.push({ x: minX, y: minY, w, h, fill: +fill.toFixed(2) })
        }
      }
    }
    boxes.sort((a, b) => a.y - b.y || a.x - b.x)

    // 4. Row luminance bands (mean brightness per row, grouped when stable).
    const bands = []
    let current = null
    for (let y = 0; y < H; y += 2) {
      let sum = 0
      for (let x = 0; x < W; x += 4) {
        const i = at(x, y)
        sum += (data[i] + data[i + 1] + data[i + 2]) / 3
      }
      const mean = sum / (W / 4)
      const bucket = Math.round(mean / 6)
      if (!current || current.bucket !== bucket) {
        current = { from: y, to: y, bucket, mean: +mean.toFixed(1) }
        bands.push(current)
      } else {
        current.to = y
        current.mean = +(((current.mean + mean) / 2).toFixed(1))
      }
    }

    // 4. Per-band column edges: inside each structural band, the x positions
    // where a large share of rows jump in luminance are the grid lines / gutters.
    const bandRanges = []
    let bandFrom = 0
    for (const edge of edges) {
      bandRanges.push({ from: bandFrom, to: edge.from })
      bandFrom = edge.to + 1
    }
    bandRanges.push({ from: bandFrom, to: H })

    const columns = []
    for (const band of bandRanges) {
      const span = band.to - band.from
      if (span < 40) continue
      const scores = new Array(W).fill(0)
      for (let x = 0; x < W - 1; x += 1) {
        let hits = 0
        for (let y = band.from; y < band.to; y += 1) if (Math.abs(lum(x, y) - lum(x + 1, y)) > 16) hits += 1
        scores[x] = hits / span
      }
      const peaks = []
      for (let x = 1; x < W - 1; x += 1) {
        if (scores[x] > 0.55 && scores[x] >= scores[x - 1] && scores[x] > scores[x + 1]) {
          const last = peaks[peaks.length - 1]
          if (!last || x - last > 6) peaks.push(x)
        }
      }
      columns.push({ band: `${band.from}-${band.to}`, peaks: peaks.slice(0, 24) })
    }

    return {
      width: W,
      height: H,
      edges,
      separators,
      verticalRules: verticalRules.map((rule) => ({ x: rule.from, width: rule.to - rule.from + 1 })),
      columns,
      redBoxes: boxes.slice(0, 24),
      bands: bands.filter((band) => band.to - band.from >= 8).slice(0, 40),
    }
  })
}

const server = await serve()
const { port } = server.address()
const browser = await chromium.launch()
const page = await browser.newPage()
const results = {}

for (const file of targets) {
  const url = `http://127.0.0.1:${port}/${ASSETS}/${file}`
  await page.goto(`http://127.0.0.1:${port}/`)
  const measured = await page.evaluate(analyse, url)
  results[file] = measured
  console.log(`\n=== ${file} (${measured.width}x${measured.height}) ===`)
  console.log('edges       :', measured.edges.map((s) => `${s.from}${s.to === s.from ? '' : `-${s.to}`}(${s.coverage})`).join(', ') || 'none')
  console.log('separators  :', measured.separators.map((s) => (s.from === s.to ? s.from : `${s.from}-${s.to}`)).join(', ') || 'none')
  console.log('vertical    :', measured.verticalRules.map((r) => `${r.x}(${r.width})`).join(', ') || 'none')
  for (const column of measured.columns) console.log(`columns ${column.band}`.padEnd(20), ':', column.peaks.join(', ') || 'none')
  console.log('red boxes   :')
  for (const box of measured.redBoxes) console.log(`   x=${box.x} y=${box.y} w=${box.w} h=${box.h} fill=${box.fill}`)
}

await browser.close()
server.close()

if (jsonOut) {
  const { writeFileSync, mkdirSync } = await import('node:fs')
  const { dirname } = await import('node:path')
  mkdirSync(dirname(resolve(ROOT, jsonOut)), { recursive: true })
  writeFileSync(resolve(ROOT, jsonOut), `${JSON.stringify(results, null, 2)}\n`)
  console.log(`\nwrote ${jsonOut}`)
}
