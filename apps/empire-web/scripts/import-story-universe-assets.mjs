#!/usr/bin/env node
/* global process, console, Buffer */
/**
 * Safely import the FIVE SHA-256-verified original PNG references from the
 * user-supplied zip. Built-in Node 24 modules only; no NPM package or network.
 * Does not touch app/public, services, auth, Vercel, or production DNS.
 *
 * node apps/empire-web/scripts/import-story-universe-assets.mjs --zip PATH
 * Optional --force to overwrite existing matching filenames.
 */
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { inflateRawSync } from 'node:zlib'

const here = dirname(fileURLToPath(import.meta.url))
const assetRoot = resolve(here, '../docs/story-universe/assets')
const manifest = JSON.parse(readFileSync(resolve(here, '../docs/story-universe/contracts/asset_manifest.json'), 'utf8'))
const args = process.argv.slice(2)
const help = args.includes('--help') || args.includes('-h')
const archiveArgIndex = args.indexOf('--zip')
const archiveArg = archiveArgIndex >= 0 ? args[archiveArgIndex + 1] : null
const force = args.includes('--force')
if (help) {
  console.log('Usage: node apps/empire-web/scripts/import-story-universe-assets.mjs --zip /path/to/bundle.zip [--force]')
  process.exit(0)
}
if (!archiveArg || archiveArg.startsWith('--')) {
  console.error('Missing --zip PATH. Supply the companion ChatGPT ZIP containing the five original PNGs.')
  process.exit(2)
}
const zip = readFileSync(resolve(archiveArg))
const zipEndSignature = 0x06054b50
let eocd = -1
for (let at = zip.length - 22; at >= Math.max(0, zip.length - 22 - 65535); at--) {
  if (zip.readUInt32LE(at) === zipEndSignature) { eocd = at; break }
}
if (eocd < 0) throw new Error('ZIP end-of-central-directory record not found')
if (zip.readUInt16LE(eocd + 4) !== 0 || zip.readUInt16LE(eocd + 6) !== 0) throw new Error('Multi-disk ZIP not supported')
const entryCount = zip.readUInt16LE(eocd + 10)
const centralSize = zip.readUInt32LE(eocd + 12)
let at = zip.readUInt32LE(eocd + 16)
if (at + centralSize > zip.length || entryCount > 1000) throw new Error('Invalid ZIP central directory')
const wanted = new Map(manifest.assets.map(entry => [
  'ALLAH_STORY_UNIVERSE_MOCKUP_SPEC_v1/assets/' + entry.filename, entry,
]))
const found = new Map()
for (let i = 0; i < entryCount; i++) {
  if (at + 46 > zip.length || zip.readUInt32LE(at) !== 0x02014b50) throw new Error('Invalid ZIP entry header')
  const method = zip.readUInt16LE(at + 10)
  const compressed = zip.readUInt32LE(at + 20)
  const uncompressed = zip.readUInt32LE(at + 24)
  const nameLen = zip.readUInt16LE(at + 28)
  const extraLen = zip.readUInt16LE(at + 30)
  const commentLen = zip.readUInt16LE(at + 32)
  const localOff = zip.readUInt32LE(at + 42)
  const name = zip.subarray(at + 46, at + 46 + nameLen).toString('utf8')
  at += 46 + nameLen + extraLen + commentLen
  const entry = wanted.get(name)
  if (!entry) continue
  if (found.has(name)) throw new Error('Duplicate ZIP entry: ' + name)
  if (uncompressed > 12 * 1024 * 1024) throw new Error('Unsafe unexpected PNG size: ' + name)
  if (localOff + 30 > zip.length || zip.readUInt32LE(localOff) !== 0x04034b50) throw new Error('Invalid ZIP local entry: ' + name)
  const localNameLen = zip.readUInt16LE(localOff + 26)
  const localExtraLen = zip.readUInt16LE(localOff + 28)
  const contentAt = localOff + 30 + localNameLen + localExtraLen
  if (contentAt + compressed > zip.length) throw new Error('Truncated compressed entry: ' + name)
  const data = zip.subarray(contentAt, contentAt + compressed)
  const payload = method === 0 ? data : method === 8 ? inflateRawSync(data, { maxOutputLength: 12 * 1024 * 1024 }) : null
  if (!payload || payload.length !== uncompressed) throw new Error('Unsupported method or mismatched payload size: ' + name)
  if (!payload.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) throw new Error('Not a valid PNG signature: ' + name)
  const digest = createHash('sha256').update(payload).digest('hex')
  if (digest !== entry.sha256) throw new Error('SHA-256 mismatch: ' + name + ' expected ' + entry.sha256 + ' got ' + digest)
  found.set(name, payload)
}
if (found.size !== wanted.size) throw new Error('ZIP is missing expected PNG assets: ' + [...wanted.keys()].filter(k => !found.has(k)).join(', '))
// Validate ALL assets before writing ANY file.
for (const entry of manifest.assets) {
  const dest = join(assetRoot, entry.filename)
  if (existsSync(dest) && !force) throw new Error('File already exists (pass --force to overwrite): ' + dest)
}
mkdirSync(assetRoot, { recursive: true })
for (const entry of manifest.assets) {
  const src = 'ALLAH_STORY_UNIVERSE_MOCKUP_SPEC_v1/assets/' + entry.filename
  const dest = join(assetRoot, entry.filename)
  writeFileSync(dest, found.get(src), { flag: 'w' })
  console.log('VERIFIED SHA-256', entry.sha256, dest)
}
console.log('Imported all 5 original PNGs without alteration. Commit reviewed files on dev; do not publish into public/.')
