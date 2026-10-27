#!/usr/bin/env node
/**
 * Dev runner for every runnable app in this monorepo.
 *
 * The inventory lives in `scripts/apps.registry.mjs` — not here. That module is
 * what `pnpm ports:free`, `pnpm apps`, the Cockpit config and the contract tests
 * read, so a new app is added once instead of four times.
 *
 * Why not `pnpm --parallel`? It makes the child Next.js processes start with a
 * non-development NODE_ENV ("You are using a non-standard NODE_ENV value"),
 * and Ctrl+C on Windows kills only pnpm, leaving the Next.js children bound to
 * :3001/:3002/:3003 so the next `pnpm dev` dies with EADDRINUSE.
 *
 * This runner starts every app as a plain `pnpm --filter <pkg> dev`, prefixes
 * the output with distinct service colors, cleans Pino JSON into readable logs,
 * highlights ERROR lines in bold red, logs errors to `dev-errors.log`,
 * and provides interactive hotkeys to launch any frontend/API in browser with 1 key.
 *
 *   pnpm dev                         # build libs, then run every runnable app
 *   node scripts/dev.mjs arsy,dock   # subset (radio remains a transition alias)
 */
import { spawn, execFileSync } from 'node:child_process'
import { createInterface } from 'node:readline'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveHubPort, waitForPortsFree } from './port-utils.mjs'
import { ALIASES, APPS } from './apps.registry.mjs'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const LOG_FILE = join(repoRoot, 'dev-errors.log')

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
  boldWhite: '\x1b[1;37m',
  red: '\x1b[31m',
  boldRed: '\x1b[1;31m',
  bgRed: '\x1b[1;41;97m',
  yellow: '\x1b[33m',
  boldYellow: '\x1b[1;33m',
  bgYellow: '\x1b[1;43;30m',
  cyan: '\x1b[36m',
  boldCyan: '\x1b[1;36m',
  magenta: '\x1b[35m',
  boldMagenta: '\x1b[1;35m',
  blue: '\x1b[34m',
  boldBlue: '\x1b[1;34m',
  green: '\x1b[32m',
  boldGreen: '\x1b[1;32m',
}

// Port overrides stay here: they depend on the live environment, not on the inventory.
const APPS_RESOLVED = APPS.map((app) => {
  // same documented alias rule the hub uses (ARSY_PORT -> RADIO_PORT -> PORT);
  // otherwise the runner would pre-flight a port the hub never binds
  if (app.tag === 'arsy') return { ...app, port: resolveHubPort(process.env, app.port) }
  if (app.tag === 'ai') return { ...app, port: Number(process.env.AI_GATEWAY_PORT ?? app.port) }
  return app
})

const COLOR_BY_NAME = {
  cyan: ANSI.boldCyan,
  magenta: ANSI.boldMagenta,
  blue: ANSI.boldBlue,
  yellow: ANSI.boldYellow,
  green: ANSI.boldGreen,
}
const colorOf = (app) => COLOR_BY_NAME[app.color] ?? ANSI.boldWhite
const runnableApps = APPS_RESOLVED.filter((app) => app.dev)
const scaffoldApps = APPS_RESOLVED.filter((app) => !app.dev)
const urlOf = (app) => (app.port ? `http://localhost:${app.port}${app.health === '/' ? '' : app.health}` : null)

const only = (process.argv[2] ?? '').split(',').map((s) => s.trim()).filter(Boolean)
const requested = new Set(only.map((tag) => ALIASES[tag] ?? tag))
const selected = only.length > 0 ? runnableApps.filter((app) => requested.has(app.tag)) : runnableApps
const unknown = [...requested].filter((tag) => !APPS_RESOLVED.some((app) => app.tag === tag))
if (unknown.length > 0) {
  console.error(`unknown app tag(s): ${unknown.join(', ')} — run \`pnpm apps\` to list them`)
  process.exit(1)
}
const isWindows = process.platform === 'win32'
const width = Math.max(...selected.map((app) => app.tag.length))

function logErrorToFile(tag, line) {
  try {
    const timestamp = new Date().toISOString()
    appendFileSync(LOG_FILE, `[${timestamp}] [${tag.toUpperCase()}] ${line}\n`, 'utf8')
  } catch {
    /* non-fatal if filesystem is restricted */
  }
}

