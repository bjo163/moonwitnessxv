import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { URL } from 'node:url'

const layout = readFileSync(new URL('../src/layouts/site.tsx', import.meta.url), 'utf8')
const dockCss = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8')
const cockpitEntry = readFileSync(new URL('../../../tools/cockpit/client/main.tsx', import.meta.url), 'utf8')
const cockpitCss = readFileSync(new URL('../../../tools/cockpit/client/cockpit-layout.css', import.meta.url), 'utf8')

test('M19-06 maps only the existing Dock routes to their accepted experience tokens', () => {
  assert.match(layout, /unlocalizedPath\.startsWith\('\/reader'\)[\s\S]*\? 'reader'/)
  assert.match(layout, /unlocalizedPath === '\/terms'[\s\S]*\? 'research'/)
  assert.match(layout, /unlocalizedPath === '\/studio'[\s\S]*\? 'story'/)
  assert.match(layout, /MOON_EXPERIENCES\[experience\]/)
  assert.match(layout, /data-experience=\{experience\}/)
  assert.match(dockCss, /max-width: var\(--experience-max-width\)/)
  assert.match(dockCss, /font-size: var\(--experience-body-size\)/)
  assert.match(dockCss, /\.dk-main\[data-experience\] h1[\s\S]*?font-family: var\(--experience-heading-font\)/)
  assert.match(dockCss, /max-width: var\(--experience-measure\)/)
  assert.match(readFileSync(new URL('../src/ui/client/GeneratorStudio.tsx', import.meta.url), 'utf8'), /fontSize: 'var\(--experience-display-size\)'/)
})

test('M19-06 applies the accepted operator tokens to the existing Cockpit root', () => {
  assert.match(cockpitEntry, /MOON_EXPERIENCES\.operator/)
  assert.match(cockpitEntry, /dataset\.experience = 'operator'/)
  assert.match(cockpitEntry, /setProperty\('--experience-density', experience\.density\)/)
  assert.match(cockpitEntry, /setProperty\('--experience-gutter', experience\.space\.gutter\)/)
  assert.match(cockpitCss, /#root\[data-experience='operator'\]/)
  assert.match(cockpitCss, /font-size: var\(--experience-body-size\)/)
})
