// Starts and stops the harness's OWN Dock dev server, so one command is enough
// to reproduce the evidence set and no process is left running.
//
// Port policy (repo rule, not a preference): ports 3000/3001 belong to a
// different local project and are never bound, probed or killed here. The
// harness insists on an explicit port at or above 3101, refuses to start when
// that port is already busy instead of letting `next dev` silently slide to
// another one, and verifies the port is released again on teardown.
import { spawn, execFileSync } from 'node:child_process'
import { connect } from 'node:net'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

import { DOCK_ROOT, REPO_ROOT, mkdirScreens, resetRecords } from './paths.mjs'

/** The commit the evidence was captured against; never fatal if git is unavailable. */
function currentHead() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim() || 'unknown'
  } catch {
    return 'unknown'
  }
}

const RAW_PORT = process.env.UI_PORT ?? '3101'
const PORT = Number(RAW_PORT)
const RESERVED_PORTS = [3000, 3001, 3002, 3003, 3004, 3005]

export const UI_PORT = PORT
export const BASE_URL = `http://127.0.0.1:${PORT}`

/**
 * The hub URL the spawned server is given. The default points at a closed
 * loopback port on purpose: the repository .env otherwise sends Dock straight to
 * 127.0.0.1:3000, which on this machine is an unrelated project. A closed port
 * keeps the harness on the honest hub-offline branch and never touches another
 * stack.
 */
const DEFAULT_HUB_URL = 'http://127.0.0.1:65535/api/v1'
export const HUB_URL = process.env.UI_HUB_URL ?? DEFAULT_HUB_URL

/** Kept as the original name: nothing else in the harness re-derives the mode. */
export const OFFLINE_HUB_URL = HUB_URL

/**
 * Did anything actually answer on the hub URL? The mode is a measured fact, not
 * an inference from a sentinel port.
 *
 * This exists because the committed `docs/audit/screens/geometry.json` records
 * `hubMode: "offline-forced"` beside `hubUrl: "http://127.0.0.1:3102/api/v1"`,
 * a pair the port-string heuristic could not have produced. Inferring the mode
 * from the shape of a URL let evidence claim a condition nobody verified; a
 * reachability probe cannot be contradicted by its own input.
 */
function probeHub(url) {
  return new Promise((resolvePromise) => {
    let host
    let port
    try {
      const parsed = new URL(url)
      host = parsed.hostname
      port = Number(parsed.port || (parsed.protocol === 'https:' ? 443 : 80))
    } catch {
      resolvePromise(false)
      return
    }
    const socket = connect({ host, port, timeout: 900 })
    const finish = (value) => {
      socket.destroy()
      resolvePromise(value)
    }
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })
}

/**
 * The run condition every spec must agree on. Test workers are separate
 * processes, so the resolved values travel through the inherited environment
 * rather than module state.
 */
export function hubRun() {
  return {
    hubUrl: process.env.UI_HUB_URL ?? DEFAULT_HUB_URL,
    mode: process.env.UI_HUB_MODE_RESOLVED ?? 'unresolved',
    runHead: process.env.UI_RUN_HEAD ?? 'unknown',
  }
}

/** Offline is offline, whatever named the port: both branches render the outage state. */
export function expectsOfflineBranch(mode) {
  return mode !== 'live-hub'
}


function isPortFree(port) {
  return new Promise((resolvePromise) => {
    const socket = connect({ port, host: '127.0.0.1' })
    socket.once('connect', () => {
      socket.destroy()
      resolvePromise(false)
    })
    socket.once('error', () => resolvePromise(true))
    socket.setTimeout(1000, () => {
      socket.destroy()
      resolvePromise(true)
    })
  })
}

async function waitForFreePort(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await isPortFree(port)) return true
    await new Promise((sleep) => setTimeout(sleep, 250))
  }
  return false
}

function killTree(child) {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve()
  const exited = new Promise((resolveExit) => {
    child.once('exit', () => resolveExit(true))
  })
  const kill = () => {
    if (process.platform === 'win32') {
      // `detached: true` puts Next in its own console group; /T takes the
      // children (webpack/swc workers) with it.
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
      killer.on('error', () => child.kill('SIGKILL'))
    } else {
      try {
        process.kill(-child.pid, 'SIGKILL')
      } catch {
        child.kill('SIGKILL')
      }
    }
  }
  kill()
  return Promise.race([exited, new Promise((resolveExit) => setTimeout(() => resolveExit(false), 8000))])
}

