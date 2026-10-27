import { spawn, type ChildProcess, execFileSync } from 'node:child_process'
import { createServer } from 'node:net'
import { createInterface } from 'node:readline'
import { appendFileSync } from 'node:fs'
import { join } from 'node:path'
import { EventEmitter } from 'node:events'
import { findRepoRoot } from './paths.js'
import type { MoondeckConfig, ServiceState, LogEntry } from './types.js'

const isWindows = process.platform === 'win32'
const ERROR_PATTERN = /("level":(50|60)|"statusCode":(4\d\d|5\d\d)|\b(error|fatal|exception|failed|failure|eaddrinuse|econnrefused|unauthorized|rejected)\b|^error\b)/i
const WARN_PATTERN = /("level":40|\b(warn|warning)\b)/i

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

  public startAll(): void {
    for (const svc of this.config.services) {
      void this.start(svc.tag)
    }
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
   */
  private async portIsBusy(port?: number): Promise<boolean> {
    if (typeof port !== 'number') return false
    return new Promise((resolve) => {
      const probe = createServer()
      probe.once('error', () => resolve(true))
      probe.once('listening', () => {
        probe.close(() => resolve(false))
      })
      probe.listen(port, '127.0.0.1')
    })
  }

  public async start(tag: string): Promise<boolean> {
    const svc = this.config.services.find((s) => s.tag === tag)
    const state = this.states.get(tag)
    if (!svc || !state) return false

    if (this.processes.has(tag)) {
      return true // Already running
    }

    state.status = 'STARTING'
    this.emit('state', state)

    if (await this.portIsBusy(svc.port)) {
      state.status = 'ERROR'
      state.lastError = `port ${svc.port} is already in use — likely started by \`pnpm dev\`; stop it before starting ${tag} here`
      this.emit('state', state)
      this.recordLog(tag, 'error', state.lastError)
      return false
    }

    try {
      const pnpmCmd = isWindows ? 'pnpm.cmd' : 'pnpm'
      const child = spawn(pnpmCmd, ['--filter', svc.pkg, 'dev'], {
        cwd: this.repoRoot,
        env: { ...process.env },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        shell: isWindows,
      })

      if (!child.pid) {
        state.status = 'ERROR'
        state.lastError = 'Failed to allocate process PID'
        this.emit('state', state)
        return false
      }

      this.processes.set(tag, child)
      this.startTimes.set(tag, Date.now())
      state.pid = child.pid
      state.status = 'RUNNING'
      this.emit('state', state)

      this.recordLog(tag, 'info', `Service [${svc.name}] started (PID ${child.pid})`)

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

      child.on('exit', (code, signal) => {
        this.processes.delete(tag)
        this.startTimes.delete(tag)
        state.pid = undefined
        state.uptimeSeconds = 0

        if (code !== 0 && code !== null) {
          state.status = 'ERROR'
          state.lastError = `Exited with code ${code}`
          this.recordLog(tag, 'error', `Process exited with code ${code}`)
        } else {
          state.status = 'STOPPED'
          this.recordLog(tag, 'info', `Process stopped (signal ${signal ?? 'OK'})`)
        }
        this.emit('state', state)
      })

      return true
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      state.status = 'ERROR'
      state.lastError = errorMsg
      this.emit('state', state)
      this.recordLog(tag, 'error', `Failed to start: ${errorMsg}`)
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
    this.emit('state', state)
    this.recordLog(tag, 'info', `Service stopped by operator`)
    return true
  }

  public restart(tag: string): boolean {
    const state = this.states.get(tag)
    if (state) state.restarts++
    this.stop(tag)
    setTimeout(() => {
      void this.start(tag)
    }, 400).unref()
    return true
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
