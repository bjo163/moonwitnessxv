#!/usr/bin/env node
/* global document, Image, URL, console, Buffer */
/**
 * M45-03 — turn a generated image into a Story Universe artwork slot.
 *
 * The Playwright ffmpeg build has no WebP muxer, so conversion runs through
 * Chromium's canvas encoder. The source is drawn with `cover` crop into the
 * slot's exact pixel size, so a 1024×1536 generation can serve a 560×900 card
 * without distortion.
 *
 * Usage:
 *   node apps/empire-web/scripts/import-generated-artwork.mjs \
 *     --src <generated.png> --slot home-hero [--quality 0.86]
 *
 * It prints the sha256/bytes/width/height line to paste into
 * contracts/generated_artwork_manifest.json, and refuses to write a file that
 * exceeds the 500 KB contract limit.
 */
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import { chromium } from '@playwright/test'

const ROOT = resolve(fileURLToPath(new URL('../../..', import.meta.url)))
const MANIFEST = 'apps/empire-web/docs/story-universe/contracts/generated_artwork_manifest.json'
const OUT_DIR = 'apps/empire-web/public/story-universe'
const MAX_BYTES = 500_000
const MIME = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' }

const argv = process.argv.slice(2)
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : fallback
}

const src = arg('src')
const slotName = arg('slot')
const quality = Number(arg('quality', '0.86'))
if (!src || !slotName) {
  console.error('usage: import-generated-artwork.mjs --src <image> --slot <slot> [--quality 0.86]')
  process.exit(2)
}

const manifest = JSON.parse(readFileSync(join(ROOT, MANIFEST), 'utf8'))
const slot = manifest.slots?.items?.find((item) => item.slot === slotName)
if (!slot) {
  console.error(`unknown slot "${slotName}". Known slots:\n  ${(manifest.slots?.items ?? []).map((i) => i.slot).join('\n  ')}`)
  process.exit(2)
}

const sourcePath = resolve(process.cwd(), src)
if (!existsSync(sourcePath)) {
  console.error(`source not found: ${sourcePath}`)
  process.exit(2)
}

function serve() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname)
    if (path === '/') {
      res.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><title>convert</title>')
      return
    }
    // Generated sources usually live outside the repo (image tool cache).
    if (path === '/__src') {
      res.writeHead(200, { 'content-type': MIME[extname(sourcePath)] ?? 'application/octet-stream' })
      res.end(readFileSync(sourcePath))
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

/** Cover-crop into the slot box, then encode WebP. */
function convert({ url, width, height, quality: q }) {
  const img = new Image()
  img.src = url
  return img.decode().then(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight)
    const drawWidth = img.naturalWidth * scale
    const drawHeight = img.naturalHeight * scale
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
    return canvas.toDataURL('image/webp', q)
  })
}

const server = await serve()
const { port } = server.address()
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(`http://127.0.0.1:${port}/`)
const dataUrl = await page.evaluate(convert, {
  url: `http://127.0.0.1:${port}/__src`,
  width: slot.width,
  height: slot.height,
  quality,
})
await browser.close()
server.close()

const bytes = Buffer.from(dataUrl.split(',')[1], 'base64')
if (bytes.length > MAX_BYTES) {
  console.error(`refusing: ${bytes.length} bytes exceeds the ${MAX_BYTES} contract limit (lower --quality)`)
  process.exit(1)
}
if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') {
  console.error('refusing: encoder did not produce a WebP container')
  process.exit(1)
}

const target = arg('out', slot.filename)
const fullTarget = join(ROOT, OUT_DIR, target)
mkdirSync(join(ROOT, OUT_DIR), { recursive: true })
writeFileSync(fullTarget, bytes)

const sha256 = createHash('sha256').update(bytes).digest('hex')
console.log(`wrote ${OUT_DIR}/${target}`)
console.log(`dimensions ${slot.width}x${slot.height} · ${bytes.length} bytes`)
console.log(`manifest line:\n{ "filename": "${target}", "slot": "${slotName}", "reference": "${slot.reference}", "width": ${slot.width}, "height": ${slot.height}, "sha256": "${sha256}", "bytes": ${bytes.length} }`)
console.log(`\nNext: add that line to assets, remove the slot from slots.items, then run\n  node --test apps/empire-web/test/contracts.test.mjs`)
