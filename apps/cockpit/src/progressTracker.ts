import { EventEmitter } from 'node:events'
import { readFileSync, statSync } from 'node:fs'
import { extractAllTasks, parseTodoRegister, type RegisterSnapshot, type TaskStatus, type TodoTask } from './todoRegister.js'

export interface ProgressFlip {
  taskId: string
  from: TaskStatus
  to: TaskStatus
  at: string
}

export interface ProgressPoint {
  at: string
  done: number
  total: number
  percent: number
}

export interface ProgressPayload extends RegisterSnapshot {
  source: 'TODO.md'
  registerPath: string
  ready: boolean
  stale: boolean
  flipLog: ProgressFlip[]
  history: ProgressPoint[]
  error?: string
}

export interface ProgressTrackerOptions {
  filePath: string
  /** How often the register is stat-ed looking for a change. */
  pollMs?: number
  /** Trailing window that collapses a burst of saves into a single re-parse. */
  debounceMs?: number
  /** Cadence for appending a trend point when the register has not changed. */
  heartbeatMs?: number
}

export interface TaskQuery {
  status?: string
  milestone?: string
  priority?: string
  limit?: number
}

const MAX_FLIPS = 50
const MAX_HISTORY = 240
const MAX_TASK_RETURN = 400

const EMPTY_SNAPSHOT: RegisterSnapshot = {
  generatedAt: new Date(0).toISOString(),
  total: 0,
  done: 0,
  open: 0,
  percent: 0,
  milestones: [],
  groups: [],
  priorities: {},
  openP0: [],
  tasks: [],
}

/**
 * Watches TODO.md and republishes a parsed snapshot when it changes.
 *
 * Change detection is a `stat` gate rather than `fs.watch`: a watcher on a
 * mapped drive can silently never fire, and the register is large enough that
 * re-reading it on every poll would be wasteful. Consumers share one parse per
 * detected change, no matter how many are listening.
 */
export class ProgressTracker extends EventEmitter {
  private readonly filePath: string
  private readonly pollMs: number
  private readonly debounceMs: number
  private readonly heartbeatMs: number

  private snapshot: RegisterSnapshot | null = null
  private flipLog: ProgressFlip[] = []
  private history: ProgressPoint[] = []
  private statuses = new Map<string, TaskStatus>()
  private allTasks: TodoTask[] = []
  private signature = ''
  private lastParseAt = 0
  private pollTimer: ReturnType<typeof setInterval> | null = null
  private debounceTimer: ReturnType<typeof setTimeout> | null = null
  private readError: string | undefined
  private stopped = false

  constructor(options: ProgressTrackerOptions) {
    super()
    this.filePath = options.filePath
    this.pollMs = options.pollMs ?? 3000
    this.debounceMs = options.debounceMs ?? 250
    this.heartbeatMs = options.heartbeatMs ?? 60_000
  }

  public start(): void {
    this.stopped = false
    this.read()
    // Deliberately not unref()'d: an unref'd poll can be deferred for as long as
    // the process sits idle, which defeats the point of real-time detection.
    // stop() clears these, so shutdown still completes.
    this.pollTimer = setInterval(() => {
      this.tick()
    }, this.pollMs)
  }

  public stop(): void {
    this.stopped = true
    if (this.pollTimer) clearInterval(this.pollTimer)
    if (this.debounceTimer) clearTimeout(this.debounceTimer)
    this.pollTimer = null
    this.debounceTimer = null
    this.removeAllListeners('progress')
  }

  private tick(): void {
    if (this.stopped) return
    let stat
    try {
      stat = statSync(this.filePath)
    } catch (err: unknown) {
      // Keep serving the last good snapshot; never throw into a request.
      this.readError = err instanceof Error ? err.message : String(err)
      return
    }
    const signature = `${String(stat.mtimeMs)}:${String(stat.size)}`
    if (signature === this.signature) {
      // Advance the trend line while idle too, so the sparkline honestly shows
      // "no change" instead of freezing at the last write.
      if (this.snapshot && Date.now() - this.lastParseAt >= this.heartbeatMs) {
        this.pushHistory(this.snapshot)
        this.lastParseAt = Date.now()
      }
      return
    }
    this.scheduleRead()
  }

