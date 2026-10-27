import { test } from 'node:test'
import assert from 'node:assert/strict'
import { apiBaseUrl } from '@moonwitness/moonql-client'
import { DEFAULT_CONFIG } from '../src/config.js'
import { ProgressTracker } from '../src/progressTracker.js'
import { ProcessSupervisor } from '../src/supervisor.js'
import { resolveRegisterPath } from '../src/paths.js'
import { createCockpitServer } from '../src/server.js'

void test('shared Hub URL contract prefers matching ARSY/RADIO aliases and trims trailing slashes', () => {
  assert.equal(apiBaseUrl({ ARSY_API_URL: 'https://hub.example/api/v1///', RADIO_API_URL: 'https://hub.example/api/v1///' }), 'https://hub.example/api/v1')
  assert.throws(
    () => apiBaseUrl({ ARSY_API_URL: 'https://new.example', RADIO_API_URL: 'https://old.example' }),
    /Conflicting Hub URL settings/,
  )
})

void test('Cockpit station merge uses the configured ARSY API URL', async () => {
  const previousArsy = process.env.ARSY_API_URL
  const previousRadio = process.env.RADIO_API_URL
  const originalFetch = globalThis.fetch
  let requestedUrl = ''
  process.env.ARSY_API_URL = 'https://arsy.example/api/v1/'
  delete process.env.RADIO_API_URL
  globalThis.fetch = (async (input: URL | RequestInfo) => {
    requestedUrl = String(input)
    return new Response(JSON.stringify({ data: [{ id: 'contract-test', name: 'Contract station', streamUrl: 'https://stream.example/live' }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }) as typeof fetch

  const tracker = new ProgressTracker({ filePath: resolveRegisterPath() })
  const app = createCockpitServer(DEFAULT_CONFIG, new ProcessSupervisor(DEFAULT_CONFIG), tracker)
  try {
    const response = await app.inject({ method: 'GET', url: '/api/channels' })
    assert.equal(response.statusCode, 200)
    assert.equal(requestedUrl, 'https://arsy.example/api/v1/stations?limit=50')
    assert.ok((JSON.parse(response.body) as Array<{ id: string }>).some((channel) => channel.id === 'radio-contract-test'))
  } finally {
    await app.close()
    globalThis.fetch = originalFetch
    if (previousArsy === undefined) delete process.env.ARSY_API_URL
    else process.env.ARSY_API_URL = previousArsy
    if (previousRadio === undefined) delete process.env.RADIO_API_URL
    else process.env.RADIO_API_URL = previousRadio
  }
})

void test('Cockpit fails closed when ARSY and legacy RADIO URLs disagree', () => {
  const previousArsy = process.env.ARSY_API_URL
  const previousRadio = process.env.RADIO_API_URL
  process.env.ARSY_API_URL = 'https://new.example'
  process.env.RADIO_API_URL = 'https://old.example'
  try {
    assert.throws(
      () => createCockpitServer(DEFAULT_CONFIG, new ProcessSupervisor(DEFAULT_CONFIG), new ProgressTracker({ filePath: resolveRegisterPath() })),
      /Conflicting Hub URL settings/,
    )
  } finally {
    if (previousArsy === undefined) delete process.env.ARSY_API_URL
    else process.env.ARSY_API_URL = previousArsy
    if (previousRadio === undefined) delete process.env.RADIO_API_URL
    else process.env.RADIO_API_URL = previousRadio
  }
})