function openUrl(url) {
  try {
    if (process.platform === 'win32') {
      execFileSync('cmd.exe', ['/c', 'start', '', url], { stdio: 'ignore' })
    } else if (process.platform === 'darwin') {
      execFileSync('open', [url], { stdio: 'ignore' })
    } else {
      execFileSync('xdg-open', [url], { stdio: 'ignore' })
    }
    process.stdout.write(`\n\x1b[90m  ➜ Opened in browser: \x1b[1;36m${url}\x1b[0m\n\n`)
  } catch {
    process.stdout.write(`\n\x1b[90m  ➜ Open manually in browser: \x1b[1;36m${url}\x1b[0m\n\n`)
  }
}

function showRecentErrors() {
  try {
    if (!existsSync(LOG_FILE)) {
      process.stdout.write(`\n\x1b[90m  No errors logged in \x1b[1;37mdev-errors.log\x1b[0m\x1b[90m yet. All clear!\x1b[0m\n\n`)
      return
    }
    const lines = readFileSync(LOG_FILE, 'utf8').trim().split(/\r?\n/)
    const slice = lines.slice(-15)
    process.stdout.write(`\n\x1b[1;31m── Last ${slice.length} Error Log Entries (${LOG_FILE}) ──\x1b[0m\n`)
    for (const l of slice) {
      process.stdout.write(`\x1b[91m${l}\x1b[0m\n`)
    }
    process.stdout.write(`\x1b[1;31m──────────────────────────────────────────────────────────\x1b[0m\n\n`)
  } catch (err) {
    process.stdout.write(`\n\x1b[90m  Could not read log file: ${err.message}\x1b[0m\n\n`)
  }
}

function printDirectoryTable() {
  const line = '─'.repeat(78)
  process.stdout.write(`\n\x1b[1;35m╭${line}╮\x1b[0m\n`)
  process.stdout.write(`\x1b[1;35m│\x1b[0m  \x1b[1;37m▲ MOONWITNESS MONOREPO SUITE\x1b[0m  \x1b[90m·\x1b[0m  \x1b[1;32mDEV MISSION CONTROL\x1b[0m                      \x1b[1;35m│\x1b[0m\n`)
  process.stdout.write(`\x1b[1;35m╰${line}╯\x1b[0m\n\n`)

  const section = (title, apps) => {
    if (apps.length === 0) return
    process.stdout.write(`\x1b[1;37m● ${title}\x1b[0m\n`)
    for (const app of apps) {
      const keys = app.keys.length > 0 ? `[${app.keys.join(' / ')}]` : '[–]'
      const target = urlOf(app) ? `➜  \x1b[1;36m${urlOf(app)}\x1b[0m` : '\x1b[90m[no HTTP surface]\x1b[0m'
      process.stdout.write(`  ${colorOf(app)}${keys.padEnd(9)}\x1b[0m ${app.name.padEnd(34)} ${target}\n`)
      process.stdout.write(`           \x1b[90m└─ ${app.desc}\x1b[0m\n`)
    }
    process.stdout.write('\n')
  }

  section('FRONTENDS & USER INTERFACES', selected.filter((app) => app.kind === 'web'))
  section('ENGINES, APIS & WORKERS', selected.filter((app) => app.kind !== 'web'))

  process.stdout.write(`\x1b[1;37m● CONTEXT LINKS\x1b[0m\n`)
  process.stdout.write(`  \x1b[1;37m[3 / w]\x1b[0m  World Monitor 3-Tier      ➜  \x1b[1;36mhttp://localhost:3002/world-monitor\x1b[0m\n`)
  process.stdout.write(`  \x1b[1;37m[4 / s]\x1b[0m  OpenAPI Swagger UI Docs   ➜  \x1b[1;36mhttp://localhost:3000/docs\x1b[0m\n\n`)

  if (scaffoldApps.length > 0) {
    process.stdout.write(`\x1b[1;37m● LISTED SCAFFOLDS (never spawned)\x1b[0m\n`)
    for (const app of scaffoldApps) {
      process.stdout.write(`  \x1b[90m${app.tag} · ${app.note ?? 'no dev script'}\x1b[0m\n`)
    }
    process.stdout.write('\n')
  }

  process.stdout.write(`\x1b[1;37m● INTERACTIVE SHORTCUTS (Press key in terminal)\x1b[0m\n`)
  const shortcuts = selected.flatMap((app) => app.keys.map((key) => `[${key}] ${app.tag}`)).join('   ')
  process.stdout.write(`  ${shortcuts}\n`)
  process.stdout.write(`  \x1b[1;37m[3/w]\x1b[0m World Monitor  \x1b[1;37m[4/s]\x1b[0m Swagger  \x1b[1;37m[u]\x1b[0m URLs  \x1b[1;37m[e]\x1b[0m Errors  \x1b[1;37m[c]\x1b[0m Clear  \x1b[1;37m[q]\x1b[0m Quit\n`)
  process.stdout.write(`\x1b[90m${'─'.repeat(80)}\x1b[0m\n\n`)
}

