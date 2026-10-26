import { useEffect, useState, type ReactNode } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  EmptyState,
  LiveDot,
  Panel,
  Pill,
  PillGroup,
  ProgressBar,
  StatCard,
  type BadgeTone,
  type ColumnDef,
  type ProgressTone,
} from '@moonwitness/moonui'
import type { ProgressPayload, TodoTask } from '../types'
import type { TaskStatusFilter, TodoProgressFilters } from '../hooks/useTodoProgress'
import type { CockpitCopyCatalog } from '../lib/cockpit-copy'

export interface CockpitProgressViewProps {
  payload: ProgressPayload | null
  rows: TodoTask[]
  rowsMatched: number
  rowsLoading: boolean
  filters: TodoProgressFilters
  setFilters: (fn: (prev: TodoProgressFilters) => TodoProgressFilters) => void
  live: boolean
  error: string | null
  lastReceived: string | null
  netClosedSinceOpen: number
  copy: CockpitCopyCatalog
}

const STATUS_OPTIONS: TaskStatusFilter[] = ['open', 'done', 'all']
const PRIORITY_OPTIONS = ['P0', 'P1', 'P2', 'P3']

const GROUP_STYLES: ReadonlyArray<{ tone: ProgressTone; color: string }> = [
  { tone: 'cyan', color: 'var(--cyan)' },
  { tone: 'pink', color: 'var(--pink)' },
  { tone: 'accent', color: 'var(--accent)' },
  { tone: 'ok', color: 'var(--ok)' },
  { tone: 'blue', color: 'var(--blue)' },
  { tone: 'purple', color: 'var(--moon)' },
]
const FALLBACK_GROUP_STYLE = { tone: 'cyan', color: 'var(--cyan)' } satisfies { tone: ProgressTone; color: string }

function groupStyle(index: number): { tone: ProgressTone; color: string } {
  return GROUP_STYLES[index % GROUP_STYLES.length] ?? FALLBACK_GROUP_STYLE
}

function formatAgo(iso: string | null, now: number): string {
  if (!iso) return 'not yet'
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return 'unknown'
  const secs = Math.max(0, Math.round((now - then) / 1000))
  if (secs < 60) return `${String(secs)}s ago`
  if (secs < 3600) return `${String(Math.floor(secs / 60))}m ${String(secs % 60)}s ago`
  return `${String(Math.floor(secs / 3600))}h ${String(Math.floor((secs % 3600) / 60))}m ago`
}

function completionTone(percent: number): BadgeTone {
  if (percent >= 100) return 'ok'
  if (percent <= 0) return 'night'
  return 'accent'
}

function truncate(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function GroupRollup({ payload }: { payload: ProgressPayload }): ReactNode {
  return (
    <div className="progress-grid">
      {payload.groups.map((group, index) => {
        const style = groupStyle(index)
        const unmapped = group.id === 'G?'
        return (
          <div
            key={group.id}
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderLeft: `3px solid ${unmapped ? 'var(--hot)' : style.color}`,
              borderRadius: 4,
              padding: '8px 10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                marginBottom: 4,
              }}
            >
              <strong style={{ color: 'var(--fg)' }}>{group.label}</strong>
              <span style={{ color: 'var(--muted)' }}>
                {String(group.done)}/{String(group.total)} ({String(group.percent)}%)
              </span>
            </div>
            <ProgressBar value={group.percent} max={100} tone={style.tone} size="sm" />
          </div>
        )
      })}
    </div>
  )
}

function TrendLine({ payload }: { payload: ProgressPayload }): ReactNode {
  const points = payload.history.slice(-60)
  if (points.length < 2) {
    return <span style={{ color: 'var(--muted)', fontSize: 11 }}>Trend needs two samples.</span>
  }
  const values = points.map((p) => p.percent)
  const low = Math.min(...values)
  const high = Math.max(...values)
  const span = high - low || 1
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 200
      const y = 34 - ((p.percent - low) / span) * 30
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={200} height={38} viewBox="0 0 200 38" role="img" aria-label="Completion trend while the cockpit has been open">
        <polyline points={path} fill="none" stroke="var(--cyan)" strokeWidth={2} />
      </svg>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
        {String(low)}% → {String(high)}% · {String(points.length)} samples
      </span>
    </div>
  )
}

