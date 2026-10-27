import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appDir = path.resolve(testDir, '..')
const homeSource = fs.readFileSync(path.resolve(appDir, 'src', 'app', 'page.tsx'), 'utf8')
const shellSource = fs.readFileSync(
  path.resolve(appDir, 'src', 'ui', 'components', 'shell.tsx'),
  'utf8',
)

test('home renders the four-space entry on both the live and the offline branch', () => {
  assert.match(homeSource, /import \{ SpaceGrid \} from '@\/ui\/components\/spaces'/)
  const renders = (homeSource.match(/<SpaceGrid locale=\{locale\} \/>/g) ?? []).length
  assert.equal(renders, 2, 'an offline hub must still publish the four real routes')
})

test('home ships no mockup index counter and no decorative global search', () => {
  assert.doesNotMatch(homeSource, /01\s*\/\s*12/, 'the 01/12 mockup index is not product information')
  const headerStart = shellSource.indexOf('<header className="dk-header">')
  const headerEnd = shellSource.indexOf('</header>')
  assert.ok(headerStart > -1 && headerEnd > headerStart)
  const header = shellSource.slice(headerStart, headerEnd)
  assert.doesNotMatch(header, /<input/i, 'a search field without a real endpoint is a false affordance')
})

test('hero keeps the real schedule badge and adds the source CTA', () => {
  assert.match(shellSource, /<LiveDot on=\{Boolean\(nowTitle\)\} \/>/)
  assert.match(shellSource, /localizedDockHref\('\/reader', '', '', locale\)/)
  assert.match(shellSource, /\{copy\.exploreSources\}/)
  assert.match(shellSource, /\{copy\.homeEyebrow\}/)
})

test('the header band uses the display motto instead of an English literal', () => {
  assert.match(shellSource, /className="dk-hero-motto"/)
  assert.match(shellSource, /\{copy\.heroMottoLead\}/)
  assert.match(shellSource, /\{copy\.heroMottoAccent\}/)
  assert.doesNotMatch(shellSource, /MANY STORIES\./, 'motto text must come from the catalog')
})
