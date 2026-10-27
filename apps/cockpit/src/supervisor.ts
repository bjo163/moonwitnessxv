import { spawn, type ChildProcess, execFileSync } from 'node:child_process'
import { connect } from 'node:net'
import { networkInterfaces } from 'node:os'
import { createInterface } from 'node:readline'
import { appendFileSync } from 'node:fs'
import { join } from 'node:path'
import { EventEmitter } from 'node:events'
import { findRepoRoot } from './paths.js'
import type { MoondeckConfig, ServiceDefinition, ServiceState, LogEntry } from './types.js'

const isWindows = process.platform === 'win32'
const ERROR_PATTERN = /("level":(50|60)|"statusCode":(4\d\d|5\d\d)|\b(error|fatal|exception|failed|failure|eaddrinuse|econnrefused|unauthorized|rejected)\b|^error\b)/i
const WARN_PATTERN = /("level":40|\b(warn|warning)\b)/i

// A connect error that proves *nothing is listening* on that address family.
// "anything that is not ECONNREFUSED is busy" wrongly refused every start on a
// host with IPv6 disabled (Docker bridges, disable_ipv6), so those families are
// treated as conclusive "free" here while a real timeout stays conservative.
const NO_LISTENER_CODES = new Set([
  'ECONNREFUSED',
  'EADDRNOTAVAIL',
  'ENETUNREACH',
  'EHOSTUNREACH',
  'EAFNOSUPPORT',
])

function isValidPort(port: number | undefined): port is number {
  return typeof port === 'number' && Number.isInteger(port) && port > 0 && port < 65536
}

/**
 * The port a child will actually bind: the first defined env spelling the app
 * reads, else the static config port. Probing this instead of `svc.port` keeps
 * the guard honest when an operator overrides the port through env.
 */
export function resolveServicePort(
  svc: ServiceDefinition,
  env: NodeJS.ProcessEnv = process.env,
): number | undefined {
  if (svc.type === 'worker') return undefined
  for (const key of svc.envPortKeys ?? []) {
    const raw = env[key]
    if (raw === undefined || raw === '') continue
    const parsed = Number(raw)
    if (isValidPort(parsed)) return parsed
  }
  return svc.port
}

interface ProbeResult {
  busy: boolean
  conclusive: boolean
}

function probeHostOnce(port: number, host: string, timeoutMs: number): Promise<ProbeResult> {
  return new Promise((resolve) => {
    const socket = connect({ port, host })
    let settled = false
    const finish = (busy: boolean, conclusive: boolean) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve({ busy, conclusive })
    }
    socket.once('connect', () => finish(true, true))
    socket.once('error', (error) => {
      const code = (error as NodeJS.ErrnoException).code
      // Refused or an unavailable family means no listener; a timeout or any
      // other error is treated as busy so we never spawn blindly.
      if (code === 'ECONNREFUSED' || (code && NO_LISTENER_CODES.has(code))) {
        finish(false, true)
      } else {
        finish(true, true)
      }
    })
    socket.setTimeout(timeoutMs, () => finish(true, false))
  })
}

/**
 * Loopback (both families) plus up to two declared LAN addresses. A listener
 * bound only to a LAN IP answers ECONNREFUSED on loopback, so probing the
 * declared interfaces catches the `HOST=0.0.0.0`/LAN case `.env.example` ships.
 */
export async function probePortBusy(port: number, timeoutMs = 500): Promise<boolean> {
  const lan = Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && !i.internal && i.family === 'IPv4')
    .slice(0, 2)
    .map((i) => (i as { address: string }).address)
  const hosts = ['127.0.0.1', '::1', ...lan]
  const results = await Promise.all(hosts.map((h) => probeHostOnce(port, h, timeoutMs)))
  const conclusive = results.filter((r) => r.conclusive)
  // Nothing conclusive (every family timed out) is not proof of a free port.
  if (conclusive.length === 0) return true
  return conclusive.some((r) => r.busy)
}

