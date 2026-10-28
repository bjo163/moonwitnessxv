import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { URL } from 'node:url'
import { landingCopy } from '../src/lib/landing-copy.ts'

const shellSource = fs.readFileSync(new URL('../src/ui/components/shell.tsx', import.meta.url), 'utf8')
const navStart = shellSource.indexOf('export const NAV_LINKS')
const navEnd = shellSource.indexOf('] as const', navStart)
const navSource = shellSource.slice(navStart, navEnd)
const navHrefs = [...navSource.matchAll(/\{ href: '([^']+)'/g)].map((match) => match[1])
const indexStart = shellSource.indexOf('export const INDEX_GROUPS')
const indexEnd = shellSource.indexOf('] as const', indexStart)
const indexSource = shellSource.slice(indexStart, indexEnd)
const indexHrefs = [...indexSource.matchAll(/\{ href: '([^']+)'/g)].map((match) => match[1])
const navLabelKeys = [...navSource.matchAll(/labelKey: '([^']+)'/g)].map((match) => match[1])

test('header exposes four primary destinations in the approved order and nine Index routes', () => {
  assert.deepEqual(navHrefs, ['/reader', '/terms', '/stations', '/studio'])
  assert.deepEqual(indexHrefs, ['/figures', '/missions', '/constellation', '/prisms', '/timeline', '/patches', '/schedule', '/denpa', '/research'])
  assert.equal(navHrefs.length, 4)
  assert.equal(indexHrefs.length, 9)
  assert.equal(navHrefs.includes('/'), false)
  assert.equal(navHrefs.some((href) => href.includes('#')), false)
  assert.match(navSource, /href: '\/studio', labelKey: 'spaceCreate', demo: true/)
})

test('both locales label the primary spaces and mark Create as a demo and Research withheld', () => {
  for (const locale of ['en', 'id']) {
    const copy = landingCopy[locale]
    assert.deepEqual(navLabelKeys.map((key) => copy[key]), [copy.spaceRead, copy.spaceExplore, copy.spaceSignal, copy.spaceCreate])
    assert.ok(copy.statusReal)
    assert.ok(copy.statusDemo)
    assert.ok(copy.navWithheld)
    assert.ok(copy.navResearch)
    assert.ok(copy.navIndex)
    assert.ok(copy.footerCrewLink)
    assert.ok(copy.footerAboutLink)
  }
  assert.notEqual(landingCopy.en.navWithheld, landingCopy.id.navWithheld)
  assert.notEqual(landingCopy.en.navResearch, landingCopy.id.navResearch)
  assert.notEqual(landingCopy.en.statusReal, landingCopy.id.statusReal)
})

test('Index disclosure is controlled and supports keyboard focus without adding a nav landmark or search', () => {
  assert.match(shellSource, /aria-expanded=\{open\}/)
  assert.match(shellSource, /aria-controls=\{id\}/)
  assert.match(shellSource, /id=\{id\}[\s\S]*?hidden=\{!open\}/)
  assert.match(shellSource, /if \(open && focusFirstLinkOnOpenRef\.current\)[\s\S]*?querySelector<HTMLAnchorElement>\('a\[href\]'\)\?\.focus\(\)/)
  assert.match(shellSource, /focusFirstLinkOnOpenRef\.current = !open/)
  assert.doesNotMatch(shellSource, /useEffect\(\(\) => \{\s*if \(open\) panelRef/)
  assert.match(shellSource, /event\.key !== 'Escape'[\s\S]*?onOpenChange\(false\)[\s\S]*?triggerRef\.current\?\.focus\(\)/)
  assert.equal((shellSource.match(/<IndexDisclosure/g) ?? []).length, 2)
  assert.equal((shellSource.match(/<nav\b/g) ?? []).length, 2, 'desktop and existing drawer nav remain the only landmarks')
  assert.doesNotMatch(shellSource, /<input[^>]+type="search"|Global search/i)
})
