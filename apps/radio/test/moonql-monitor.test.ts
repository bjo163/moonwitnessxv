import { test } from 'node:test'
import assert from 'node:assert/strict'
import Fastify from 'fastify'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import base from '@moonwitness/moonql-base'
import auth from '@moonwitness/moonql-auth'
import apikeys from '@moonwitness/moonql-apikeys'
import monitor from '@moonwitness/moonql-monitor'
import { createMoonClient } from '@moonwitness/moonql-client'
import { runSentinelCycle, parseFeedXml } from '@moonwitness/sentinel'
import envelope from '../src/plugins/envelope.js'

const ADMIN_PASSWORD = 'monitor-admin-pass'

async function makeApp() {
  const app = Fastify({ logger: false })
  const moonql = await bootMoonQl({
    addons: [base, auth, apikeys, monitor],
    env: { MOONQL_AUTH_ADMIN_PASSWORD: ADMIN_PASSWORD },
    cronEnabled: false,
    log: { info: () => {}, warn: () => {} },
  })
  await app.register(envelope)
  await app.register(moonqlRest, { prefix: '/orm', instance: moonql })
  await app.ready()

  const login = await app.inject().post('/orm/auth/login').body({ login: 'admin', password: ADMIN_PASSWORD }).end()
  const token = login.json().data.token as string
  const headers = { authorization: `Bearer ${token}` }
  return { app, moonql, token, headers }
}

test('monitor: 3-tier hierarchy seeds radars, sources, and signals with resolved relations', async (t) => {
  const { app } = await makeApp()
  t.after(() => app.close())

  const overviewRes = await app.inject().get('/orm/monitor/overview').end()
  assert.equal(overviewRes.statusCode, 200)
  const overview = overviewRes.json().data as {
    counts: { radars: number; sources: number; signals: number }
    radars: Array<{ id: string; code: string; sourceCount: number; signalCount: number }>
  }

  assert.ok(overview.counts.radars >= 10, 'at least 10 seeded radars')
  assert.ok(overview.counts.sources >= 10, 'at least 10 seeded sources')
  assert.ok(overview.counts.signals >= 10, 'at least 10 seeded signals')

  const civic = overview.radars.find((r) => r.code === 'yt-indonesia-civic')
  assert.ok(civic, 'yt-indonesia-civic radar exists')
  assert.ok(civic!.sourceCount >= 1, 'radar is linked to its child sources')
  assert.ok(civic!.signalCount >= 1, 'radar is linked to its child signals')

  const feedRes = await app.inject().get('/orm/monitorSignalFeed?limit=5').end()
  assert.equal(feedRes.statusCode, 200)
  const feedRows = feedRes.json().data as Array<{
    title?: string
    sourceRefRecord?: { handle?: string }
    radarRefRecord?: { code?: string }
  }>
  assert.ok(feedRows.length >= 5)
  assert.equal(typeof feedRows[0]!.sourceRefRecord?.handle, 'string', 'sourceRef is expanded')
  assert.equal(typeof feedRows[0]!.radarRefRecord?.code, 'string', 'radarRef is expanded')
})

test('monitor + sentinel: claim -> collect -> deduplicated ingest lifecycle', async (t) => {
  const { app, token } = await makeApp()
  t.after(() => app.close())

  const injectFetch: typeof fetch = async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input.toString())
    const reqHeaders: Record<string, string> = {}
    if (init?.headers) {
      for (const [k, v] of Object.entries(init.headers as Record<string, string>)) {
        reqHeaders[k] = v
      }
    }
    const res = await app.inject({
      method: (init?.method ?? 'GET') as 'GET' | 'POST' | 'PATCH' | 'DELETE',
      url: `${url.pathname}${url.search}`,
      headers: reqHeaders,
      payload: typeof init?.body === 'string' ? init.body : undefined,
    })
    return new Response(res.body, {
      status: res.statusCode,
      headers: res.headers as Record<string, string>,
    })
  }

  const client = createMoonClient({
    baseUrl: 'http://hub.local/orm',
    token,
    fetch: injectFetch,
  })

  // Run a full Sentinel worker cycle (claims least-recently-checked source and ingests signal)
  const cycle = await runSentinelCycle(client, {
    hubApiUrl: 'http://hub.local/orm',
    token,
    workerId: 'sentinel-test-01',
    drivers: ['rss', 'api', 'playwright', 'openclaw', 'agent'],
    pollIntervalMs: 5000,
    egressEnabled: false,
  })

  assert.equal(cycle.claimed, true)
  assert.ok(cycle.taskId)
  assert.ok(cycle.sourceHandle)
  assert.ok(cycle.ingested >= 1)

  // Verify deduplication on /monitor/ingest for the same (sourceRef, externalId)
  const sources = (await app.inject().get('/orm/monitor_sources?limit=1').end()).json().data as Array<{ id: string }>
  const sourceId = sources[0]!.id

  const first = await app
    .inject()
    .post('/orm/monitor/ingest')
    .headers({ authorization: `Bearer ${token}` })
    .body({
      sourceRef: sourceId,
      externalId: 'yt:dedup-check-99',
      title: 'Initial Capture Title',
      url: 'https://www.youtube.com/watch?v=dedup99',
      urgencyScore: 60,
    })
    .end()
  assert.equal(first.statusCode, 201)
  assert.equal(first.json().data.deduplicated, false)

  const second = await app
    .inject()
    .post('/orm/monitor/ingest')
    .headers({ authorization: `Bearer ${token}` })
    .body({
      sourceRef: sourceId,
      externalId: 'yt:dedup-check-99',
      title: 'Updated Capture Title',
      url: 'https://www.youtube.com/watch?v=dedup99',
      urgencyScore: 85,
    })
    .end()
  assert.equal(second.statusCode, 200)
  assert.equal(second.json().data.deduplicated, true)
  assert.equal(second.json().data.signal.title, 'Updated Capture Title')
  assert.equal(second.json().data.signal.urgencyScore, 85)
})

test('sentinel: parseFeedXml extracts YouTube Atom XML entries accurately', () => {
  const sampleAtom = `<?xml version="1.0" encoding="UTF-8"?>
  <feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
    <entry>
      <yt:videoId>abc123xyz</yt:videoId>
      <title>Investigasi Banjir &amp; Darurat Iklim Jakarta</title>
      <link rel="alternate" href="https://www.youtube.com/watch?v=abc123xyz"/>
      <author><name>Narasi TV</name></author>
      <published>2026-10-25T10:00:00+00:00</published>
      <media:group>
        <media:description>Laporan khusus lapangan.</media:description>
        <media:community>
          <media:starRating count="1450" average="5.00" min="1" max="5"/>
          <media:statistics views="52300"/>
        </media:community>
      </media:group>
    </entry>
  </feed>`

  const parsed = parseFeedXml(
    sampleAtom,
    {
      id: 's1',
      handle: 'yt-narasi',
      name: 'Narasi TV',
      platform: 'youtube',
      kind: 'channel',
      driver: 'rss',
      targetUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=123',
      externalTarget: '123',
    },
    'critical',
  )

  assert.equal(parsed.length, 1)
  assert.equal(parsed[0]!.externalId, 'youtube:abc123xyz')
  assert.equal(parsed[0]!.title, 'Investigasi Banjir & Darurat Iklim Jakarta')
  assert.equal(parsed[0]!.viewsCount, 52300)
  assert.equal(parsed[0]!.likesCount, 1450)
  assert.equal(parsed[0]!.sentiment, 'alert')
  assert.ok((parsed[0]!.urgencyScore ?? 0) >= 90)
})
