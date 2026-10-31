import { test } from 'node:test'
import assert from 'node:assert/strict'
import { COCKPIT_COPY, getCockpitCopy, type CockpitLocale } from '../client/lib/cockpit-copy.js'

void test('Cockpit Locale Catalog: 1:1 key parity between en and id', () => {
  const enKeys = Object.keys(COCKPIT_COPY.en).sort()
  const idKeys = Object.keys(COCKPIT_COPY.id).sort()

  assert.deepEqual(enKeys, idKeys, 'Both catalogs must possess identical keys')
  assert.ok(enKeys.length >= 40, 'Catalog must cover all operational cockpit surfaces')
})

void test('Cockpit Locale Catalog: all values are non-empty strings', () => {
  const locales: CockpitLocale[] = ['en', 'id']
  for (const loc of locales) {
    const catalog = COCKPIT_COPY[loc]
    for (const [key, val] of Object.entries(catalog)) {
      assert.equal(typeof val, 'string', `[${loc}] ${key} must be a string`)
      assert.ok(val.trim().length > 0, `[${loc}] ${key} must not be empty`)
    }
  }
})

void test('Cockpit Locale Catalog: getCockpitCopy fallback behavior', () => {
  assert.equal(getCockpitCopy('en').brandTitle, 'MOONWITNESS COCKPIT')
  assert.equal(getCockpitCopy('id').brandTitle, 'KONSOL COCKPIT MOONWITNESS')

  // Type-cast fallback check
  const fallback = getCockpitCopy('fr' as unknown as CockpitLocale)
  assert.equal(fallback.brandTitle, 'MOONWITNESS COCKPIT', 'Unknown locale must fall back to EN')
})

void test('Cockpit Locale Invariance: machine identifiers and CLI commands are preserved', () => {
  // Indonesian catalog should still mention exact technical tokens where relevant
  const id = COCKPIT_COPY.id
  assert.ok(id.tabLogs.includes('Terminal') || id.tabLogs.includes('Log'))
  assert.ok(id.iframeTitle.includes('Preview') || id.iframeTitle.includes('Pratinjau'))
  assert.ok(id.helpTitle.includes('Cockpit') || id.helpSubtitle.includes('teknisi'))
})
