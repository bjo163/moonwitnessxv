import assert from 'node:assert/strict'
import { test } from 'node:test'
import { AiRouter } from '../src/router.js'
import { buildServer } from '../src/server.js'
import { localizedProviderStatuses } from '../src/presentation.js'

test('provider and model descriptions honor only supported UI languages', async (t) => {
  const router = new AiRouter([{
    name: 'fixture-provider',
    defaultModel: 'fixture-model-v1',
    supportedModels: ['fixture-model-v1'],
    isAvailable: () => false,
    async chat() {
      throw new Error('unused')
    },
  }])
  const app = buildServer({ router })
  t.after(() => app.close())

  const indonesian = await app.inject({
    method: 'GET', url: '/v1/providers', headers: { 'accept-language': 'id-ID,en;q=0.8' },
  })
  const status = indonesian.json<{ object: string; data: Array<{ name: string; available: boolean; models: string[]; reason: string }> }>()
  assert.equal(indonesian.statusCode, 200)
  assert.equal(indonesian.headers.vary, 'Accept-Language')
  assert.equal(status.object, 'list')
  assert.deepEqual(status.data, [{
    name: 'fixture-provider',
    available: false,
    models: ['fixture-model-v1'],
    reason: 'Kunci API tidak tersedia atau layanan sedang offline',
  }])

  const models = await app.inject({
    method: 'GET', url: '/v1/models', headers: { 'accept-language': 'id' },
  })
  const modelList = models.json<{ data: Array<{ id: string; owned_by: string; description: string }> }>()
  assert.equal(models.headers.vary, 'Accept-Language')
  assert.deepEqual(modelList.data.map(({ id, owned_by }) => [id, owned_by]), [
    ['free', 'router'],
    ['auto', 'router'],
    ['fixture-model-v1', 'fixture-provider'],
  ])
  assert.match(modelList.data[0]?.description ?? '', /^Router otomatis/)
  assert.equal(modelList.data[2]?.description, 'Model provider langsung pada fixture-provider')

  const unsupported = await app.inject({
    method: 'GET', url: '/v1/providers', headers: { 'accept-language': 'fr, id;q=0' },
  })
  assert.equal(unsupported.json<{ data: Array<{ reason: string }> }>().data[0]?.reason, 'Missing API key or offline')
})

test('validation copy localizes without changing HTTP or OpenAI error contracts', async (t) => {
  const app = buildServer({ router: new AiRouter([]) })
  t.after(() => app.close())

  const idResponse = await app.inject({
    method: 'POST', url: '/v1/chat/completions',
    headers: { 'accept-language': 'id', 'content-type': 'application/json' },
    payload: { messages: [] },
  })
  assert.equal(idResponse.statusCode, 400)
  assert.equal(idResponse.headers.vary, 'Accept-Language')
  assert.deepEqual(idResponse.json(), {
    error: {
      message: 'Permintaan tidak valid: array "messages" wajib diisi dan tidak boleh kosong.',
      type: 'invalid_request_error',
      param: 'messages',
      code: null,
    },
  })

  const defaultResponse = await app.inject({
    method: 'POST', url: '/v1/embeddings',
    headers: { 'accept-language': 'unsupported', 'content-type': 'application/json' },
    payload: {},
  })
  assert.equal(defaultResponse.statusCode, 400)
  assert.deepEqual(defaultResponse.json(), {
    error: {
      message: 'Invalid request: "input" parameter is required.',
      type: 'invalid_request_error',
      param: 'input',
      code: null,
    },
  })
})

test('health and runtime provider failures keep nonlocalized machine/raw output', async (t) => {
  const router = new AiRouter([{
    name: 'fixture-provider',
    defaultModel: 'fixture-model-v1',
    supportedModels: ['fixture-model-v1'],
    isAvailable: () => true,
    async chat() {
      throw new Error('Provider unavailable')
    },
  }])
  const app = buildServer({ router })
  t.after(() => app.close())

  const health = await app.inject({ method: 'GET', url: '/health', headers: { 'accept-language': 'id' } })
  assert.equal(health.json<{ providers: Array<{ reason: string }> }>().providers[0]?.reason, 'Active / Configured')

  const failure = await app.inject({
    method: 'POST', url: '/v1/chat/completions',
    headers: { 'accept-language': 'id', 'content-type': 'application/json' },
    payload: { model: 'fixture-model-v1', messages: [{ role: 'user', content: 'hello' }] },
  })
  assert.equal(failure.statusCode, 200)
  const completion = failure.json<{ router_telemetry: { attempts: string[] } }>()
  assert.ok(completion.router_telemetry.attempts[0]?.includes('Provider unavailable'))
})

test('unknown provider diagnostics are preserved verbatim', () => {
  assert.deepEqual(localizedProviderStatuses([{
    name: 'fixture-provider',
    available: false,
    models: ['fixture-model-v1'],
    reason: 'Provider temporarily rejected this region',
  }], 'id'), [{
    name: 'fixture-provider',
    available: false,
    models: ['fixture-model-v1'],
    reason: 'Provider temporarily rejected this region',
  }])
})
