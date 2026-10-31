import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appDir = path.resolve(testDir, '..')
const repoDir = path.resolve(appDir, '..', '..')

const sectionsSource = fs.readFileSync(
  path.resolve(appDir, 'src', 'ui', 'components', 'sections.tsx'),
  'utf8',
)
const dockCss = fs.readFileSync(path.resolve(appDir, 'src', 'app', 'globals.css'), 'utf8')
const moonCss = fs.readFileSync(path.resolve(repoDir, 'packages', 'moonui', 'moon.css'), 'utf8')

test('the constellation counts consume MoonUI StatStrip, not a local stat anatomy', () => {
  assert.match(sectionsSource, /import \{[^}]*\bStatStrip\b[^}]*\} from '@moonwitness\/moonui'/)
  assert.doesNotMatch(sectionsSource, /\bdk-paper-stat-row\b/, 'the local row wrapper is gone')
  assert.doesNotMatch(sectionsSource, /\bGlyph\b/, 'the decorative glyph monogram left with the local row')
  assert.match(
    sectionsSource,
    /<StatStrip\s+orientation="column"[\s\S]*?copy\.stationCount[\s\S]*?copy\.countryCount/,
    'both catalog counts are items of the shared strip',
  )
})

test('Dock keeps no component class for the stat anatomy', () => {
  assert.doesNotMatch(dockCss, /\.dk-paper-stat-row\b/, 'ADR-0017 R4: the anatomy lives in moon.css')
  assert.match(dockCss, /\.dk-paper-stats \{/, 'the card band stays Dock layout')
})

test('the column variant belongs to the primitive, so a page never restyles it', () => {
  assert.match(moonCss, /\.m-stat-strip\[data-orientation="column"\] \{/)
  assert.match(moonCss, /\.m-stat-strip-item b \{/, 'the value typography stays inside MoonUI')
})
