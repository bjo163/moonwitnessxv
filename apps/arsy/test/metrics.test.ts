import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadConfig } from '../src/config.js'
import { buildApp } from '../src/app.js'
import { adminHeaders, withTestAdmin } from './helpers/auth.js'

/**
 * Metrics module guards. The one failure mode worth testing hard is cardinality:
 * a scrape target that mints a series per URL turns a healthy hub into an OOM
 * the next time something crawls it.
 */
async function makeApp() {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  config.denpa.enabled = false
  return buildApp(config)
}

test('metrics: anonymous scrapes are refused, an admin scrape is plain text', async (t) => {
  const app = await makeApp()
  t.after(() => app.close())

  const anon = await app.inject().get('/api/v1/metrics').end()
  assert.equal(anon.statusCode, 401, 'a scrape target is not a public directory')

  const headers = await adminHeaders(app)
  await app.inject().get('/api/v1/health').end() // give the counters something
  const res = await app.inject().get('/api/v1/metrics').headers(headers).end()
  assert.equal(res.statusCode, 200)
  assert.match(String(res.headers['content-type']), /text\/plain/)
  assert.ok(res.body.startsWith('#'), 'the envelope must not wrap a Prometheus body')

  assert.match(res.body, /# TYPE moonwitness_http_requests_total counter/)
  assert.match(res.body, /# TYPE moonwitness_process_uptime_seconds gauge/)
  assert.match(res.body, /moonwitness_engine_info\{engine="memory"\} 1/)
  assert.match(res.body, /moonwitness_http_requests_total\{method="GET",route="[^"]+",status="2xx"\} \d+/)
})

test('metrics: an id in the path stays one series, not one per id', async (t) => {
  const app = await makeApp()
  t.after(() => app.close())

  const catalog = await app.inject().get('/api/v1/stations?limit=2').end()
  const ids = (catalog.json().data as Array<Record<string, unknown>>).map((row) => String(row.id))
  assert.ok(ids.length >= 2, 'two stations to fetch apart')
  for (const id of ids) await app.inject().get(`/api/v1/stations/${id}`).end()

  const headers = await adminHeaders(app)
  const res = await app.inject().get('/api/v1/metrics').headers(headers).end()
  assert.equal(res.statusCode, 200)

  // the sharp half of the promise: no concrete identifier ever reaches the wire
  for (const id of ids) assert.equal(res.body.includes(id), false, `raw id ${id} leaked into metrics`)
  const perId = res.body.split('\n').filter((line) => line.includes('route="/api/v1/stations/:id"'))
  assert.ok(perId.length > 0, 'the route pattern is what got recorded')
  // count + sum (+ the requests counter) — three lines, never one per id
  assert.ok(perId.length <= 3, `expected one labelled series, got ${perId.length} lines`)
})

test('metrics: a stream is counted open and then counted closed', async (t) => {
  withTestAdmin()
  const config = loadConfig()
  config.logLevel = 'silent'
  config.channels.whatsapp.enabled = false
  config.denpa.enabled = false
  const app = await buildApp(config)
  t.after(() => app.close())
  const headers = await adminHeaders(app)

  const open = () => app.inject().get('/api/v1/on-air?limit=1&seconds=1').end()
  const before = await app.inject().get('/api/v1/metrics').headers(headers).end()
  const openedBefore = Number(/moonwitness_sse_streams_total (\d+)/.exec(before.body)?.[1] ?? 0)

  await open() // the endpoint's own window closes it, no client cooperation needed
  const after = await app.inject().get('/api/v1/metrics').headers(headers).end()
  assert.equal(
    Number(/moonwitness_sse_streams_total (\d+)/.exec(after.body)?.[1]),
    openedBefore + 1,
    'the stream was tallied',
  )
  assert.equal(/moonwitness_sse_streams_open (\d+)/.exec(after.body)?.[1], '0', 'and released again')
})

test('metrics: no metric family is declared twice (a scrape error otherwise)', async (t) => {
  const app = await makeApp()
  t.after(() => app.close())
  const headers = await adminHeaders(app)
  const res = await app.inject().get('/api/v1/metrics').headers(headers).end()

  const declared = [...res.body.matchAll(/^# TYPE (\S+) /gm)].map((m) => m[1])
  const duplicates = declared.filter((name, i) => declared.indexOf(name) !== i)
  assert.deepEqual(duplicates, [], `# TYPE repeated for ${duplicates.join(', ')}`)
})

test('metrics: every sample line is parseable (labels quoted, value numeric)', async (t) => {
  const app = await makeApp()
  t.after(() => app.close())

  const headers = await adminHeaders(app)
  const res = await app.inject().get('/api/v1/metrics').headers(headers).end()
  const samples = res.body.split('\n').filter((line) => line.length > 0 && !line.startsWith('#'))
  assert.ok(samples.length > 5)
  for (const line of samples) {
    const value = line.slice(line.lastIndexOf(' ') + 1)
    assert.ok(Number.isFinite(Number(value)), `sample must end in a number: ${line}`)
    // a label block, if present, must close before the value
    if (line.includes('{')) assert.ok(line.includes('}'), `unbalanced label block: ${line}`)
  }
})