export function CockpitProgressView({
  payload,
  rows,
  rowsMatched,
  rowsLoading,
  filters,
  setFilters,
  live,
  error,
  lastReceived,
  netClosedSinceOpen,
  copy,
}: CockpitProgressViewProps): ReactNode {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const milestoneColumns: ColumnDef<TodoTask>[] = [
    { key: 'id', label: 'Task', render: (row) => <span style={{ fontFamily: 'var(--font-mono)' }}>{row.id}</span> },
    { key: 'title', label: 'Deliverable', render: (row) => <span title={row.title}>{truncate(row.title)}</span> },
    {
      key: 'priority',
      label: 'P',
      align: 'center',
      render: (row) => <Badge tone={row.priority === 'P0' ? 'hot' : 'night'}>{row.priority}</Badge>,
    },
    { key: 'difficulty', label: 'D', align: 'center' },
    { key: 'milestone', label: 'M', align: 'center' },
  ]

  return (
    <div className="tab-content" style={{ overflowY: 'auto' }}>
      <div className="terminal-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--muted)' }}>
            SOURCE: TODO.md · READ-ONLY PROJECTION · NOT A TASK REGISTER
          </span>
          {live ? <Badge tone="ok">LIVE</Badge> : <Badge tone="night">POLLING</Badge>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {netClosedSinceOpen !== 0 ? (
            <Badge tone={netClosedSinceOpen > 0 ? 'ok' : 'hot'}>
              {netClosedSinceOpen > 0 ? `+${String(netClosedSinceOpen)}` : String(netClosedSinceOpen)} THIS SESSION
            </Badge>
          ) : null}
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)' }}>
            <LiveDot state={live ? 'live' : 'connecting'} />
            LAST DELIVERY: {formatAgo(lastReceived, now)}
          </span>
        </div>
      </div>

      {error ? <Alert tone="hot">{error}</Alert> : null}

      {!payload || payload.total === 0 ? (
        <EmptyState title="No register rows parsed" hint="TODO.md is unreadable or contains no canonical task rows." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
          <div className="progress-grid">
            <StatCard label={copy.closedTasks} value={`${String(payload.done)} / ${String(payload.total)}`} hint={`${String(payload.open)} open`} />
            <div>
              <StatCard label={copy.overallProgress} value={`${String(payload.percent)}%`} hint="checked boxes in the register" />
              <ProgressBar value={payload.percent} max={100} tone="ok" size="sm" />
            </div>
            <StatCard
              label={copy.openBlockersHeader}
              value={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {String(payload.openP0.length)}
                  {payload.openP0.length > 0 ? <Badge tone="hot">P0</Badge> : <Badge tone="ok">CLEAR</Badge>}
                </span>
              }
              hint={payload.openP0.length > 0 ? truncate(payload.openP0.join(', '), 90) : 'No open P0 rows'}
            />
            <StatCard label="Register updated" value={formatAgo(payload.generatedAt, now)} hint={payload.registerPath} />
          </div>

          {payload.stale ? <Alert tone="accent">Showing the last good parse; the register could not be re-read.</Alert> : null}

          <Panel title="Milestone groups" subtitle="Percentage of each group's canonical task rows marked done">
            <GroupRollup payload={payload} />
            <div style={{ marginTop: 12 }}>
              <TrendLine payload={payload} />
            </div>
          </Panel>

          <Panel title="Priorities" subtitle="Open rows by priority class">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {PRIORITY_OPTIONS.map((priority) => {
                const tally = payload.priorities[priority]
                if (!tally) return null
                return (
                  <Badge key={priority} tone={priority === 'P0' && tally.open > 0 ? 'hot' : 'cyan'}>
                    {priority} · {String(tally.done)}/{String(tally.total)} done · {String(tally.open)} open
                  </Badge>
                )
              })}
            </div>
          </Panel>

          <Panel title="Milestones" subtitle="Select a milestone to filter the task list">
            <DataTable
              columns={[
                { key: 'id', label: 'Milestone', render: (row) => <b style={{ fontFamily: 'var(--font-mono)' }}>{row.id}</b> },
                { key: 'group', label: 'Group', align: 'center' },
                { key: 'done', label: 'Done', align: 'right' },
                { key: 'open', label: 'Open', align: 'right' },
                { key: 'total', label: 'Total', align: 'right' },
                {
                  key: 'percent',
                  label: 'Progress',
                  render: (row) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 180 }}>
                      <ProgressBar value={row.percent} max={100} tone={row.percent >= 100 ? 'ok' : 'cyan'} size="sm" />
                      <Badge tone={completionTone(row.percent)}>{String(row.percent)}%</Badge>
                    </div>
                  ),
                },
                {
                  key: 'focus',
                  label: '',
                  align: 'right',
                  render: (row) => (
                    <Button
                      variant={filters.milestone === row.id ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, milestone: prev.milestone === row.id ? '' : row.id }))
                      }
                    >
                      {filters.milestone === row.id ? 'Clear' : 'Focus'}
                    </Button>
                  ),
                },
              ]}
              rows={payload.milestones}
              rowKey={(row) => row.id}
            />
          </Panel>

          <Panel
            title="Task rows"
            subtitle={`${String(rows.length)} of ${String(rowsMatched)} matching rows · register ships open tasks in the summary payload`}
            actions={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {rowsLoading ? <Badge tone="accent">LOADING</Badge> : null}
              </div>
            }
          >
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
              <PillGroup label="Status">
                {STATUS_OPTIONS.map((status) => (
                  <Pill
                    key={status}
                    label={status.toUpperCase()}
                    active={filters.status === status}
                    tone={status === 'open' ? 'hot' : 'cyan'}
                    onClick={() => setFilters((prev) => ({ ...prev, status }))}
                  />
                ))}
              </PillGroup>
              <PillGroup label="Priority">
                {PRIORITY_OPTIONS.map((priority) => (
                  <Pill
                    key={priority}
                    label={priority}
                    active={filters.priority === priority}
                    tone={priority === 'P0' ? 'hot' : 'cyan'}
                    onClick={() => setFilters((prev) => ({ ...prev, priority: prev.priority === priority ? '' : priority }))}
                  />
                ))}
              </PillGroup>
              <PillGroup label="Milestone">
                <Pill
                  label="ALL"
                  active={filters.milestone === ''}
                  onClick={() => setFilters((prev) => ({ ...prev, milestone: '' }))}
                />
              </PillGroup>
            </div>
            <DataTable
              columns={milestoneColumns}
              rows={rows}
              rowKey={(row) => row.id}
              empty={filters.status === 'done' ? 'No rows match this filter.' : 'Nothing open in this slice.'}
            />
          </Panel>

          <Panel title="Live checkbox activity" subtitle="Transitions observed by this cockpit process since it started">
            {payload.flipLog.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 12 }}>
                No checkbox transitions observed since the cockpit started.
              </p>
            ) : (
              <div className="progress-flips">
                {payload.flipLog.map((flip, index) => (
                  <div
                    key={`${flip.taskId}-${String(index)}`}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      padding: '5px 8px',
                      borderBottom: '1px solid var(--border)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                    }}
                  >
                    <span style={{ color: 'var(--fg)', minWidth: 70 }}>{flip.taskId}</span>
                    <Badge tone={flip.to === 'done' ? 'ok' : 'hot'}>
                      {flip.from.toUpperCase()} → {flip.to.toUpperCase()}
                    </Badge>
                    <span style={{ color: 'var(--muted)' }}>{flip.at}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Card variant="outline">
            <CardHeader title="Provenance" />
            <CardBody>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', margin: 0 }}>
                Counts are derived from the canonical task rows in TODO.md each time the file changes. This panel never
                writes to the register; TODO.md remains the sole task and status source of truth.
              </p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
