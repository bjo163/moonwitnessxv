import assert from 'node:assert/strict'
import { test } from 'node:test'
import { API_PREFIX, PORTS } from '@moonwitness/core'
import { parseConfig } from '../src/config.js'

void test('ARSY config prefers preferred names while preserving equal legacy aliases', () => {
  const config = parseConfig({
    ARSY_PORT: '3000',
    RADIO_PORT: '3000',
    PORT: '3000',
    ARSY_PREFIX: '/api/v2',
    RADIO_PREFIX: '/api/v2',
    API_PREFIX: '/api/v2',
    ARSY_TITLE: 'ARSY API',
    RADIO_TITLE: 'ARSY API',
    API_TITLE: 'ARSY API',
  })

  assert.equal(config.port, 3000)
  assert.equal(config.api.prefix, '/api/v2')
  assert.equal(config.api.title, 'ARSY API')
})

void test('RADIO and generic names remain compatible when used alone', () => {
  const legacy = parseConfig({ RADIO_PORT: '3100', RADIO_PREFIX: '/legacy', RADIO_TITLE: 'Legacy Hub' })
  assert.equal(legacy.port, 3100)
  assert.equal(legacy.api.prefix, '/legacy')
  assert.equal(legacy.api.title, 'Legacy Hub')

  const generic = parseConfig({ PORT: '3200', API_PREFIX: '/generic', API_TITLE: 'Generic Hub' })
  assert.equal(generic.port, 3200)
  assert.equal(generic.api.prefix, '/generic')
  assert.equal(generic.api.title, 'Generic Hub')

  const defaults = parseConfig({})
  assert.equal(defaults.port, PORTS.hub)
  assert.equal(defaults.api.prefix, API_PREFIX)
})

void test('conflicting configured server aliases fail closed', () => {
  assert.throws(() => parseConfig({ ARSY_PORT: '3100', RADIO_PORT: '3200' }), /Conflicting environment aliases for ARSY_PORT/)
  assert.throws(() => parseConfig({ ARSY_PREFIX: '/new', API_PREFIX: '/old' }), /Conflicting environment aliases for ARSY_PREFIX/)
  assert.throws(() => parseConfig({ RADIO_TITLE: 'Radio', API_TITLE: 'ARSY' }), /Conflicting environment aliases for ARSY_TITLE/)
})
