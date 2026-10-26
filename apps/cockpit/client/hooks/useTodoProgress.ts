import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProgressPayload, TodoTask } from '../types'

export type TaskStatusFilter = 'open' | 'done' | 'all'

export interface TodoProgressFilters {
  status: TaskStatusFilter
  /** Empty string means "all milestones". */
  milestone: string
  /** Empty string means "all priorities". */
  priority: string
}

export interface UseTodoProgressOptions {
  /** REST safety-net cadence for when the SSE stream is not delivering. */
  pollMs?: number
}

const DEFAULT_POLL_MS = 20_000

interface TaskQueryResult {
  rows?: TodoTask[]
  matched?: number
  returned?: number
}

/**
 * Read-only progress feed. The SSE `progress` event is the primary path because
 * the server parses TODO.md once per change; the REST poll is only a safety net
 * for a stream that got dropped by a proxy or the embedded webview.
 */
export function useTodoProgress(options?: UseTodoProgressOptions) {
  const pollMs = options?.pollMs ?? DEFAULT_POLL_MS
  const [payload, setPayload] = useState<ProgressPayload | null>(null)
  const [live, setLive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastReceived, setLastReceived] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const [filters, setFilters] = useState<TodoProgressFilters>({ status: 'open', milestone: '', priority: '' })
  const [rows, setRows] = useState<TodoTask[]>([])
  const [rowsLoading, setRowsLoading] = useState(false)
  const [rowsMatched, setRowsMatched] = useState(0)

  const openedAt = useRef(new Date().toISOString())
  const stampRef = useRef('')
  const inflight = useRef(new Map<string, AbortController>())

  const applyPayload = useCallback((next: ProgressPayload) => {
    // Every arrival counts as a delivery, even an unchanged one, so the header
    // age reads as stream liveness rather than "time since the last edit".
    setLastReceived(new Date().toISOString())
    // buildPayload() reuses one parse, so an unchanged register arrives with the
    // same stamp; re-rendering on it would refetch the drill-down for nothing.
    const stamp = `${next.generatedAt}|${String(next.done)}|${String(next.total)}`
    if (stamp === stampRef.current) return
    stampRef.current = stamp
    setPayload(next)
    setError(next.error ?? (next.ready ? null : 'Register not readable yet'))
    setRevision((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetch(`/api/progress?since=${encodeURIComponent(openedAt.current)}`)
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

  useEffect(() => {
    const es = new EventSource('/api/logs/stream')

    es.addEventListener('progress', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data) as ProgressPayload
        setLive(true)
        applyPayload(data)
      } catch {
        /* ignore malformed frame */
      }
    })

    es.addEventListener('error', () => {
      setLive(false)
    })

    return () => {
      setLive(false)
      es.close()
    }
  }, [applyPayload])

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

  return {
    payload,
    rows,
    rowsMatched,
    rowsLoading,
    filters,
    setFilters,
    live,
    error,
    lastReceived,
    netClosedSinceOpen: payload?.delta?.netClosed ?? 0,
  }
}
