import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'

const app = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(app, path), 'utf8')

test('public locale routes share one guarded static implementation', () => {
  assert.ok(existsSync(join(app, 'src/app/(localized)/[locale]/page.tsx')))
  const layout = read('src/app/(localized)/[locale]/layout.tsx')
  assert.match(layout, /locale: 'id'/)
  assert.match(layout, /locale: 'en'/)
  assert.match(layout, /dynamicParams = false/)
})
test('preview does not claim launched or expose private API credentials', () => {
  const copy = read('src/lib/copy.ts')
  assert.match(copy, /CODE EXISTS/)
  assert.match(copy, /PLANNED/)
  assert.doesNotMatch(copy, /NEXT_PUBLIC_.*(?:SECRET|TOKEN|KEY)/)
  assert.doesNotMatch(read('src/components/Landing.tsx'), /fetch\s*\(/)
})
test('preview stays noindex until editorial and security approval', () => {
  assert.match(read('src/app/robots.ts'), /disallow:\s*'\/'/)
  for (const layout of ['src/app/(entry)/layout.tsx', 'src/app/(localized)/[locale]/layout.tsx']) {
    assert.match(read(layout), /index:\s*false/)
  }
})
test('static export has no duplicate API or login', () => {
  assert.match(read('next.config.mjs'), /output:\s*'export'/)
  assert.equal(existsSync(join(app, 'src/app/api')), false)
})

test('Story Universe routes stay localized, static, and publication-gated', () => {
  const routes = [
    'src/app/(localized)/[locale]/stories/page.tsx',
    'src/app/(localized)/[locale]/stories/angelwithshotgun/page.tsx',
    'src/app/(localized)/[locale]/characters/page.tsx',
    'src/app/(localized)/[locale]/ggs/page.tsx',
  ]
  for (const route of routes) {
    const source = read(route)
    assert.match(source, /generateStaticParams/)
    assert.match(source, /locale !== 'id'.*locale !== 'en'/s)
  }
  const universe = read('src/components/StoryUniverse.tsx')
  assert.match(universe, /from '@moonwitness\/moonui'/)
  assert.match(universe, /<LinkButton/)
  assert.match(universe, /<Button/)
  assert.match(universe, /data-theme="empire-story"/)
  assert.match(universe, /aria-pressed/)
  assert.match(universe, /setActive/)
  assert.match(universe, /aria-expanded=\{menuOpen\}/)
  assert.match(universe, /FoundationIcon/)
  assert.match(universe, /Draft|DRAF/)
  assert.match(universe, /fictional|fiksi/i)
  assert.doesNotMatch(universe, /GGS LIVE NOW|JOIN TODAY|50\+ STORIES/)
  assert.match(universe, /SUMBER KEAGAMAAN BELUM DITAMPILKAN/)
  assert.match(universe, /RELIGIOUS SOURCE CONTENT WITHHELD/)
  assert.doesNotMatch(universe, /QS Yunus 10:12|Quran 8:60/)
  assert.match(universe, /Ilustrasi disetujui untuk publikasi; naskah bab menunggu tinjauan editorial\./)
  assert.match(universe, /The illustration is approved for publication; the chapter text remains under editorial review\./)
  assert.match(universe, /Konten masih menunggu tinjauan editorial\./)
  assert.match(universe, /Editorial content remains under review\./)
})

test('page artwork is original, distinct, optimized, and separate from private references', () => {
  const manifest = JSON.parse(read('docs/story-universe/contracts/generated_artwork_manifest.json'))
  assert.equal(manifest.publicationApproved, true)
  assert.equal(manifest.status, 'publication_approved_for_generated_artwork_only')
  assert.match(manifest.approvalScope, /Only the five generated WebP files/)
  assert.match(manifest.approvalEvidence, /2026-10-29 \(Asia\/Jakarta\)/)
  assert.ok(manifest.approvalExcludes.includes('The five private PNG mockup references'))
  assert.ok(manifest.approvalExcludes.some(item => /Religious quotations/.test(item)))
  assert.equal(manifest.assets.length, 5)
  for (const asset of manifest.assets) {
    const image = readFileSync(join(app, 'public/story-universe', asset.filename))
    assert.equal(image.toString('ascii', 0, 4), 'RIFF', `${asset.filename}: WebP container`)
    assert.equal(image.toString('ascii', 8, 12), 'WEBP', `${asset.filename}: WebP signature`)
    assert.equal(image.length, asset.bytes, `${asset.filename}: recorded byte size`)
    assert.equal(createHash('sha256').update(image).digest('hex'), asset.sha256, `${asset.filename}: SHA-256`)
    assert.ok(image.length < 500_000, `${asset.filename}: optimized size`)
  }
  assert.equal(existsSync(join(app, 'public/story-universe/01-homepage.png')), false)
  assert.deepEqual(
    readdirSync(join(app, 'public/story-universe')).filter(name => name.endsWith('.webp')).sort(),
    manifest.assets.map(asset => asset.filename).sort(),
  )
  const universe = read('src/components/StoryUniverse.tsx')
  for (const name of ['home-mooncity', 'library-guardian', 'reader-poster', 'codex-guardian', 'moon-academy']) {
    assert.ok(universe.includes(`${name}.webp`), `${name}: wired to page artwork`)
  }
})
