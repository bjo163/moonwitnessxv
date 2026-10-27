import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildServer } from '../../aigateway/src/server.js'
import { HeuristicProvider } from '../../aigateway/src/providers/heuristic.js'

test('AI Gateway: health check returns ok, port, and provider states', async () => {
  const app = buildServer()
  const res = await app.inject({
    method: 'GET',
    url: '/health',
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload) as {
    status: string
    service: string
    port: number
    providers: Array<{ name: string; available: boolean }>
  }
  assert.equal(body.status, 'ok')
  assert.equal(body.service, 'moonwitness-aigateway')
  assert.equal(body.port, 3003)
  assert.ok(Array.isArray(body.providers))
  assert.ok(body.providers.some((p) => p.name === 'heuristic' && p.available === true))
})

test('AI Gateway: /v1/models exposes free-first models and provider mappings when explicitly enabled', async (t) => {
  const originalAiEnabled = process.env.AI_ENABLED
  process.env.AI_ENABLED = 'true'
  t.after(() => {
    if (originalAiEnabled === undefined) delete process.env.AI_ENABLED
    else process.env.AI_ENABLED = originalAiEnabled
  })

  const app = buildServer()
  t.after(() => app.close())
  const res = await app.inject({
    method: 'GET',
    url: '/v1/models',
  })

  assert.equal(res.statusCode, 200)
  const body = JSON.parse(res.payload) as {
    object: string
    data: Array<{ id: string; pricing?: string }>
  }
  assert.equal(body.object, 'list')
  const modelIds = body.data.map((m) => m.id)
  assert.ok(modelIds.includes('free'))
  assert.ok(modelIds.includes('auto'))
  assert.ok(modelIds.includes('gemini-2.5-flash'))
  assert.ok(modelIds.includes('llama-3.3-70b-versatile'))
  assert.ok(modelIds.includes('heuristic-triage-v1'))
})

test('AI Gateway: validation rejects empty or missing messages with 400', async () => {
  const app = buildServer()
  const res = await app.inject({
    method: 'POST',
    url: '/v1/chat/completions',
    payload: { messages: [] },
  })

  assert.equal(res.statusCode, 400)
  const body = JSON.parse(res.payload) as { error: { message: string } }
  assert.ok(body.error.message.includes('messages'))
})

test('AI Gateway: cascading router falls back to Heuristic when remote keys are absent and AI is enabled', async (t) => {
  // Ensure no remote keys are active during this test
  const originalAiEnabled = process.env.AI_ENABLED
  const originalGemini = process.env.GEMINI_API_KEY
  const originalGroq = process.env.GROQ_API_KEY
  const originalOpenRouter = process.env.OPENROUTER_API_KEY
  const originalOllama = process.env.OLLAMA_DISABLED

  process.env.AI_ENABLED = 'true'
  delete process.env.GEMINI_API_KEY
  delete process.env.GROQ_API_KEY
  delete process.env.OPENROUTER_API_KEY
  process.env.OLLAMA_DISABLED = 'true'

  t.after(() => {
    if (originalAiEnabled === undefined) delete process.env.AI_ENABLED
    else process.env.AI_ENABLED = originalAiEnabled
    if (originalGemini === undefined) delete process.env.GEMINI_API_KEY
    else process.env.GEMINI_API_KEY = originalGemini
    if (originalGroq === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = originalGroq
    if (originalOpenRouter === undefined) delete process.env.OPENROUTER_API_KEY
    else process.env.OPENROUTER_API_KEY = originalOpenRouter
    if (originalOllama === undefined) delete process.env.OLLAMA_DISABLED
    else process.env.OLLAMA_DISABLED = originalOllama
  })

  const app = buildServer()
  try {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: {
        model: 'free',
        messages: [
          { role: 'system', content: 'You are an OSINT triage analyst.' },
          { role: 'user', content: 'Laporan banjir dan darurat evakuasi warga di pesisir' },
        ],
        temperature: 0.2,
      },
    })

    assert.equal(res.statusCode, 200)
    const body = JSON.parse(res.payload) as {
      id: string
      object: string
      choices: Array<{ message: { role: string; content: string } }>
      router_telemetry: { provider: string; model_used: string; attempts?: string[] }
    }

    assert.equal(body.object, 'chat.completion')
    assert.equal(body.router_telemetry.provider, 'heuristic')
    assert.ok(body.choices[0]?.message.content.includes('ALERT') || body.choices[0]?.message.content.includes('urgency score'))
    assert.ok(body.router_telemetry.attempts?.includes('gemini:skipped(not_configured)'))
    assert.ok(body.router_telemetry.attempts?.includes('heuristic:success'))
  } finally {
    await app.close()
  }
})

test('HeuristicProvider: scores positive and critical indicators accurately', async () => {
  const provider = new HeuristicProvider()

  const criticalRes = await provider.chat({
    messages: [{ role: 'user', content: 'Investigasi kebocoran database dan vulnerability remote exploit' }],
  })
  assert.ok(criticalRes.choices[0]?.message.content.includes('CRITICAL'))
  assert.ok(criticalRes.choices[0]?.message.content.includes('86/100'))

  const positiveRes = await provider.chat({
    messages: [{ role: 'user', content: 'Peluncuran satelit sukses dan rekor baru industri antariksa' }],
  })
  assert.ok(positiveRes.choices[0]?.message.content.includes('POSITIVE'))
  assert.ok(positiveRes.choices[0]?.message.content.includes('68/100'))
})
