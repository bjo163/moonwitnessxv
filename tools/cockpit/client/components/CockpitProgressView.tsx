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
import type { ProgressPayload, TodoTask, TodoTaskStatus } from '../types'
import type { TaskStatusFilter, TodoProgressFilters } from '../hooks/useTodoProgress'
import type { CockpitCopyCatalog } from '../lib/cockpit-copy'
import { sessionBadgeText } from '../lib/progress-math'

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

/** Group labels are UI copy, not server data — the server sends English fallbacks. */
const GROUP_LABEL_KEYS: Record<string, keyof CockpitCopyCatalog> = {
  G0: 'groupFoundation',
  G1: 'groupSource',
  G2: 'groupResearch',
  G3: 'groupWitness',
  G4: 'groupOperations',
  G5: 'groupOptionalResearch',
  G6: 'groupRelease',
  G7: 'groupEcosystem',
}

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

function formatAgo(iso: string | null, now: number, copy: CockpitCopyCatalog): string {
  if (!iso) return copy.timeNotYet
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return copy.timeUnknown
  const secs = Math.max(0, Math.round((now - then) / 1000))
  if (secs < 60) return `${String(secs)}${copy.timeSeconds}`
  if (secs < 3600) return `${String(Math.floor(secs / 60))}${copy.timeMinutes} ${String(secs % 60)}${copy.timeSeconds}`
  return `${String(Math.floor(secs / 3600))}${copy.timeHours} ${String(Math.floor((secs % 3600) / 60))}${copy.timeMinutes}`
}

function completionTone(percent: number): BadgeTone {
  if (percent >= 100) return 'ok'
  if (percent <= 0) return 'night'
  return 'accent'
}

