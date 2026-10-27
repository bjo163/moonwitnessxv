import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEFAULT_CONFIG } from '../src/config.js'
import { ProcessSupervisor } from '../src/supervisor.js'
import { ProgressTracker } from '../src/progressTracker.js'
import { resolveRegisterPath } from '../src/paths.js'
import { createCockpitServer } from '../src/server.js'

const CLIENT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'client')

function makeServer() {
  const supervisor = new ProcessSupervisor(DEFAULT_CONFIG)
  const registerPath = resolveRegisterPath()
  const tracker = new ProgressTracker({ filePath: registerPath })
  const app = createCockpitServer(DEFAULT_CONFIG, supervisor, tracker)
  return { app, supervisor, tracker }
}

async function bootToken(app: ReturnType<typeof makeServer>['app']): Promise<string> {
  const res = await app.inject({ method: 'GET', url: '/api/config' })
  return ((JSON.parse(res.body) as { token?: string }).token ?? '')
}

// S1 — the control plane is loopback-only and token-gated for mutating methods.
void test('S1: mutating routes reject a missing token, a foreign Origin, and a rebound Host', async () => {
  const { app, supervisor } = makeServer()
  try {
    const token = await bootToken(app)
    assert.ok(token.length > 0, 'config must deliver the cockpit boot token')

    const noToken = await app.inject({ method: 'POST', url: '/api/services/radio/stop' })
    assert.equal(noToken.statusCode, 401, 'a POST without the token must not run')

    const foreignOrigin = await app.inject({
      method: 'POST',
      url: '/api/services/radio/stop',
      headers: { 'x-moondeck-token': token, origin: 'http://evil.test' },
    })
    assert.equal(foreignOrigin.statusCode, 403, 'a cross-site Origin must be refused')

    const reboundHost = await app.inject({
      method: 'POST',
      url: '/api/services/radio/stop',
      headers: { 'x-moondeck-token': token, host: 'attacker.example' },
    })
    assert.equal(reboundHost.statusCode, 403, 'a DNS-rebinding Host must be refused')

    const ok = await app.inject({
      method: 'POST',
      url: '/api/services/radio/stop',
      headers: { 'x-moondeck-token': token, origin: 'http://127.0.0.1:3004' },
    })
    assert.equal(ok.statusCode, 200, 'same-origin + token is allowed (radio simply not running)')
  } finally {
    await app.close()
    supervisor.stopAll()
  }
})

// S2 — /assets/* cannot climb out of the built assets directory.
void test('S2: /assets path traversal is contained', async () => {
  const { app, supervisor } = makeServer()
  try {
    for (const url of [
      '/assets/../../../package.json',
      '/assets/..%2f..%2fpackage.json',
      '/assets/%2e%2e/%2e%2e/pnpm-workspace.yaml',
    ]) {
      const res = await app.inject({ method: 'GET', url })
      assert.equal(res.statusCode, 404, `${url} must not be served`)
    }
  } finally {
    await app.close()
    supervisor.stopAll()
  }
})

// M2 — the status/state wire is an explicit projection, never the whole state.
void test('M2: /api/status projects service state without lastError', async () => {
  const { app, supervisor } = makeServer()
  try {
    const res = await app.inject({ method: 'GET', url: '/api/status' })
    const body = JSON.parse(res.body) as { services: Array<Record<string, unknown>> }
    assert.ok(body.services.length > 0)
    for (const s of body.services) {
      assert.equal('lastError' in s, false, 'raw English error copy must not ride the wire')
    }
  } finally {
    await app.close()
    supervisor.stopAll()
  }
})

