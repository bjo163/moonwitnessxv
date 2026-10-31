import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import assert from 'node:assert/strict'

/**
 * ADR-0014 — the Empire app consumes MoonUI skin tokens, not its own palette.
 *
 * The app still owns the colours that *draw* its moons, skylines and silhouettes;
 * those are illustration, not palette. Everything else must resolve through
 * `var(--…)` so a skin change is a one-file change in `packages/moonui/moon.css`.
 */

const app = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(app, path), 'utf8')

/** Every value MOON_SKINS or MOON_COLORS can hold, without the leading `#`. */
const PALETTE = [
  '07060b', '0b0912', '0d0b14', '13101d', '1b172a',
  '090b0d', '0b0d10', '101215', '131518', '1c1e22',
  'f7f4ec', 'f1ede5', '9e96b0', '92938f', 'b5afa4',
  'ffd400', 'c5a578', 'd8b67f', 'ff007a', 'db1e31', 'e03c49', 'a91525', 'ff1e56', 'ff5a6b',
  '00d4ff', '8fa4b8', '1da1f2', '6f8ea8', '00e676', '7fae88', '9d4edd', 'd6d5cd', '14100a',
  '514638', '3c3427', '8d7146',
]

/** Selectors whose declarations may keep literal colours: drawn artwork only. */
const ARTWORK_SELECTOR = /su-cover|su-moon|su-silhouette|su-city|su-comic-page|clip-path|repeating-linear-gradient|drop-shadow/

/** Each `selectors{declarations}` pair, so a rule next to an artwork rule stays checked. */
function rules(css) {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: match[1].trim(),
    declarations: match[2],
  }))
}

test('the Empire stylesheet carries no palette literal outside its artwork', () => {
  const offenders = []
  for (const { selector, declarations } of rules(read('src/app/globals.css'))) {
    if (ARTWORK_SELECTOR.test(selector)) continue
    for (const hex of PALETTE) {
      if (new RegExp(`#${hex}(?![0-9a-fA-F])`).test(declarations)) offenders.push(`${selector} → #${hex}`)
    }
  }
  assert.deepEqual(offenders, [], 'palette colours must resolve through var(--…) tokens')
})

test('the Empire app no longer carries a private skin', () => {
  const css = read('src/app/globals.css')
  assert.doesNotMatch(css, /--eol-/, 'the --eol-* pseudo-skin must be gone')
  assert.doesNotMatch(css, /data-theme/, 'the stylesheet must not select on data-theme')
  assert.doesNotMatch(read('../../packages/moonui/src/story.tsx'), /data-theme/, 'components must not set data-theme')
  assert.doesNotMatch(read('src/components/story/LibraryPage.tsx'), /data-theme/, 'components must not set data-theme')
  // ADR-0017: the chrome is MoonUI's, so the guard follows it there.
  assert.doesNotMatch(read('../../packages/moonui/src/site.tsx'), /data-theme/, 'components must not set data-theme')
  assert.doesNotMatch(read('../../packages/moonui/src/client/site-header.tsx'), /data-theme/, 'components must not set data-theme')
})

test('both route families pin their skin on the html element', () => {
  assert.match(read('src/app/(entry)/layout.tsx'), /<html[^>]*data-skin="zine"/)
  assert.match(read('src/app/(localized)/[locale]/layout.tsx'), /<html[^>]*data-skin="empire"/)
})

test('the Empire artwork stays app content and reaches the shared view as a prop', () => {
  // ADR-0017 R3: a picture file is Empire's content, so no design-system file may
  // name it. The reflection panel is painted by moon.css from the custom property
  // the view sets, and the URL itself is owned by the app's own copy module.
  const moonCss = read('../../packages/moonui/moon.css')
  assert.match(moonCss, /\.su-ggs__reflection::before[^}]*var\(--m-surface-art/, 'the reflection band is drawn by moon.css from a property')
  assert.match(read('../../packages/moonui/src/story.tsx'), /--m-surface-art.*url\(\$\{artwork\.reflection\}\)/, 'the view forwards the artwork it is given')
  assert.match(read('src/lib/ggs-copy.ts'), /reflection: '\/story-universe\/home-mooncity\.webp'/, 'ggs copy owns the reflection file')
  assert.doesNotMatch(moonCss, /url\('\/story-universe\//, 'the design system names no Empire asset')
  assert.doesNotMatch(read('src/app/globals.css'), /url\('\/story-universe\//, 'the app stylesheet names no artwork either')
  // Components and their copy modules together carry the five approved files.
  const art = [
    ...['LibraryPage', 'ReaderPage', 'CodexPage', 'GgsPage'].map((page) => read(`src/components/story/${page}.tsx`)),
    read('../../packages/moonui/src/story.tsx'),
    ...['home-copy', 'library-copy', 'reader-copy', 'codex-copy', 'ggs-copy'].map((copy) => read(`src/lib/${copy}.ts`)),
  ].join('\n')
  for (const name of ['home-mooncity', 'library-guardian', 'reader-poster', 'codex-guardian', 'moon-academy']) {
    assert.match(art, new RegExp(`${name}\\.webp`), `${name}: still drawn somewhere`)
  }
})
