import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { landingCopy } from '../src/lib/landing-copy.ts'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appDir = path.resolve(testDir, '..')
const repoDir = path.resolve(appDir, '..', '..')

// ADR-0017: the card anatomy is MoonUI's, the routes and copy are Dock's.
const moonSpacesPath = path.resolve(repoDir, 'packages', 'moonui', 'src', 'spaces.tsx')
const moonSpacesSource = fs.readFileSync(moonSpacesPath, 'utf8')
const dockDataPath = path.resolve(appDir, 'src', 'ui', 'components', 'spaces-data.tsx')
const dockDataSource = fs.readFileSync(dockDataPath, 'utf8')

const SPACE_ROUTES = ['/reader', '/terms', '/studio', '/stations']

const pageFileFor = (route) =>
  path.join(appDir, 'src', 'app', ...route.slice(1).split('/').filter(Boolean), 'page.tsx')

test('every space route resolves to an existing Dock page', () => {
  for (const route of SPACE_ROUTES) {
    assert.ok(
      dockDataSource.includes(`localizedDockHref('${route}'`),
      `Dock must link to ${route} through localizedDockHref`,
    )
    assert.ok(
      fs.existsSync(pageFileFor(route)),
      `${route} must have a real page at apps/dock/src/app${route}/page.tsx`,
    )
  }
})

test('SpaceStatus allows exactly REAL, PLANNED and DEMO', () => {
  const union = /export type SpaceStatus = ([^\n]+)/.exec(moonSpacesSource)?.[1] ?? ''
  const literals = [...union.matchAll(/'([A-Z]+)'/g)].map((match) => match[1]).sort()
  assert.deepEqual(literals, ['DEMO', 'PLANNED', 'REAL'])
  assert.equal((union.match(/\|/g) ?? []).length, 2, 'no fourth status may be added silently')
})

test('space copy exists in both locales and differs between them', () => {
  const keys = [
    'homeEyebrow',
    'spacesHeading',
    'spaceRead',
    'spaceReadBody',
    'spaceExplore',
    'spaceExploreBody',
    'spaceCreate',
    'spaceCreateBody',
    'spaceCreateNote',
    'spaceSignal',
    'spaceSignalBody',
    'spaceOpen',
    'statusReal',
    'statusPlanned',
    'statusDemo',
  ]
  for (const key of keys) {
    assert.equal(typeof landingCopy.en[key], 'string', `en.${key} must exist`)
    assert.equal(typeof landingCopy.id[key], 'string', `id.${key} must exist`)
    assert.ok(landingCopy.en[key].trim().length > 0, `en.${key} must not be empty`)
    assert.ok(landingCopy.id[key].trim().length > 0, `id.${key} must not be empty`)
  }
  assert.notEqual(landingCopy.en.spacesHeading, landingCopy.id.spacesHeading)
  assert.equal(landingCopy.en.statusReal, 'REAL')
  assert.equal(landingCopy.id.statusReal, 'NYATA')
})

test('a space card carries words, never a counter or a fictional live claim', () => {
  const cardStart = moonSpacesSource.indexOf('export function SpaceCard')
  const gridStart = moonSpacesSource.indexOf('export function SpaceGrid')
  assert.ok(cardStart > -1 && gridStart > cardStart, 'SpaceCard must precede SpaceGrid')
  const card = moonSpacesSource.slice(cardStart, gridStart)
  assert.doesNotMatch(card, /\{\s*\d+\s*\}/, 'a card must not render a numeric counter')
  assert.doesNotMatch(card, /\bLIVE\b|\bNOMINAL\b/, 'a card must not claim a live/nominal state')
  assert.match(card, /<Tape tone=\{STATUS_TAPE_TONE\[status\]\}>/, 'status must render as a word tape')
})

test('CREATE is the only DEMO space and names its blocker', () => {
  const demoCount = (dockDataSource.match(/status: 'DEMO'/g) ?? []).length
  assert.equal(demoCount, 1)
  assert.match(dockDataSource, /status: 'DEMO',[\s\S]{0,200}note: copy\.spaceCreateNote/)
  assert.match(landingCopy.en.spaceCreateNote, /M33/)
  assert.match(landingCopy.id.spaceCreateNote, /M33/)
})
