import Fastify from 'fastify'
import cors from '@fastify/cors'
import { apiBaseUrl } from '@moonwitness/moonql-client'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { fetchIcyMetadata } from '@moonwitness/core'
import { DEFAULT_MEDIA_CHANNELS, type ChannelItem } from './channels.js'
import { findRepoRoot } from './paths.js'
import type { ProgressTracker } from './progressTracker.js'
import type { MoondeckConfig, ServiceState } from './types.js'
import type { ProcessSupervisor } from './supervisor.js'

// Cockpit binds loopback only; a browser request whose Origin or Host is not a
// loopback name is either cross-site (CSRF) or a DNS-rebinding attempt, so it
// never reaches the control plane. Non-browser callers send no Origin.
const LOOPBACK_HOST = /^(\[::1\]|127\.0\.0\.1|localhost)(:\d{1,5})?$/
const LOOPBACK_ORIGIN = /^https?:\/\/(\[::1\]|127\.0\.0\.1|localhost)(:\d{1,5})?$/
const TOKEN_HEADER = 'x-moondeck-token'
const MUTATING_METHODS = new Set(['POST', 'DELETE', 'PUT', 'PATCH'])
const MAX_CHANNELS = 200

/** Project a ServiceState onto only the fields the wire should carry (M2). */
function publicServiceState(s: ServiceState | undefined): unknown {
  if (!s) return undefined
  return {
    tag: s.tag,
    name: s.name,
    pkg: s.pkg,
    status: s.status,
    pid: s.pid,
    port: s.port,
    uptimeSeconds: s.uptimeSeconds,
    restarts: s.restarts,
    lastErrorCode: s.lastErrorCode,
    lastErrorPort: s.lastErrorPort,
  }
}

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

  // A fresh per-boot token, delivered only to the same-origin built client via
  // /api/config and echoed on every mutating request. It is a CSRF guard for a
  // loopback control surface, not a secret store or an identity system. Uses the
  // Web Crypto global so the restricted `node:crypto` import stays out of here.
  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`

  app.register(cors, {
    origin: (origin, cb) => {
      cb(null, origin ? LOOPBACK_ORIGIN.test(origin) : false)
    },
  })

  app.addHook('preHandler', (req, reply, done) => {
    if (!MUTATING_METHODS.has(req.method)) {
      done()
      return
    }
    const host = req.headers.host ?? ''
    if (!LOOPBACK_HOST.test(host)) {
      void reply.code(403).send({ error: 'forbidden host' })
      done()
      return
    }
    const origin = req.headers.origin
    if (origin !== undefined && !LOOPBACK_ORIGIN.test(origin)) {
      void reply.code(403).send({ error: 'cross-origin request rejected' })
      done()
      return
    }
    if (req.headers[TOKEN_HEADER] !== token) {
      void reply.code(401).send({ error: 'missing or invalid cockpit token' })
      done()
      return
    }
    done()
  })

  const publicDir = findPublicDir()
  // Deliberately not `resolve(publicDir, '../../..')`: when the Vite bundle wins
  // the lookup that lands on `apps/`, so the ledger read a different file than
  // ProcessSupervisor writes. Both now derive the root the same way.
  const repoRoot = findRepoRoot()
  const errorLogFile = join(repoRoot, 'dev-errors.log')

  // Static assets — the built React bundle (dist/client) is the only UI. The
  // former vanilla fallback (public/index.html + cockpit.js + cockpit.css) was a
  // second, drifting copy of the same surface and has been removed.
  app.get('/', async (_req, reply) => {
    const htmlPath = join(publicDir, 'index.html')
    if (!existsSync(htmlPath)) {
      return reply
        .code(404)
        .type('text/plain; charset=utf-8')
        .send('Cockpit UI not built. Run: pnpm --filter @moonwitness/cockpit build')
    }
    reply.type('text/html; charset=utf-8').send(readFileSync(htmlPath, 'utf8'))
  })

  // Static assets from Vite bundle
  app.get('/assets/*', async (req, reply) => {
    const wildcard = (req.params as { '*': string })['*'] ?? ''
    const assetRoot = resolve(publicDir, 'assets')
    const assetPath = resolve(assetRoot, wildcard)
    // Contain within the assets dir (block `../` traversal) and only serve known
    // static types.
    if (assetPath !== assetRoot && !assetPath.startsWith(assetRoot + sep)) {
      return reply.code(404).send('Asset not found')
    }
    const ext = assetPath.slice(assetPath.lastIndexOf('.')).toLowerCase()
    const types: Record<string, string> = {
      '.js': 'application/javascript; charset=utf-8',
      '.mjs': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.woff2': 'font/woff2',
      '.ico': 'image/x-icon',
    }
    const mime = types[ext]
    if (!mime || !existsSync(assetPath)) {
      return reply.code(404).send('Asset not found')
    }
    reply.type(mime)
    return reply.send(readFileSync(assetPath))
  })

  // Legacy vanilla UI (public/cockpit.css + public/cockpit.js). It is kept only
  // as an unbuilt-source fallback; the built React bundle in dist/client always
  // wins findPublicDir(). Its data (service cards, ports, preview shortcuts) is
  // derived from /api/config inside cockpit.js, so it cannot drift from the
  // registry, and it echoes the boot token on mutating calls like the React UI.
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

  // Configuration (plus the boot token, readable only same-origin because CORS
  // refuses non-loopback origins). The client echoes it on mutating requests.
  app.get('/api/config', async () => ({ ...config, token }))

  const mediaChannels: ChannelItem[] = [...DEFAULT_MEDIA_CHANNELS]
  let channelSeq = 0

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
    if (!['bgm', 'radio', 'iptv'].includes(body.type)) {
      return reply.code(400).send({ error: 'type must be one of bgm, radio, iptv' })
    }
    let parsedUrl: URL
    try {
      parsedUrl = new URL(body.streamUrl)
    } catch {
      return reply.code(400).send({ error: 'streamUrl must be a valid absolute URL' })
    }
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return reply.code(400).send({ error: 'streamUrl must use the http or https scheme' })
    }
    // Bounded in-memory list; a long-lived session must not grow without limit.
    if (mediaChannels.length >= MAX_CHANNELS) {
      return reply.code(409).send({ error: `channel list is full (max ${String(MAX_CHANNELS)})` })
    }
    const newChannel: ChannelItem = {
      id: `custom-${Date.now().toString(36)}-${String(++channelSeq)}`,
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
    // portStatus answers "is anything listening on this service's port" —
    // including a listener the operator started outside the cockpit. Without it
    // the Ports tab called an occupied port IDLE/FREE, since serviceStates only
    // tracks children this supervisor spawned.
    const portStatus = Object.fromEntries(
      await Promise.all(
        config.services.map(async (svc) => [svc.tag, svc.port === undefined ? false : await supervisor.isPortListening(svc)] as const),
      ),
    )
    return {
      services: supervisor.getStates().map(publicServiceState),
      portStatus,
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
      const projected = publicServiceState(state as ServiceState)
      reply.raw.write(`event: state\ndata: ${JSON.stringify(projected)}\n\n`)
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
      state: publicServiceState(supervisor.getState(tag)),
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
      services: supervisor.getStates().map(publicServiceState),
    }
  })

  app.post('/api/services/stop-all', async () => {
    supervisor.stopAll()
    return { success: true, services: supervisor.getStates().map(publicServiceState) }
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