// C1 — the client log contract matches the server field (`tag`, not `service`/`color`).
void test('C1: client LogEntry uses the server tag field', () => {
  const types = readFileSync(join(CLIENT_DIR, 'types.ts'), 'utf8')
  const logEntry = types.match(/interface LogEntry \{[\s\S]*?\}/)
  assert.ok(logEntry, 'LogEntry interface must exist')
  assert.match(logEntry[0], /\btag:/, 'client LogEntry must carry `tag`')
  assert.equal(/interface LogEntry \{[\s\S]*?\bservice:/.test(types), false, 'no `service` field')
  assert.equal(/interface LogEntry \{[\s\S]*?\bcolor:/.test(types), false, 'no `color` field')

  const app = readFileSync(join(CLIENT_DIR, 'App.tsx'), 'utf8')
  assert.equal(/l\.service\b/.test(app), false, 'App must not read a nonexistent l.service')
})

// C1b — the terminal viewer must be fed TerminalLine objects, never strings.
// Passing strings crashed the whole React tree on the first streamed log line
// ("blank screen after Start All"), and the client is outside the typecheck gate.
void test('C1b: CockpitLogsView passes TerminalLine objects to TerminalViewer', () => {
  const view = readFileSync(join(CLIENT_DIR, 'components', 'CockpitLogsView.tsx'), 'utf8')
  assert.match(view, /import type \{ TerminalLine \} from '@moonwitness\/moonui'/, 'must import the viewer line type')
  assert.equal(/filteredLogs:\s*string\[\]/.test(view), false, 'string[] log lines are exactly what crashed the app')
  assert.match(view, /lines=\{logLines\}/, 'viewer receives the object array')

  const app = readFileSync(join(CLIENT_DIR, 'App.tsx'), 'utf8')
  assert.match(app, /const logLines = useMemo<TerminalLine\[\]>/, 'App builds TerminalLine objects')
  assert.match(app, /id: l\.id/, 'object mapping carries the log id')
})

// Ports truth — /api/status must report real listeners, not only cockpit children.
void test('Ports: /api/status reports portStatus for every configured service', async () => {
  const { app, supervisor } = makeServer()
  try {
    const res = await app.inject({ method: 'GET', url: '/api/status' })
    const body = JSON.parse(res.body) as { portStatus?: Record<string, boolean> }
    assert.ok(body.portStatus, 'status must include the listener probe')
    for (const svc of DEFAULT_CONFIG.services) {
      assert.equal(
        typeof body.portStatus[svc.tag],
        'boolean',
        `portStatus must answer for ${svc.tag}`,
      )
    }
    // The map is keyed by supervised service tag only (the cockpit host row is
    // rendered from config.port on the client, not probed as a supervised child).
    assert.equal(Object.keys(body.portStatus).length, DEFAULT_CONFIG.services.length)
    assert.equal('cockpit' in body.portStatus, false, 'the supervisor itself is not a supervised service')
  } finally {
    await app.close()
    supervisor.stopAll()
  }
})

// C2 — the Ports/Preview views derive from /api/config instead of a static port table.
void test('C2: Ports & Preview views hardcode no ports and drop the static maps', () => {
  const ports = readFileSync(join(CLIENT_DIR, 'components', 'CockpitPortsView.tsx'), 'utf8')
  const preview = readFileSync(join(CLIENT_DIR, 'components', 'CockpitPreviewView.tsx'), 'utf8')
  assert.equal(/COCKPIT_PORT_MAP|PREVIEW_SHORTCUTS/.test(ports + preview), false, 'static maps must be gone')
  for (const src of [ports, preview]) {
    assert.equal(/:\d{4}\b/.test(src), false, 'no literal :<port> may remain in a derived view')
  }
  assert.match(ports, /config\.services/, 'PortsView must render from config.services')
  assert.match(preview, /config\.services/, 'PreviewView must render from config.services')
})

// L1 — the legacy vanilla fallback stays a fallback, not a second source of truth.
void test('L1: legacy public UI derives from /api/config and echoes the token', () => {
  const legacy = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'cockpit.js'), 'utf8')
  assert.match(legacy, /appConfig\.services/, 'legacy grid/shortcuts must derive from /api/config')
  assert.match(legacy, /x-moondeck-token/, 'legacy mutating calls must echo the boot token')
  assert.equal(/:\d{4}\b/.test(legacy), false, 'no hard-coded port may remain in the fallback UI')
})
