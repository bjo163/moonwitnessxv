#!/usr/bin/env node
/**
 * Dev runner for the six processes (radio hub, dock, headquarters, ai gateway, sentinel, SKYLINK).
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
 *   pnpm dev                         # build libs, then run everything
 *   node scripts/dev.mjs radio,dock  # subset
 */
import { spawn, execFileSync } from 'node:child_process'
import { createInterface } from 'node:readline'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { waitForPortsFree } from './port-utils.mjs'

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

const APPS = [
  {
    tag: 'radio',
    pkg: '@moonwitness/radio',
    port: Number(process.env.RADIO_PORT ?? 3000),
    color: ANSI.boldCyan,
    name: 'Radio Core Hub & ORM',
    url: 'http://localhost:3000',
    desc: 'Core Fastify hub, ORM REST engine, SSE on-air stream, & OpenAPI docs',
  },
  {
    tag: 'dock',
    pkg: '@moonwitness/dock',
    port: 3001,
    color: ANSI.boldMagenta,
    name: 'Public Radio Dock',
    url: 'http://localhost:3001',
    desc: 'Public radio station player, schedule grid, & World Monitor radar ticker',
  },
  {
    tag: 'hq',
    pkg: '@moonwitness/headquarters',
    port: 3002,
    color: ANSI.boldBlue,
    name: 'Command Headquarters (HQ)',
    url: 'http://localhost:3002',
    desc: 'Mission control admin, station CRUD, ops telemetry, & World Monitor 3-Tier',
  },
  {
    tag: 'ai',
    pkg: '@moonwitness/aigateway',
    port: Number(process.env.AI_GATEWAY_PORT ?? 3003),
    color: ANSI.boldYellow,
    name: 'AI Gateway Router',
    url: 'http://localhost:3003',
    desc: 'Free-first OpenAI chat completions (Gemini, Groq, OpenRouter, Ollama, Heuristic)',
  },
  {
    tag: 'sentinel',
    pkg: '@moonwitness/sentinel',
    color: ANSI.boldGreen,
    name: 'Sentinel Worker Agent',
    url: null,
    desc: 'Autonomous radar scraper & poller (YouTube RSS, Playwright, OpenClaw, AI Agent)',
  },
  {
    tag: 'skylink',
    pkg: '@moonwitness/skylink',
    port: 3005,
    env: { PORT: '3005' },
    color: ANSI.boldCyan,
    name: 'SKYLINK Communication Service',
    url: 'http://localhost:3005/health',
    desc: 'Health-only D18 service skeleton; providers and messaging remain planned',
  },
]