function truncate(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

/** Checkbox state words come from the catalog, never from the machine token. */
function stateLabel(state: TodoTaskStatus, copy: CockpitCopyCatalog): string {
  return (state === 'done' ? copy.colDone : copy.colOpen).toUpperCase()
}

function GroupRollup({ payload, copy }: { payload: ProgressPayload; copy: CockpitCopyCatalog }): ReactNode {
  return (
    <div className="progress-grid">
      {payload.groups.map((group, index) => {
        const style = groupStyle(index)
        const unmapped = group.id === 'G?'
        const labelKey = GROUP_LABEL_KEYS[group.id]
        const label = labelKey ? copy[labelKey] : group.label
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
              <strong style={{ color: 'var(--fg)' }}>{label}</strong>
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

function TrendLine({ payload, copy }: { payload: ProgressPayload; copy: CockpitCopyCatalog }): ReactNode {
  const points = payload.history.slice(-60)
  if (points.length < 2) {
    return <span style={{ color: 'var(--muted)', fontSize: 11 }}>{copy.progressTrendNeedsTwo}</span>
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
      <svg width={200} height={38} viewBox="0 0 200 38" role="img" aria-label={copy.progressTrendAria}>
        <polyline points={path} fill="none" stroke="var(--cyan)" strokeWidth={2} />
      </svg>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
        {String(low)}% → {String(high)}% · {String(points.length)} {copy.progressTrendSamples}
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

  const sessionBadge = sessionBadgeText(netClosedSinceOpen, copy.progressSessionSuffix)

  const milestoneColumns: ColumnDef<TodoTask>[] = [
    {
      key: 'id',
      label: copy.colTask,
      render: (row) => <span style={{ fontFamily: 'var(--font-mono)' }}>{row.id}</span>,
    },
    { key: 'title', label: copy.colDeliverable, render: (row) => <span title={row.title}>{truncate(row.title)}</span> },
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
            {copy.progressSourceNote}
          </span>
          {live ? <Badge tone="ok">{copy.progressLiveBadge}</Badge> : <Badge tone="night">{copy.progressPollingBadge}</Badge>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {sessionBadge ? (
            <Badge tone={netClosedSinceOpen > 0 ? 'ok' : 'hot'}>{sessionBadge}</Badge>
          ) : null}
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)' }}>
            <LiveDot state={live ? 'live' : 'connecting'} />
            {copy.progressLastDelivery}: {formatAgo(lastReceived, now, copy)}
          </span>
        </div>
      </div>

      {error ? <Alert tone="hot">{error}</Alert> : null}

      {!payload || payload.total === 0 ? (
        <EmptyState title={copy.progressEmptyTitle} hint={copy.progressEmptyHint} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 900, color: 'var(--fg)' }}>
              {copy.progressTitle}
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{copy.progressSubtitle}</span>
          </div>

          <div className="progress-grid">
            <StatCard
              label={copy.closedTasks}
              value={`${String(payload.done)} / ${String(payload.total)}`}
              hint={`${String(payload.open)} ${copy.progressOpenSuffix}`}
            />
            <div>
              <StatCard label={copy.overallProgress} value={`${String(payload.percent)}%`} hint={copy.progressCompletionHint} />
              <ProgressBar value={payload.percent} max={100} tone="ok" size="sm" />
            </div>
            <StatCard
              label={copy.openBlockersHeader}
              value={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {String(payload.openP0.length)}
                  {payload.openP0.length > 0 ? (
                    <Badge tone="hot">P0</Badge>
                  ) : (
                    <Badge tone="ok">{copy.progressClear}</Badge>
                  )}
                </span>
              }
              hint={payload.openP0.length > 0 ? truncate(payload.openP0.join(', '), 90) : copy.progressNoP0Hint}
            />
            <StatCard
              label={copy.progressRegisterUpdated}
              value={formatAgo(payload.generatedAt, now, copy)}
              hint={payload.registerLabel}
            />
          </div>

          {payload.stale ? <Alert tone="accent">{copy.progressStaleNote}</Alert> : null}

          <Panel title={copy.progressPanelGroups} subtitle={copy.progressPanelGroupsSub}>
            <GroupRollup payload={payload} copy={copy} />
            <div style={{ marginTop: 12 }}>
              <TrendLine payload={payload} copy={copy} />
            </div>
          </Panel>

          <Panel title={copy.progressPanelPriorities} subtitle={copy.progressPanelPrioritiesSub}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {PRIORITY_OPTIONS.map((priority) => {
                const tally = payload.priorities[priority]
                if (!tally) return null
                return (
                  <Badge key={priority} tone={priority === 'P0' && tally.open > 0 ? 'hot' : 'cyan'}>
                    {priority} · {String(tally.done)}/{String(tally.total)} {copy.colDone} · {String(tally.open)}{' '}
                    {copy.colOpen}
                  </Badge>
                )
              })}
            </div>
          </Panel>

          <Panel title={copy.progressPanelMilestones} subtitle={copy.progressPanelMilestonesSub}>
            <DataTable
              columns={[
                {
                  key: 'id',
                  label: copy.colMilestone,
                  render: (row) => <b style={{ fontFamily: 'var(--font-mono)' }}>{row.id}</b>,
                },
                { key: 'group', label: copy.colGroup, align: 'center' },
                { key: 'done', label: copy.colDone, align: 'right' },
                { key: 'open', label: copy.colOpen, align: 'right' },
                { key: 'total', label: copy.colTotal, align: 'right' },
                {
                  key: 'percent',
                  label: copy.colProgress,
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
                      {filters.milestone === row.id ? copy.progressClearFocus : copy.progressFocus}
                    </Button>
                  ),
                },
              ]}
              rows={payload.milestones}
              rowKey={(row) => row.id}
            />
          </Panel>

          <Panel
            title={copy.progressPanelRows}
            subtitle={`${String(rows.length)} / ${String(rowsMatched)} ${copy.progressShowingRows}`}
            actions={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {rowsLoading ? <Badge tone="accent">{copy.progressLoading}</Badge> : null}
              </div>
            }
          >
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
              <PillGroup label={copy.progressFilterStatus}>
                {STATUS_OPTIONS.map((status) => (
                  <Pill
                    key={status}
                    label={
                      status === 'open'
                        ? copy.progressFilterOpen
                        : status === 'done'
                        ? copy.progressFilterDone
                        : copy.progressFilterAll
                    }
                    active={filters.status === status}
                    tone={status === 'open' ? 'hot' : 'cyan'}
                    onClick={() => setFilters((prev) => ({ ...prev, status }))}
                  />
                ))}
              </PillGroup>
              <PillGroup label={copy.progressFilterPriority}>
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
              <PillGroup label={copy.progressFilterMilestone}>
                <Pill
                  label={copy.progressFilterAll}
                  active={filters.milestone === ''}
                  onClick={() => setFilters((prev) => ({ ...prev, milestone: '' }))}
                />
              </PillGroup>
            </div>
            <DataTable
              columns={milestoneColumns}
              rows={rows}
              rowKey={(row) => row.id}
              empty={filters.status === 'done' ? copy.progressNoRowsDone : copy.progressNoRowsOpen}
            />
          </Panel>

          <Panel title={copy.progressPanelFlips} subtitle={copy.progressPanelFlipsSub}>
            {payload.flipLog.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 12 }}>{copy.progressFlipsEmpty}</p>
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
                      {stateLabel(flip.from, copy)} → {stateLabel(flip.to, copy)}
                    </Badge>
                    <span style={{ color: 'var(--muted)' }}>{flip.at}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Card variant="outline">
            <CardHeader title={copy.provenanceTitle} />
            <CardBody>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', margin: 0 }}>
                {copy.provenanceBody}
              </p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