export default async function globalSetup() {
  if (!Number.isInteger(PORT) || PORT < 3101 || PORT > 65535) {
    throw new Error(`UI visual harness refuses port "${RAW_PORT}": use an explicit port >= 3101 (UI_PORT=3101).`)
  }
  if (RESERVED_PORTS.includes(PORT)) {
    throw new Error(`UI visual harness will not use port ${PORT}; that range belongs to another local project.`)
  }

  const nextBin = join(DOCK_ROOT, 'node_modules', 'next', 'dist', 'bin', 'next')
  if (!existsSync(nextBin)) {
    throw new Error(`Next.js binary not found at ${nextBin}. Run pnpm install first — the harness never installs for you.`)
  }

  if (!(await isPortFree(PORT))) {
    throw new Error(
      `Port ${PORT} is already in use. The harness spawns its own Dock server and will not share or reuse a listener. ` +
        `Free it (or pass UI_PORT=<free port >= 3101>) and re-run.`,
    )
  }

  mkdirScreens()
  resetRecords()

  // Provenance for geometry.json. Workers inherit process.env from this process,
  // so the spec can stamp the HEAD it actually ran against.
  process.env.UI_RUN_HEAD = currentHead()

  // Measure the hub condition instead of guessing it from the URL's shape, and
  // refuse to run when the operator declared a mode the probe contradicts.
  const reachable = await probeHub(HUB_URL)
  const measuredMode = process.env.UI_HUB_URL
    ? reachable ? 'live-hub' : 'hub-unreachable'
    : reachable ? 'sentinel-port-occupied' : 'offline-forced'
  const declared = process.env.UI_HUB_MODE
  if (declared && declared !== measuredMode) {
    throw new Error(
      `UI_HUB_MODE says "${declared}" but the probe of ${HUB_URL} measured "${measuredMode}". ` +
        'The harness will not record a condition it did not observe — fix the URL or drop UI_HUB_MODE.',
    )
  }
  if (measuredMode === 'sentinel-port-occupied') {
    throw new Error(
      `No UI_HUB_URL was given, so the harness expected ${HUB_URL} to be closed, but something answered. ` +
        'Pass UI_HUB_URL explicitly rather than measuring a live hub under an offline label.',
    )
  }
  process.env.UI_HUB_MODE_RESOLVED = measuredMode
  console.log(`[ui-visual-harness] hub condition measured: ${measuredMode} at ${HUB_URL}`)

  const child = spawn(
    process.execPath,
    [nextBin, 'dev', '--hostname', '127.0.0.1', '--port', String(PORT)],
    {
      cwd: DOCK_ROOT,
      env: {
        ...process.env,
        // Forces the hub-offline branch; see OFFLINE_HUB_URL.
        RADIO_API_URL: OFFLINE_HUB_URL,
        NEXT_TELEMETRY_DISABLED: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    },
  )

  let output = ''
  const capOutput = (chunk) => {
    output += chunk
    if (output.length > 40000) output = output.slice(-40000)
  }
  child.stdout.setEncoding('utf8').on('data', capOutput)
  child.stderr.setEncoding('utf8').on('data', capOutput)
  child.on('exit', (code, signal) => capOutput(`\n[next dev exited code=${code} signal=${signal}]\n`))

  const abort = async (message) => {
    await killTree(child)
    throw new Error(`${message}\n--- dock dev output (tail) ---\n${output}`)
  }

  // Readiness: the middleware answers `/` with a 307 to /{locale}. Anything else
  // (a refused socket, a 500, an early exit) is a harness failure, not a skip.
  const deadline = Date.now() + 180000
  let ready = false
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      await abort(`Dock dev server exited before it became ready on ${BASE_URL}.`)
    }
    try {
      const response = await fetch(`${BASE_URL}/`, { redirect: 'manual' })
      if (response.status === 307 || response.status === 200) {
        ready = true
        break
      }
    } catch {
      // listener not open yet
    }
    await new Promise((sleep) => setTimeout(sleep, 250))
  }
  if (!ready) await abort(`Dock dev server did not answer on ${BASE_URL} within 180s.`)

  const stopHandlers = []
  const onExit = () => {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    } else {
      try {
        process.kill(-child.pid, 'SIGKILL')
      } catch {
        child.kill('SIGKILL')
      }
    }
  }
  for (const event of ['exit', 'SIGINT', 'SIGTERM']) {
    const handler = event === 'exit' ? onExit : () => {
      onExit()
      process.exit(130)
    }
    process.on(event, handler)
    stopHandlers.push([event, handler])
  }

  console.log(`[ui-visual-harness] dock dev ready on ${BASE_URL} (pid ${child.pid}), hub condition ${process.env.UI_HUB_MODE_RESOLVED} at ${OFFLINE_HUB_URL}`)

  return async () => {
    for (const [event, handler] of stopHandlers) process.off(event, handler)
    await killTree(child)
    const released = await waitForFreePort(PORT, 15000)
    if (!released) {
      throw new Error(`Port ${PORT} is still bound after the harness stopped its Dock server. Investigate before re-running.`)
    }
    console.log(`[ui-visual-harness] dock dev stopped; port ${PORT} released`)
  }
}
