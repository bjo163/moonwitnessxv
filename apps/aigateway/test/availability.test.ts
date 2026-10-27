import assert from 'node:assert/strict'
import { test } from 'node:test'
import { AiRouter } from '../src/router.js'
import { buildServer } from '../src/server.js'

test('gateway stays useful without model inference when AI is not explicitly enabled', async (t) => {
  const original = process.env.AI_ENABLED
  delete process.env.AI_ENABLED
  t.after(() => {
    if (original === undefined) delete process.env.AI_ENABLED
    else process.env.AI_ENABLED = original
  })

  const app = buildServer()
  t.after(() => app.close())

  const providers = await app.inject({ method: 'GET', url: '/v1/providers' })
  assert.deepEqual(providers.json<{ data: Array<{ name: string; available: boolean }> }>().data, [
    { name: 'heuristic', available: true, models: ['heuristic-triage-v1', 'heuristic-fast'], reason: 'Active / configured' },
  ])

  const models = await app.inject({ method: 'GET', url: '/v1/models' })
  const descriptions = models.json<{ data: Array<{ id: string; description: string }> }>().data
  assert.equal(descriptions[0]?.description, 'Automatic cascading router (heuristic)')
  assert.equal(descriptions[1]?.description, 'Alias for automatic cascading router (heuristic)')

  const response = await app.inject({
    method: 'POST', url: '/v1/chat/completions',
    payload: { messages: [{ role: 'user', content: 'hello' }] },
  })
  assert.equal(response.statusCode, 200)
  assert.equal(response.json<{ router_telemetry: { provider: string } }>().router_telemetry.provider, 'heuristic')

  let injectedProviderCalls = 0
  const injectedRouter = new AiRouter([{
    name: 'fixture-provider',
    defaultModel: 'fixture-model-v1',
    supportedModels: ['fixture-model-v1'],
    isAvailable: () => true,
    async chat() {
      injectedProviderCalls += 1
      throw new Error('must remain disabled')
    },
  }])
  const injectedApp = buildServer({ router: injectedRouter })
  t.after(() => injectedApp.close())
  const injectedStatuses = await injectedApp.inject({ method: 'GET', url: '/v1/providers' })
  assert.deepEqual(injectedStatuses.json<{ data: Array<{ name: string }> }>().data.map(({ name }) => name), ['heuristic'])
  const injectedResponse = await injectedApp.inject({
    method: 'POST', url: '/v1/chat/completions',
    payload: { model: 'fixture-model-v1', messages: [{ role: 'user', content: 'hello' }] },
  })
  assert.equal(injectedResponse.statusCode, 200)
  assert.equal(injectedProviderCalls, 0)
})

test('provider failures fall back without exposing raw provider diagnostics', async (t) => {
  const original = process.env.AI_ENABLED
  process.env.AI_ENABLED = 'true'
  t.after(() => {
    if (original === undefined) delete process.env.AI_ENABLED
    else process.env.AI_ENABLED = original
  })
  const router = new AiRouter([{
    name: 'fixture-provider',
    defaultModel: 'fixture-model-v1',
    supportedModels: ['fixture-model-v1'],
    isAvailable: () => true,
    async chat() {
      throw new Error('private-prompt-fragment secret-token-fragment')
    },
  }])
  const app = buildServer({ router })
  t.after(() => app.close())

  const response = await app.inject({
    method: 'POST', url: '/v1/chat/completions',
    payload: { model: 'fixture-model-v1', messages: [{ role: 'user', content: 'hello' }] },
  })
  const body = response.body
  assert.equal(response.statusCode, 200)
  assert.match(body, /fixture-provider:failed/)
  assert.doesNotMatch(body, /private-prompt-fragment|secret-token-fragment/)
  assert.match(body, /"provider":"heuristic"/)
})