export class ProcessSupervisor extends EventEmitter {
  private config: MoondeckConfig
  private repoRoot: string
  private errorLogFile: string
  private states = new Map<string, ServiceState>()
  private processes = new Map<string, ChildProcess>()
  private startTimes = new Map<string, number>()
  private logBuffer: LogEntry[] = []
  private maxBufferSize = 1000
  private nextLogId = 1
  // Tags with a start/restart between its check and its registration. The probe
  // is an await, so without this a double-clicked Start passes the
  // processes.has() guard twice and spawns two children on one port.
  private inFlight = new Set<string>()

  constructor(config: MoondeckConfig) {
    super()
    this.config = config
    this.repoRoot = findRepoRoot()
    this.errorLogFile = join(this.repoRoot, 'dev-errors.log')

    for (const svc of config.services) {
      this.states.set(svc.tag, {
        tag: svc.tag,
        name: svc.name,
        pkg: svc.pkg,
        status: 'STOPPED',
        port: svc.port,
        uptimeSeconds: 0,
        restarts: 0,
      })
    }

    // Update uptime periodically
    setInterval(() => {
      const now = Date.now()
      for (const [tag, startTime] of this.startTimes.entries()) {
        const state = this.states.get(tag)
        if (state && state.status === 'RUNNING') {
          state.uptimeSeconds = Math.floor((now - startTime) / 1000)
        }
      }
    }, 1000).unref()
  }

  public getStates(): ServiceState[] {
    return Array.from(this.states.values())
  }

  public getState(tag: string): ServiceState | undefined {
    return this.states.get(tag)
  }

  public getRecentLogs(limit = 200, filterTag?: string): LogEntry[] {
    if (filterTag && filterTag !== 'all') {
      return this.logBuffer.filter((l) => l.tag === filterTag).slice(-limit)
    }
    return this.logBuffer.slice(-limit)
  }

  /**
   * Starts every service in dependency order (the hub first) and reports the
   * real per-tag outcome. The bulk endpoint must not answer before the port
   * probes finished, and it must not keep a second, fire-and-forget copy of
   * this loop that a future caller can use to reintroduce the old lie.
   */
  public async startAll(): Promise<Array<{ tag: string; started: boolean }>> {
    const ordered = [...this.config.services].sort((a, b) => {
      const aHub = a.tag === 'radio' ? 0 : 1
      const bHub = b.tag === 'radio' ? 0 : 1
      return aHub - bHub
    })
    const results: Array<{ tag: string; started: boolean }> = []
    for (const svc of ordered) {
      results.push({ tag: svc.tag, started: await this.start(svc.tag) })
    }
    return results
  }

  public stopAll(): void {
    for (const tag of this.processes.keys()) {
      this.stop(tag)
    }
  }

  /**
   * A second supervisor on the same port is the most common local failure:
   * `pnpm dev` is already running and the operator presses Start here. Refuse
   * with a message that names the cause instead of a raw EADDRINUSE later.
   *
   * Delegates to `probePortBusy`; logs a trace when the guard is skipped so an
   * invalid port never fails open silently.
   */
  private async portIsBusy(tag: string, port?: number): Promise<boolean> {
    if (!isValidPort(port)) {
      if (port !== undefined) {
        this.recordLog(tag, 'warn', `service port ${String(port)} is not a valid TCP port; port guard skipped`)
      }
      return false
    }
    return probePortBusy(port)
  }

  private resolvePort(svc: ServiceDefinition): number | undefined {
    return resolveServicePort(svc, process.env)
  }

  /**
   * Child env: inherit the operator env, but pin the resolved port onto the key
   * the app reads. This is what keeps the probed port and the bound port equal
   * even when a sibling service writes a generic `PORT` into `.env`.
   */
  private envFor(svc: ServiceDefinition, port?: number): NodeJS.ProcessEnv {
    const env: NodeJS.ProcessEnv = { ...process.env }
    if (svc.portPinKey && isValidPort(port)) env[svc.portPinKey] = String(port)
    return env
  }

