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

export interface FlipTotals {
  /** Cumulative open→done transitions observed since this process started. */
  closed: number
  /** Cumulative done→open reopenings observed since this process started. */
  reopened: number
}

/**
 * The wire shape. Deliberately an explicit projection instead of the whole
 * `RegisterSnapshot`: the capped `tasks` slice (up to 400 rows) would ride along
 * on every SSE frame although `GET /api/todo/tasks` is the only row source, and
 * the absolute register path must not leave the process.
 */
export interface ProgressPayload {
  generatedAt: string
  total: number
  done: number
  open: number
  percent: number
  milestones: RegisterSnapshot['milestones']
  groups: RegisterSnapshot['groups']
  priorities: RegisterSnapshot['priorities']
  openP0: string[]
  source: 'TODO.md'
  /** Short label only — never an absolute local path. */
  registerLabel: 'TODO.md'
  ready: boolean
  stale: boolean
  /** Absolute counters, so the client's "closed since you opened this" survives payload dedupe. */
  flipTotals: FlipTotals
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
  private flipTotals: FlipTotals = { closed: 0, reopened: 0 }
  private readonly startedAt = new Date().toISOString()
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
      this.failRead(err instanceof Error ? err.message : String(err))
      return
    }
    const signature = `${String(stat.mtimeMs)}:${String(stat.size)}`
    if (signature === this.signature) {
      // Advance the trend line while idle *and* publish it. A history point the
      // client never receives cannot make the sparkline honest.
      if (this.snapshot && Date.now() - this.lastParseAt >= this.heartbeatMs) {
        this.pushHistory(this.snapshot)
        this.lastParseAt = Date.now()
        this.emit('progress', this.buildPayload())
      }
      return
    }
    this.scheduleRead()
  }

  /**
   * Record a read failure and announce the *transition* into blindness. Without
   * this emit an open panel keeps showing live-looking numbers forever, which is
   * the wrong failure mode for a monitoring surface. Repeated failures of the
   * same kind stay quiet so the stream is not flooded.
   */
  private failRead(message: string): void {
    const firstFailure = this.readError === undefined
    this.readError = message
    if (firstFailure) this.emit('progress', this.buildPayload())
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
      this.failRead(err instanceof Error ? err.message : String(err))
      return
    }

    let next: RegisterSnapshot
    try {
      next = parseTodoRegister(text)
    } catch (err: unknown) {
      this.failRead(err instanceof Error ? err.message : String(err))
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
      // Counted before the log is capped: these are lifetime totals, not a view.
      if (after === 'done') this.flipTotals.closed += 1
      else this.flipTotals.reopened += 1
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
      registerLabel: 'TODO.md' as const,
      flipTotals: { ...this.flipTotals },
      flipLog: [...this.flipLog].reverse(),
      history: [...this.history],
      ...(this.readError ? { error: this.readError } : {}),
    }
    const snapshot = this.snapshot
    if (!snapshot) {
      return {
        ...base,
        generatedAt: this.startedAt,
        total: 0,
        done: 0,
        open: 0,
        percent: 0,
        milestones: [],
        groups: [],
        priorities: {},
        openP0: [],
        ready: false,
        stale: Boolean(this.readError),
      }
    }
    return {
      ...base,
      generatedAt: snapshot.generatedAt,
      total: snapshot.total,
      done: snapshot.done,
      open: snapshot.open,
      percent: snapshot.percent,
      milestones: snapshot.milestones,
      groups: snapshot.groups,
      priorities: snapshot.priorities,
      openP0: snapshot.openP0,
      ready: !this.readError,
      stale: Boolean(this.readError),
    }
  }

  public hasSnapshot(): boolean {
    return this.snapshot !== null
  }

  /**
   * Drill-down over the full row set. The payload only ships open tasks, so the
   * complete list is filtered here rather than sent to every client.
   */
  public queryTasks(query: TaskQuery): { rows: TodoTask[]; matched: number; returned: number } {
    const raw = query.limit ?? MAX_TASK_RETURN
    const limit = Number.isFinite(raw) && raw > 0 ? Math.min(raw, MAX_TASK_RETURN) : MAX_TASK_RETURN
    let rows = this.allTasks
    if (query.status && query.status !== 'all') rows = rows.filter((t) => t.status === query.status)
    if (query.milestone) rows = rows.filter((t) => t.milestone === query.milestone)
    if (query.priority) rows = rows.filter((t) => t.priority === query.priority)
    return { rows: rows.slice(0, limit), matched: rows.length, returned: Math.min(rows.length, limit) }
  }
}