// Regex to identify error patterns in logs (Pino JSON, stack traces, HTTP errors, compile errors)
const ERROR_PATTERN = /("level":(50|60)|"statusCode":(4\d\d|5\d\d)|\b(error|fatal|exception|failed|failure|eaddrinuse|econnrefused|unauthorized|rejected)\b|^error\b)/i
const WARN_PATTERN = /("level":40|\b(warn|warning)\b)/i

function formatPinoJson(raw) {
  if (!raw.startsWith('{') || !raw.endsWith('}')) return null
  try {
    const obj = JSON.parse(raw)
    if (typeof obj !== 'object' || obj === null) return null

    // Fastify request completion log
    if (obj.req && obj.res) {
      const method = obj.req.method || 'REQ'
      const url = obj.req.url || ''
      const code = obj.res.statusCode || 200
      const ms = typeof obj.responseTime === 'number' ? `(${obj.responseTime.toFixed(1)}ms)` : ''
      const codeColor = code >= 500 ? ANSI.boldRed : code >= 400 ? ANSI.boldYellow : ANSI.boldGreen
      return `${ANSI.bold}${method}${ANSI.reset} ${url} ${codeColor}${code}${ANSI.reset} ${ANSI.gray}${ms}${ANSI.reset}`
    }

    // Cron lifecycle
    if (obj.cron && obj.msg) {
      return `${obj.msg} [${obj.cron}${obj.every ? `, every ${obj.every}` : ''}]`
    }

    // Simple message log
    if (obj.msg) {
      const errDetail = obj.err?.message ? ` — ${ANSI.boldRed}${obj.err.message}${ANSI.reset}` : ''
      return `${obj.msg}${errDetail}`
    }
  } catch {
    /* not JSON */
  }
  return null
}

function formatLogLine(app, line) {
  const isErr = ERROR_PATTERN.test(line)
  const isWarn = !isErr && WARN_PATTERN.test(line)

  // Try cleaning Pino JSON into human-readable format
  const pretty = formatPinoJson(line)
  const displayContent = pretty ?? line

  const paddedTag = app.tag.padEnd(width)

  if (isErr) {
    logErrorToFile(app.tag, line)
    const badge = `${ANSI.bgRed} ERROR ${ANSI.reset}`
    const tag = `${ANSI.boldRed}${paddedTag}${ANSI.reset}`
    const content = `${ANSI.boldRed}${displayContent}${ANSI.reset}`
    return `${tag} ${badge} ${content}\n`
  }

  if (isWarn) {
    const badge = `${ANSI.bgYellow} WARN ${ANSI.reset}`
    const tag = `${ANSI.boldYellow}${paddedTag}${ANSI.reset}`
    const content = `${ANSI.yellow}${displayContent}${ANSI.reset}`
    return `${tag} ${badge} ${content}\n`
  }

  const divider = `${ANSI.gray}│${ANSI.reset}`
  const tag = `${colorOf(app)}${paddedTag}${ANSI.reset}`
  return `${tag} ${divider} ${displayContent}\n`
}

// `node --watch` swallows a startup failure and idles ("Failed running ...
// waiting for file changes"), which looks like a hang. Wait for the ports to be
// bindable first, so a just-stopped dev run cannot poison the next one.
const portsToCheck = selected.map((app) => app.port).filter((p) => typeof p === 'number')
const busy = await waitForPortsFree(portsToCheck, 10000)
if (busy.length > 0) {
  const msg = `ports ${busy.join(', ')} are still in use — run \`pnpm ports:free\` and try again`
  logErrorToFile('system', msg)
  console.error(
    `${ANSI.bgRed} PORT CONFLICT ${ANSI.reset} ${ANSI.boldRed}${msg}${ANSI.reset}`,
  )
  process.exit(1)
}

try {
  appendFileSync(LOG_FILE, `\n=== Dev session started at ${new Date().toISOString()} ===\n`, 'utf8')
} catch {
  /* ignore */
}

const children = []
let stopping = false