  public async start(tag: string): Promise<boolean> {
    const svc = this.config.services.find((s) => s.tag === tag)
    const state = this.states.get(tag)
    if (!svc || !state) return false

    if (this.processes.has(tag) || this.inFlight.has(tag)) {
      return true // Already running, or a start is mid-probe for this tag
    }

    const port = this.resolvePort(svc)
    this.inFlight.add(tag)
    state.status = 'STARTING'
    this.emit('state', state)
    try {
      if (await this.portIsBusy(tag, port)) {
        state.status = 'ERROR'
        state.lastErrorCode = 'PORT_BUSY'
        state.lastErrorPort = port
        state.lastError = `port ${port} is already in use — likely started by \`pnpm dev\`; stop it before starting ${tag} here`
        this.emit('state', state)
        this.recordLog(tag, 'error', state.lastError)
        return false
      }
      return await this.spawnChild(tag, svc, state, port)
    } finally {
      this.inFlight.delete(tag)
    }
  }

  /**
   * Spawns the child and resolves the real outcome: `spawn` confirms success,
   * `error` (ENOENT/EPERM, or a `shell:` resolution failure) is reported instead
   * of crashing the cockpit on an uncaught event. The `exit` handler is
   * identity-guarded so a delayed exit of a superseded child cannot wipe the
   * registry entry of a restarted child.
   */
  private async spawnChild(
    tag: string,
    svc: ServiceDefinition,
    state: ServiceState,
    port?: number,
  ): Promise<boolean> {
    let settleStart: (ok: boolean) => void = () => {}
    const startOutcome = new Promise<boolean>((resolve) => {
      settleStart = resolve
    })
    let settled = false
    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      settleStart(ok)
    }

