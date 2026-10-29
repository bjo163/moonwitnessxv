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
test('the pilot is indexable on the canonical host only (ADR-0016)', () => {
  const robots = read('src/app/robots.ts')
  assert.match(robots, /allow:\s*'\/'/)
  assert.match(robots, /sitemap:\s*`\$\{SITE_ORIGIN\}\/sitemap\.xml`/)
  assert.match(robots, /host:\s*SITE_ORIGIN/)
  assert.ok(existsSync(join(app, 'src/app/sitemap.ts')), 'the sitemap route exists')
  for (const layout of ['src/app/(entry)/layout.tsx', 'src/app/(localized)/[locale]/layout.tsx']) {
    assert.match(read(layout), /index:\s*true/)
  }
  assert.match(read('src/lib/seo.ts'), /SITE_ORIGIN = 'https:\/\/a-l-l-a-h\.com'/)
  // the preview origin must stay out of the index even though the app says index
  assert.match(read('vercel.json'), /noindex, nofollow/)
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
  // M45: the five routes render components/story/* on the shared site chrome.
  // The old single-file StoryUniverse.tsx is gone; these assertions follow the
  // live components and the prose data that feeds them.
  // Comments are stripped first: the gates are about strings the site renders,
  // not about the CLAIMS note that quotes a banned claim by name.
  const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  const universe = [
    'src/components/story/HomePage.tsx',
    'src/components/story/LibraryPage.tsx',
    'src/components/story/ReaderPage.tsx',
    'src/components/story/CodexPage.tsx',
    'src/components/story/GgsPage.tsx',
    'src/components/story/StatRow.tsx',
    'src/components/site/SiteHeader.tsx',
    'src/components/site/SiteFooter.tsx',
    'src/components/site/InfoPage.tsx',
    // Rendered strings live in the copy modules, so the publication gates scan them too.
    'src/lib/home-copy.ts',
    'src/lib/library-copy.ts',
    'src/lib/reader-copy.ts',
    'src/lib/codex-copy.ts',
    'src/lib/ggs-copy.ts',
  ].map((file) => stripComments(read(file))).join('\n')
  const prose = read('src/lib/story-universe.ts')
  assert.match(universe, /from '@moonwitness\/moonui'/)
  assert.match(universe, /IconMoon/, 'the chrome draws with MoonUI icons')
  assert.doesNotMatch(universe, /data-theme="empire-story"/)
  assert.match(read('src/app/(localized)/[locale]/layout.tsx'), /data-skin="empire"/)
  assert.match(read('src/app/(entry)/layout.tsx'), /data-skin="zine"/)
  assert.match(universe, /aria-pressed/, 'tabs and panels expose their state')
  assert.match(universe, /setActive/)
  assert.match(universe, /aria-expanded=\{menuOpen\}/)
  assert.match(prose, /DRAFT · NOT PUBLISHED/)
  assert.match(prose, /fictional|fiksi/i)
  // The mockup's live-sounding copy is allowed only with its story-time caption
  // next to it; the false contiguous phrase and the invented metric stay banned.
  assert.doesNotMatch(universe, /GGS LIVE NOW|50\+ STORIES/)
  assert.match(universe, /not a live session|bukan sesi langsung/)
  assert.match(universe, /SUMBER KEAGAMAAN BELUM DITAMPILKAN/)
  assert.match(universe, /RELIGIOUS SOURCE CONTENT WITHHELD/)
  assert.doesNotMatch(universe, /QS Yunus 10:12|Quran 8:60/)
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
  const universe = ['src/lib/home-copy.ts', 'src/lib/library-copy.ts', 'src/lib/reader-copy.ts', 'src/lib/codex-copy.ts', 'src/lib/ggs-copy.ts', 'src/components/story/HomePage.tsx', 'src/components/story/LibraryPage.tsx', 'src/components/story/ReaderPage.tsx', 'src/components/story/CodexPage.tsx', 'src/components/story/GgsPage.tsx'].map(read).join('\n')
  for (const name of ['home-mooncity', 'library-guardian', 'reader-poster', 'codex-guardian', 'moon-academy']) {
    assert.ok(universe.includes(`${name}.webp`), `${name}: wired to page artwork`)
  }
})
