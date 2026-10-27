import Fastify from 'fastify'
import cors from '@fastify/cors'
import { apiBaseUrl } from '@moonwitness/moonql-client'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { fetchIcyMetadata } from '@moonwitness/core'
import { DEFAULT_MEDIA_CHANNELS, type ChannelItem } from './channels.js'
import { findRepoRoot } from './paths.js'
import type { ProgressTracker } from './progressTracker.js'
import type { MoondeckConfig } from './types.js'
import type { ProcessSupervisor } from './supervisor.js'

function findPublicDir(): string {
  const current = dirname(fileURLToPath(import.meta.url))
  const candidates = [
    resolve(current, '../dist/client'),
    resolve(current, '../../dist/client'),
    resolve(process.cwd(), 'apps/cockpit/dist/client'),
    resolve(process.cwd(), 'apps/cockpit/public'),
    resolve(process.cwd(), 'public'),
    resolve(current, '../public'),
  ]
  for (const c of candidates) {
    if (existsSync(join(c, 'index.html'))) return c
  }
  return resolve(current, '../public')
}

export function createCockpitServer(
  config: MoondeckConfig,
  supervisor: ProcessSupervisor,
  progress: ProgressTracker,
) {
  const hubApiBaseUrl = apiBaseUrl(process.env)
  const app = Fastify({
    logger: false,
  })

  app.register(cors, { origin: true })

  const publicDir = findPublicDir()
  // Deliberately not `resolve(publicDir, '../../..')`: when the Vite bundle wins
  // the lookup that lands on `apps/`, so the ledger read a different file than
  // ProcessSupervisor writes. Both now derive the root the same way.
  const repoRoot = findRepoRoot()
  const errorLogFile = join(repoRoot, 'dev-errors.log')

  // Static assets
  app.get('/', async (_req, reply) => {
    const htmlPath = join(publicDir, 'index.html')
    if (!existsSync(htmlPath)) return reply.code(404).send('Cockpit UI not found')
    reply.type('text/html; charset=utf-8').send(readFileSync(htmlPath, 'utf8'))
  })

  // Static assets from Vite bundle
  app.get('/assets/*', async (req, reply) => {
    const wildcard = (req.params as { '*': string })['*'] ?? ''
    const assetPath = join(publicDir, 'assets', wildcard)
    if (!existsSync(assetPath)) return reply.code(404).send('Asset not found')
    if (assetPath.endsWith('.js')) reply.type('application/javascript; charset=utf-8')
    else if (assetPath.endsWith('.css')) reply.type('text/css; charset=utf-8')
    else if (assetPath.endsWith('.svg')) reply.type('image/svg+xml')
    else if (assetPath.endsWith('.png')) reply.type('image/png')
    return reply.send(readFileSync(assetPath))
  })

  app.get('/cockpit.css', async (_req, reply) => {
    const candidates = [
      join(publicDir, 'cockpit.css'),
      resolve(publicDir, '../public/cockpit.css'),
      resolve(process.cwd(), 'apps/cockpit/public/cockpit.css'),
    ]
    for (const c of candidates) {
      if (existsSync(c)) return reply.type('text/css; charset=utf-8').send(readFileSync(c, 'utf8'))
    }
    return reply.type('text/css; charset=utf-8').send('/* CSS */')
  })

  app.get('/cockpit.js', async (_req, reply) => {
    const candidates = [
      join(publicDir, 'cockpit.js'),
      resolve(publicDir, '../public/cockpit.js'),
      resolve(process.cwd(), 'apps/cockpit/public/cockpit.js'),
    ]
    for (const c of candidates) {
      if (existsSync(c)) return reply.type('application/javascript; charset=utf-8').send(readFileSync(c, 'utf8'))
    }
    return reply.type('application/javascript; charset=utf-8').send('// JS')
  })

  app.get('/favicon.svg', async (_req, reply) => {
    const iconPath = join(publicDir, 'favicon.svg')
    if (existsSync(iconPath)) {
      reply.type('image/svg+xml').send(readFileSync(iconPath, 'utf8'))
    } else {
      reply.type('image/svg+xml').send('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#00e5ff"/></svg>')
    }
  })

  // Cockpit Background Music (BGM)
  app.get('/bgm.mp3', async (_req, reply) => {
    const candidates = [
      join(publicDir, 'bgm.mp3'),
      resolve(publicDir, '../client/public/bgm.mp3'),
      resolve(process.cwd(), 'apps/cockpit/client/public/bgm.mp3'),
      resolve(process.cwd(), 'apps/cockpit/public/bgm.mp3'),
    ]
    for (const c of candidates) {
      if (existsSync(c)) {
        return reply.type('audio/mpeg').send(readFileSync(c))
      }
    }
    return reply.code(404).send('BGM audio not found')
  })

  // Health
  app.get('/health', async () => ({
    status: 'ok',
    app: 'moondeck',
    port: config.port,
    timestamp: new Date().toISOString(),
  }))

  // Configuration
  app.get('/api/config', async () => config)

  const mediaChannels: ChannelItem[] = [...DEFAULT_MEDIA_CHANNELS]

  // Media Channels & Stations (BGM, Radio, IPTV)
  app.get('/api/channels', async () => {
    // Attempt to merge live stations from radio hub if running
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => {
        controller.abort()
      }, 600)
      // the hub's address is the shared contract; a port change must not leave
      // the cockpit silently merging nothing
      const res = await fetch(`${hubApiBaseUrl}/stations?limit=50`, { signal: controller.signal })
      clearTimeout(timer)
      if (res.ok) {
        const body = (await res.json()) as { data?: Array<{ id: string; name: string; streamUrl: string; genre?: string }> }
        if (Array.isArray(body.data)) {
          for (const s of body.data) {
            if (!mediaChannels.some((c) => c.streamUrl === s.streamUrl)) {
              mediaChannels.push({
                id: `radio-${s.id}`,
                name: s.name,
                type: 'radio',
                streamUrl: s.streamUrl,
                genre: s.genre ?? 'Live Radio',
                icon: 'FM',
                country: 'ID',
              })
            }
          }
        }
      }
    } catch {
      /* hub not running, return existing media channels */
    }

    return mediaChannels
  })

  // ICY Audio Stream metadata probe
  app.get('/api/metadata', async (req, reply) => {
    const query = req.query as { url?: string }
    if (!query.url) return reply.code(400).send({ error: 'url parameter required' })
    try {
      const meta = await fetchIcyMetadata(query.url, { timeoutMs: 2500 })
      return meta ?? { artist: null, title: 'Live Audio', rawTitle: 'Live Audio' }
    } catch {
      return { artist: null, title: 'Live Audio', rawTitle: 'Live Audio' }
    }
  })

  app.post('/api/channels', async (req, reply) => {
    const body = req.body as Partial<ChannelItem>
    if (!body.name || !body.streamUrl || !body.type) {
      return reply.code(400).send({ error: 'Name, streamUrl, and type (bgm, radio, iptv) are required' })
    }
    const newChannel: ChannelItem = {
      id: `custom-${Date.now()}`,
      name: body.name,
      type: body.type,
      streamUrl: body.streamUrl,
      genre: body.genre ?? (body.type === 'iptv' ? 'Custom IPTV' : 'Custom Station'),
      icon: body.icon ?? (body.type === 'iptv' ? 'TV' : 'FM'),
      country: body.country ?? 'CUSTOM',
      description: body.description ?? 'User-added custom station/stream',
    }
    mediaChannels.push(newChannel)
    return newChannel
  })

  // TODO register progress — a read-only projection of TODO.md. There is no
  // write path here on purpose: TODO.md stays the sole task/status register.
  app.get('/api/progress', async (_req, reply) => {
    const payload = progress.buildPayload()
    if (!progress.hasSnapshot()) {
      return reply.code(503).send({ ...payload, error: payload.error ?? 'Register not readable yet' })
    }
    return payload
  })

  app.get('/api/todo/tasks', async (req, reply) => {
    const query = req.query as { milestone?: string; status?: string; priority?: string; limit?: string }
    if (!progress.hasSnapshot()) {
      return reply.code(503).send({ error: 'Register not readable yet', rows: [] })
    }
    const snapshot = progress.buildPayload()
    // `Number('abc')` is NaN, and NaN silently returned an empty page.
    const parsedLimit = Number(query.limit)
    const result = progress.queryTasks({
      status: query.status,
      milestone: query.milestone,
      priority: query.priority,
      limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined,
    })
    return { ...result, total: snapshot.total, done: snapshot.done, open: snapshot.open }
  })

  // Status of all services
  app.get('/api/status', async () => {
    return {
      services: supervisor.getStates(),
      system: {
        uptime: process.uptime(),
        node: process.version,
        platform: process.platform,
        pid: process.pid,
      },
    }
  })

  // Log fetch
  app.get('/api/logs', async (req) => {
    const query = req.query as { limit?: string; tag?: string }
    const limit = query.limit ? Math.min(Number(query.limit) || 100, 500) : 100
    return supervisor.getRecentLogs(limit, query.tag)
  })

  // SSE Stream for Real-time logs, state changes and register progress
  app.get('/api/logs/stream', (req, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    reply.raw.setHeader('Cache-Control', 'no-cache, no-transform')
    reply.raw.setHeader('Connection', 'keep-alive')
    reply.raw.setHeader('X-Accel-Buffering', 'no')
    reply.raw.flushHeaders()

    // Send initial batch of recent logs
    const initialLogs = supervisor.getRecentLogs(80)
    reply.raw.write(`event: init\ndata: ${JSON.stringify(initialLogs)}\n\n`)

    // Progress is pushed only when it changes, so an open panel stays current
    // without any client-side polling of the register itself.
    reply.raw.write(`event: progress\ndata: ${JSON.stringify(progress.buildPayload())}\n\n`)

    const onLog = (entry: unknown) => {
      reply.raw.write(`event: log\ndata: ${JSON.stringify(entry)}\n\n`)
    }

    const onState = (state: unknown) => {
      reply.raw.write(`event: state\ndata: ${JSON.stringify(state)}\n\n`)
    }

    const onProgress = (payload: unknown) => {
      reply.raw.write(`event: progress\ndata: ${JSON.stringify(payload)}\n\n`)
    }

    supervisor.on('log', onLog)
    supervisor.on('state', onState)
    progress.on('progress', onProgress)

    // Heartbeat to prevent connection drop
    const heartbeat = setInterval(() => {
      reply.raw.write(': heartbeat\n\n')
    }, 15000)

    req.raw.on('close', () => {
      clearInterval(heartbeat)
      supervisor.off('log', onLog)
      supervisor.off('state', onState)
      progress.off('progress', onProgress)
    })
  })

  // Service control action
  app.post('/api/services/:tag/:action', async (req, reply) => {
    const { tag, action } = req.params as { tag: string; action: string }
    const validActions = ['start', 'stop', 'restart']
    if (!validActions.includes(action)) {
      return reply.code(400).send({ error: `Invalid action "${action}". Must be start, stop, or restart.` })
    }

    let success = false
    if (action === 'start') success = await supervisor.start(tag)
    else if (action === 'stop') success = supervisor.stop(tag)
    else if (action === 'restart') success = await supervisor.restart(tag)

    return {
      tag,
      action,
      success,
      state: supervisor.getState(tag),
    }
  })

  // Bulk control
  app.post('/api/services/start-all', async () => {
    // One batch implementation: the supervisor's ordered, awaited start-all.
    // Per-tag outcomes ride the response so the UI can name what was refused
    // instead of an all-or-nothing flag that hides which service failed.
    const results = await supervisor.startAll()
    const refused = results.filter((r) => !r.started).length
    return {
      success: refused === 0,
      refused,
      results,
      services: supervisor.getStates(),
    }
  })

  app.post('/api/services/stop-all', async () => {
    supervisor.stopAll()
    return { success: true, services: supervisor.getStates() }
  })

  // Error ledger inspection
  app.get('/api/errors', async () => {
    if (!existsSync(errorLogFile)) {
      return { lines: [], total: 0 }
    }
    const text = readFileSync(errorLogFile, 'utf8').trim()
    if (!text) return { lines: [], total: 0 }
    const lines = text.split(/\r?\n/)
    return {
      lines: lines.slice(-200),
      total: lines.length,
      path: errorLogFile,
    }
  })

  app.delete('/api/errors', async () => {
    try {
      if (existsSync(errorLogFile)) {
        writeFileSync(errorLogFile, '', 'utf8')
      }
      return { success: true, cleared: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return { success: false, error: msg }
    }
  })

  // Free ports utility
  app.post('/api/ports/free', async (_req, reply) => {
    try {
      const freeScript = join(repoRoot, 'scripts', 'free-ports.mjs')
      if (existsSync(freeScript)) {
        execFileSync(process.execPath, [freeScript], { stdio: 'ignore' })
        return { success: true, message: 'Ports freed successfully' }
      }
      return reply.code(404).send({ error: 'free-ports.mjs script not found' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return reply.code(500).send({ error: `Failed to free ports: ${msg}` })
    }
  })

  return app
}