    try {
      const pnpmCmd = isWindows ? 'pnpm.cmd' : 'pnpm'
      const child = spawn(pnpmCmd, ['--filter', svc.pkg, 'dev'], {
        cwd: this.repoRoot,
        env: this.envFor(svc, port),
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        shell: isWindows,
      })

      child.once('spawn', () => finish(true))
      child.on('error', (err) => {
        const message = err instanceof Error ? err.message : String(err)
        const isCurrent = !this.processes.has(tag) || this.processes.get(tag) === child
        if (isCurrent) {
          state.status = 'ERROR'
          state.pid = undefined
          state.lastErrorCode = 'SPAWN_FAILED'
          state.lastError = `spawn failed: ${message}`
          this.emit('state', state)
          this.recordLog(tag, 'error', state.lastError)
        }
        finish(false)
      })

      child.on('exit', (code, signal) => {
        // A restart may already have registered a new child under this tag; a
        // stale exit must not clobber it (or it becomes an unkillable orphan).
        if (this.processes.get(tag) !== child) return
        this.processes.delete(tag)
        this.startTimes.delete(tag)
        state.pid = undefined
        state.uptimeSeconds = 0

        if (code !== 0 && code !== null) {
          state.status = 'ERROR'
          state.lastErrorCode = undefined
          state.lastError = `Exited with code ${code}`
          this.recordLog(tag, 'error', `Process exited with code ${code}`)
        } else {
          state.status = 'STOPPED'
          state.lastErrorCode = undefined
          this.recordLog(tag, 'info', `Process stopped (signal ${signal ?? 'OK'})`)
        }
        this.emit('state', state)
      })

      // Capture stdout
      if (child.stdout) {
        createInterface({ input: child.stdout }).on('line', (line) => {
          this.processOutputLine(tag, line, false)
        })
      }

      // Capture stderr
      if (child.stderr) {
        createInterface({ input: child.stderr }).on('line', (line) => {
          this.processOutputLine(tag, line, true)
        })
      }

      if (child.pid) {
        this.processes.set(tag, child)
        this.startTimes.set(tag, Date.now())
        state.pid = child.pid
        state.port = port
        state.status = 'RUNNING'
        state.lastError = undefined
        state.lastErrorCode = undefined
        state.lastErrorPort = undefined
        this.emit('state', state)
        this.recordLog(tag, 'info', `Service [${svc.name}] started (PID ${child.pid})`)
      }
      // Otherwise the 'error' event will settle the outcome (ENOENT path).

      // Never hang if neither 'spawn' nor 'error' arrives: fall back to PID.
      return await Promise.race([
        startOutcome,
        new Promise<boolean>((resolve) => {
          setTimeout(() => resolve(child.pid !== undefined), 1500).unref()
        }),
      ])
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      state.status = 'ERROR'
      state.lastErrorCode = 'SPAWN_FAILED'
      state.lastError = errorMsg
      this.emit('state', state)
      this.recordLog(tag, 'error', `Failed to start: ${errorMsg}`)
      finish(false)
      return false
    }
  }

  public stop(tag: string): boolean {
    const child = this.processes.get(tag)
    const state = this.states.get(tag)
    if (!child || !state) return false

    try {
      this.killTree(child)
    } catch {
      /* ignore */
    }

    this.processes.delete(tag)
    this.startTimes.delete(tag)
    state.status = 'STOPPED'
    state.pid = undefined
    state.uptimeSeconds = 0
    state.lastErrorCode = undefined
    state.lastErrorPort = undefined
    state.lastError = undefined
    this.emit('state', state)
    this.recordLog(tag, 'info', `Service stopped by operator`)
    return true
  }

  /** Retries until the port is conclusively free; false when it never releases. */
  private async waitForPortFree(tag: string, port: number | undefined, deadlineMs: number): Promise<boolean> {
    if (!isValidPort(port)) return true
    const deadline = Date.now() + deadlineMs
    while (Date.now() < deadline) {
      if (!(await this.portIsBusy(tag, port))) return true
      await new Promise((resolve) => {
        setTimeout(resolve, 200).unref()
      })
    }
    return !(await this.portIsBusy(tag, port))
  }

  public async restart(tag: string): Promise<boolean> {
    const svc = this.config.services.find((s) => s.tag === tag)
    const state = this.states.get(tag)
    if (!svc || !state) return false

    this.stop(tag)
    const port = this.resolvePort(svc)
    // Wait for the listener we just killed to release the port instead of a
    // fixed sleep; a lingering shutdown must not be mis-blamed on `pnpm dev`.
    if (!(await this.waitForPortFree(tag, port, 3000))) {
      state.status = 'ERROR'
      state.pid = undefined
      state.lastErrorCode = 'PORT_NOT_RELEASED'
      state.lastErrorPort = port
      state.lastError = `port ${port} did not release after stop; the previous listener is still bound`
      this.emit('state', state)
      this.recordLog(tag, 'error', state.lastError)
      return false
    }

    const started = await this.start(tag)
    // Count only restarts that actually happened, not refused attempts.
    if (started) state.restarts++
    return started
  }

  private processOutputLine(tag: string, rawLine: string, fromStderr: boolean): void {
    const trimmed = rawLine.trim()
    if (!trimmed) return

    let level: 'info' | 'warn' | 'error' = 'info'
    const isError = ERROR_PATTERN.test(trimmed)
    const isWarn = WARN_PATTERN.test(trimmed)

    if (isError || (fromStderr && !/(\[DEP\d+|Debugger|ExperimentalWarning)/i.test(trimmed))) {
      level = 'error'
      this.appendErrorToDisk(tag, trimmed)
    } else if (isWarn) {
      level = 'warn'
    }

    this.recordLog(tag, level, trimmed, rawLine)
  }

  private recordLog(tag: string, level: 'info' | 'warn' | 'error', message: string, raw?: string): void {
    const entry: LogEntry = {
      id: `log-${this.nextLogId++}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      tag,
      level,
      message,
      raw,
    }

    this.logBuffer.push(entry)
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift()
    }

    this.emit('log', entry)
  }

  private appendErrorToDisk(tag: string, message: string): void {
    try {
      const stamp = new Date().toISOString()
      appendFileSync(this.errorLogFile, `[${stamp}] [${tag.toUpperCase()}] ${message}\n`, 'utf8')
    } catch {
      /* ignore */
    }
  }

  private killTree(child: ChildProcess): void {
    if (!child.pid) return
    try {
      if (isWindows) {
        execFileSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
      } else {
        child.kill('SIGTERM')
      }
    } catch {
      /* already exited */
    }
  }
}
