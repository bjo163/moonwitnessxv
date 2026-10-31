import { useCallback, useEffect, useRef, useState } from 'react'
import type { FlipTotals, ProgressPayload, TodoTask } from '../types'
import { netClosedSince } from '../lib/progress-math'

export type TaskStatusFilter = 'open' | 'done' | 'all'

export interface TodoProgressFilters {
  status: TaskStatusFilter
  /** Empty string means "all milestones". */
  milestone: string
  /** Empty string means "all priorities". */
  priority: string
}

export interface UseTodoProgressOptions {
  /** REST safety-net cadence for when the shared stream is not delivering. */
  pollMs?: number
  /** Latest payload pushed by the single cockpit stream (owned by useCockpitSync). */
  progressPayload?: ProgressPayload | null
  /** Whether that stream is currently delivering. */
  progressLive?: boolean
}

const DEFAULT_POLL_MS = 20_000

interface TaskQueryResult {
  rows?: TodoTask[]
  matched?: number
  returned?: number
}

/**
 * Read-only progress feed. The primary path is the payload pushed on the single
 * `/api/logs/stream` connection owned by `useCockpitSync` — this hook must never
 * open a second EventSource, because every extra socket also adds a listener on
 * the tracker and costs one of the browser's per-host connections.
 *
 * The REST poll is only a safety net for a stream that got dropped.
 */
export function useTodoProgress(options?: UseTodoProgressOptions) {
  const pollMs = options?.pollMs ?? DEFAULT_POLL_MS
  const streamPayload = options?.progressPayload ?? null
  const streamLive = options?.progressLive ?? false

  const [payload, setPayload] = useState<ProgressPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastReceived, setLastReceived] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const [filters, setFilters] = useState<TodoProgressFilters>({ status: 'open', milestone: '', priority: '' })
  const [rows, setRows] = useState<TodoTask[]>([])
  const [rowsLoading, setRowsLoading] = useState(false)
  const [rowsMatched, setRowsMatched] = useState(0)

  const stampRef = useRef('')
  const baselineRef = useRef<FlipTotals | null>(null)
  const inflight = useRef(new Map<string, AbortController>())

  const applyPayload = useCallback((next: ProgressPayload) => {
    // Every arrival counts as a delivery, even an unchanged one, so the header
    // age reads as stream liveness rather than "time since the last edit".
    setLastReceived(new Date().toISOString())
    // The first payload is the baseline for "closed since you opened this"; the
    // counters are lifetime totals, so the difference survives dedupe.
    if (!baselineRef.current) baselineRef.current = next.flipTotals
    // History length and the error are part of the identity: a heartbeat frame
    // (history only) and a transition into "stale" carry no count change but
    // still have to reach the panel.
    const stamp = `${next.generatedAt}|${String(next.done)}|${String(next.total)}|${String(next.history.length)}|${next.error ?? ''}`
    if (stamp === stampRef.current) return
    stampRef.current = stamp
    setPayload(next)
    setError(next.error ?? (next.ready ? null : 'Register not readable yet'))
    setRevision((prev) => prev + 1)
  }, [])

  // Primary path: the payload pushed on the shared stream.
  useEffect(() => {
    if (streamPayload) applyPayload(streamPayload)
  }, [streamPayload, applyPayload])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch('/api/progress')
        const data = (await res.json()) as ProgressPayload
        if (active && res.ok) applyPayload(data)
        else if (active) setError(data.error ?? `Progress unavailable (${String(res.status)})`)
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : String(err))
      }
    }
    void load()
    const timer = setInterval(() => void load(), pollMs)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [pollMs, applyPayload])

  // Drill-down rows: re-fetched when the operator changes a filter or the
  // register actually moves. Any superseded request for the same key is aborted.
  useEffect(() => {
    const key = `${filters.status}|${filters.milestone}|${filters.priority}`
    inflight.current.get(key)?.abort()
    const controller = new AbortController()
    inflight.current.set(key, controller)

    const params = new URLSearchParams({ status: filters.status })
    if (filters.milestone) params.set('milestone', filters.milestone)
    if (filters.priority) params.set('priority', filters.priority)

    let active = true
    setRowsLoading(true)
    void (async () => {
      try {
        const res = await fetch(`/api/todo/tasks?${params.toString()}`, { signal: controller.signal })
        const data = (await res.json()) as TaskQueryResult
        if (!active) return
        setRows(Array.isArray(data.rows) ? data.rows : [])
        setRowsMatched(data.matched ?? 0)
      } catch {
        /* aborted or server unavailable: keep the previous rows */
      } finally {
        if (active) setRowsLoading(false)
      }
    })()

    return () => {
      active = false
      controller.abort()
      inflight.current.delete(key)
    }
  }, [filters, revision])

  const baseline = baselineRef.current
  const totals = payload?.flipTotals
  const netClosedSinceOpen = baseline && totals ? netClosedSince(baseline, totals) : 0

  return {
    payload,
    rows,
    rowsMatched,
    rowsLoading,
    filters,
    setFilters,
    live: streamLive,
    error,
    lastReceived,
    netClosedSinceOpen,
  }
}