  private scheduleRead(): void {
    // A parse is already pending for this change. Re-arming the timer on every
    // poll would restart the trailing window forever whenever pollMs is shorter
    // than debounceMs, so the parse would never land.
    if (this.debounceTimer) return
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null
      this.read()
    }, this.debounceMs)
  }

  private read(): void {
    if (this.stopped) return
    let text: string
    let stat
    try {
      stat = statSync(this.filePath)
      text = readFileSync(this.filePath, 'utf8')
    } catch (err: unknown) {
      this.readError = err instanceof Error ? err.message : String(err)
      return
    }

    let next: RegisterSnapshot
    try {
      next = parseTodoRegister(text)
    } catch (err: unknown) {
      this.readError = err instanceof Error ? err.message : String(err)
      return
    }

    this.signature = `${String(stat.mtimeMs)}:${String(stat.size)}`
    this.readError = undefined
    this.allTasks = extractAllTasks(text)
    this.recordFlips()
    this.snapshot = next
    this.pushHistory(next)
    this.lastParseAt = Date.now()
    this.emit('progress', this.buildPayload())
  }

  /**
   * Only genuine checkbox transitions found by diffing two reads are recorded.
   * The first read establishes a baseline and yields no flips; a task that
   * disappears from the register is not reported as a transition.
   */
  private recordFlips(): void {
    const current = new Map<string, TaskStatus>()
    for (const task of this.allTasks) current.set(task.id, task.status)
    const previous = this.statuses
    this.statuses = current
    if (!this.snapshot) return

    const at = new Date().toISOString()
    for (const [id, before] of previous) {
      const after = current.get(id)
      if (!after || before === after) continue
      this.flipLog.push({ taskId: id, from: before, to: after, at })
    }
    if (this.flipLog.length > MAX_FLIPS) {
      this.flipLog = this.flipLog.slice(-MAX_FLIPS)
    }
  }

  private pushHistory(snapshot: RegisterSnapshot): void {
    this.history.push({
      at: new Date().toISOString(),
      done: snapshot.done,
      total: snapshot.total,
      percent: snapshot.percent,
    })
    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(-MAX_HISTORY)
    }
  }

  public buildPayload(): ProgressPayload {
    const base = {
      source: 'TODO.md' as const,
      registerPath: this.filePath,
      flipLog: [...this.flipLog].reverse(),
      history: [...this.history],
      ...(this.readError ? { error: this.readError } : {}),
    }
    if (!this.snapshot) {
      return { ...base, ...EMPTY_SNAPSHOT, ready: false, stale: false }
    }
    return { ...base, ...this.snapshot, ready: !this.readError, stale: Boolean(this.readError) }
  }

  public hasSnapshot(): boolean {
    return this.snapshot !== null
  }

  /**
   * Drill-down over the full row set. The payload only ships open tasks, so the
   * complete list is filtered here rather than sent to every client.
   */
  public queryTasks(query: TaskQuery): { rows: TodoTask[]; matched: number; returned: number } {
    const limit = Math.max(1, Math.min(query.limit ?? MAX_TASK_RETURN, MAX_TASK_RETURN))
    let rows = this.allTasks
    if (query.status && query.status !== 'all') rows = rows.filter((t) => t.status === query.status)
    if (query.milestone) rows = rows.filter((t) => t.milestone === query.milestone)
    if (query.priority) rows = rows.filter((t) => t.priority === query.priority)
    return { rows: rows.slice(0, limit), matched: rows.length, returned: Math.min(rows.length, limit) }
  }

  /** Flips observed after `sinceIso`, plus the net tasks-closed movement. */
  public getDelta(sinceIso: string): { since: string; flips: ProgressFlip[]; netClosed: number } {
    const since = Date.parse(sinceIso)
    const flips = Number.isNaN(since)
      ? []
      : [...this.flipLog].reverse().filter((flip) => Date.parse(flip.at) >= since)
    const netClosed = flips.reduce((net, flip) => net + (flip.to === 'done' ? 1 : -1), 0)
    return { since: sinceIso, flips, netClosed }
  }
}