const only = (process.argv[2] ?? '').split(',').map((s) => s.trim()).filter(Boolean)
const selected = only.length > 0 ? APPS.filter((app) => only.includes(app.tag)) : APPS
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

  process.stdout.write(`\x1b[1;37m● FRONTENDS & USER INTERFACES\x1b[0m\n`)
  process.stdout.write(`  \x1b[1;35m[1 / d]\x1b[0m  \x1b[1;35mPublic Radio Dock\x1b[0m         ➜  \x1b[1;36mhttp://localhost:3001\x1b[0m\n`)
  process.stdout.write(`         \x1b[90m└─ Live player, weekly schedule, & World Monitor radar ticker\x1b[0m\n`)
  process.stdout.write(`  \x1b[1;34m[2 / h]\x1b[0m  \x1b[1;34mCommand Headquarters (HQ)\x1b[0m ➜  \x1b[1;36mhttp://localhost:3002\x1b[0m\n`)
  process.stdout.write(`         \x1b[90m├─ Mission Control & CRUD station management\x1b[0m\n`)
  process.stdout.write(`  \x1b[1;33m[3 / w]\x1b[0m  \x1b[1;33mWorld Monitor 3-Tier\x1b[0m      ➜  \x1b[1;36mhttp://localhost:3002/world-monitor\x1b[0m\n`)
  process.stdout.write(`         \x1b[90m└─ Radars ──► Sources ──► Signals & AI Triage drilldown\x1b[0m\n\n`)

  process.stdout.write(`\x1b[1;37m● ENGINES, APIS & SERVICES\x1b[0m\n`)
  process.stdout.write(`  \x1b[1;36m[0 / r]\x1b[0m  \x1b[1;36mRadio Core Launchpad\x1b[0m      ➜  \x1b[1;36mhttp://localhost:3000\x1b[0m\n`)
  process.stdout.write(`  \x1b[1;36m[4 / s]\x1b[0m  \x1b[1;36mOpenAPI Swagger UI Docs\x1b[0m   ➜  \x1b[1;36mhttp://localhost:3000/docs\x1b[0m\n`)
  process.stdout.write(`         \x1b[90m├─ REST API Prefix: http://localhost:3000/api/v1\x1b[0m\n`)
  process.stdout.write(`         \x1b[90m└─ Health Status:   http://localhost:3000/api/v1/health\x1b[0m\n`)
  process.stdout.write(`  \x1b[1;33m[5 / a]\x1b[0m  \x1b[1;33mAI Gateway Router\x1b[0m         ➜  \x1b[1;36mhttp://localhost:3003/v1/models\x1b[0m\n`)
  process.stdout.write(`         \x1b[90m└─ Free-First Completions: http://localhost:3003/v1/chat/completions\x1b[0m\n`)
  process.stdout.write(`  \x1b[1;35m[6 / g]\x1b[0m  \x1b[1;35mMoondeck GUI Cockpit\x1b[0m      ➜  \x1b[1;36mhttp://localhost:3004\x1b[0m\n`)
  process.stdout.write(`         \x1b[90m└─ Standalone Windows Desktop GUI: pnpm gui\x1b[0m\n`)
  process.stdout.write(`  \x1b[1;36m[7 / k]\x1b[0m  \x1b[1;36mSKYLINK Health Service\x1b[0m     ➜  \x1b[1;36mhttp://localhost:3005/health\x1b[0m\n`)
  process.stdout.write(`  \x1b[1;32m[sentinel]\x1b[0m \x1b[1;32mSentinel Worker Daemon\x1b[0m ➜  \x1b[90m[Active Poller · YouTube, Playwright, Agent]\x1b[0m\n\n`)

  process.stdout.write(`\x1b[1;37m● INTERACTIVE SHORTCUTS (Press key in terminal)\x1b[0m\n`)
  process.stdout.write(`  \x1b[1;37m[1/d]\x1b[0m Open Dock   \x1b[1;37m[2/h]\x1b[0m Open HQ   \x1b[1;37m[3/w]\x1b[0m World Monitor   \x1b[1;37m[4/s]\x1b[0m Swagger Docs\n`)
  process.stdout.write(`  \x1b[1;37m[5/a]\x1b[0m AI Gateway  \x1b[1;37m[6/g]\x1b[0m Moondeck  \x1b[1;37m[7/k]\x1b[0m SKYLINK  \x1b[1;37m[u]\x1b[0m Show URLs  \x1b[1;37m[e]\x1b[0m Show Errors\n`)
  process.stdout.write(`  \x1b[1;37m[c]\x1b[0m   Clear Screen \x1b[1;37m[q]\x1b[0m   Quit & Stop All Services (or Ctrl+C)\n`)
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
  const tag = `${app.color}${paddedTag}${ANSI.reset}`
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
      if (key === '1' || key === 'd' || key === 'D') {
        openUrl('http://localhost:3001')
      } else if (key === '2' || key === 'h' || key === 'H') {
        openUrl('http://localhost:3002')
      } else if (key === '3' || key === 'w' || key === 'W') {
        openUrl('http://localhost:3002/world-monitor')
      } else if (key === '4' || key === 's' || key === 'S') {
        openUrl('http://localhost:3000/docs')
      } else if (key === '5' || key === 'a' || key === 'A') {
        openUrl('http://localhost:3003/v1/models')
      } else if (key === '6' || key === 'g' || key === 'G') {
        openUrl('http://localhost:3004')
      } else if (key === '0' || key === 'r' || key === 'R') {
        openUrl('http://localhost:3000')
      } else if (key === '7' || key === 'k' || key === 'K') {
        openUrl('http://localhost:3005/health')
      } else if (key === 'u' || key === 'U') {
        printDirectoryTable()
      } else if (key === 'c' || key === 'C') {
        console.clear()
        printDirectoryTable()
      } else if (key === 'e' || key === 'E') {
        showRecentErrors()
      }
    })
  } catch {
    /* non-raw terminal */
  }
}

printDirectoryTable()

for (const app of selected) {
  const label = app.tag.padEnd(width)
  const child = spawn(isWindows ? 'pnpm.cmd' : 'pnpm', ['--filter', app.pkg, 'dev'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...app.env },
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