function killTree(child) {
  if (child.exitCode !== null || child.signalCode !== null) return
  try {
    if (isWindows) execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    else child.kill('SIGTERM')
  } catch {
    /* already gone */
  }
}

function shutdown(code = 0) {
  if (stopping) return
  stopping = true
  process.stdout.write(`\n${ANSI.boldYellow}Stopping all Moonwitness dev processes...${ANSI.reset}\n`)
  for (const child of children) killTree(child)
  setTimeout(() => process.exit(code), 250).unref()
}

for (const signal of isWindows ? ['SIGINT', 'SIGTERM', 'SIGBREAK', 'SIGHUP'] : ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => shutdown(0))
}

// Setup interactive terminal keyboard shortcuts
const HOTKEYS = new Map()
for (const app of selected) {
  const target = urlOf(app)
  if (!target) continue
  for (const key of app.keys) HOTKEYS.set(key.toLowerCase(), target)
}
HOTKEYS.set('3', 'http://localhost:3002/world-monitor')
HOTKEYS.set('w', 'http://localhost:3002/world-monitor')
HOTKEYS.set('4', 'http://localhost:3000/docs')
HOTKEYS.set('s', 'http://localhost:3000/docs')

if (process.stdin.isTTY) {
  try {
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (key) => {
      // Ctrl+C or 'q'
      if (key === '\u0003' || key === 'q' || key === 'Q') {
        shutdown(0)
        return
      }
      if (key === 'u' || key === 'U') {
        printDirectoryTable()
        return
      }
      if (key === 'c' || key === 'C') {
        console.clear()
        printDirectoryTable()
        return
      }
      if (key === 'e' || key === 'E') {
        showRecentErrors()
        return
      }
      const target = HOTKEYS.get(key.toLowerCase())
      if (target) openUrl(target)
    })
  } catch {
    /* non-raw terminal */
  }
}

printDirectoryTable()

for (const app of selected) {
  const label = app.tag.padEnd(width)
  const childEnv = { ...process.env, ...(app.env ?? {}) }
  for (const key of app.deleteEnv ?? []) delete childEnv[key]
  const child = spawn(isWindows ? 'pnpm.cmd' : 'pnpm', ['--filter', app.pkg, 'dev'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: childEnv,
    windowsHide: true,
    shell: isWindows,
  })
  children.push(child)

  for (const stream of [child.stdout, child.stderr]) {
    createInterface({ input: stream }).on('line', (line) => {
      // If it came from stderr and doesn't look like a standard note, treat as error if not matched
      const isStderr = stream === child.stderr && !/(\[DEP\d+|Debugger|ExperimentalWarning)/.test(line)
      if (isStderr && !ERROR_PATTERN.test(line)) {
        logErrorToFile(app.tag, `[stderr] ${line}`)
        process.stdout.write(
          `${ANSI.boldRed}${label}${ANSI.reset} ${ANSI.bgRed} STDERR ${ANSI.reset} ${ANSI.boldRed}${line}${ANSI.reset}\n`,
        )
      } else {
        process.stdout.write(formatLogLine(app, line))
      }

      if (line.includes('Failed running')) {
        const hint = '↑ the app died at startup (often EADDRINUSE) — fix the error above, then save a file to retry'
        logErrorToFile(app.tag, hint)
        process.stdout.write(
          `${ANSI.boldRed}${label}${ANSI.reset} ${ANSI.bgRed} HINT ${ANSI.reset} ${ANSI.boldRed}${hint}${ANSI.reset}\n`,
        )
      }
    })
  }

  child.on('error', (err) => {
    const errText = `failed to spawn: ${err.message}`
    logErrorToFile(app.tag, errText)
    console.error(
      `${ANSI.boldRed}${label}${ANSI.reset} ${ANSI.bgRed} SPAWN FAIL ${ANSI.reset} ${ANSI.boldRed}${errText}${ANSI.reset}`,
    )
    shutdown(1)
  })

  child.on('exit', (code) => {
    if (stopping) return
    if (code !== 0 && code !== null) {
      logErrorToFile(app.tag, `process exited unexpectedly with code ${code}`)
    }
    console.error(
      `${ANSI.boldRed}${label}${ANSI.reset} ${ANSI.bgRed} EXITED ${ANSI.reset} ${ANSI.boldRed}exited with code ${code ?? 'null'} — stopping other processes${ANSI.reset}`,
    )
    shutdown(code ?? 1)
  })
}
