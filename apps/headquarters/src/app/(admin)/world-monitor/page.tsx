import {
  Badge,
  Card,
  CardBody,
  Crown,
  DataTable,
  LinkButton,
  LiveDot,
  ModuleCard,
  PageHeader,
  Panel,
  ProgressBar,
  StatCard,
  ZineNote,
  type BadgeTone,
  type ProgressTone,
} from '@moonwitness/moonui'
import { getMonitorOverview } from '@/data/queries/monitor'

interface SearchParams {
  radar?: string
  source?: string
  platform?: string
  driver?: string
}

const PRIORITY_TONE: Record<string, BadgeTone> = {
  critical: 'pink',
  high: 'accent',
  normal: 'cyan',
  low: 'night',
}

const SENTIMENT_TONE: Record<string, BadgeTone> = {
  alert: 'pink',
  critical: 'hot',
  positive: 'ok',
  neutral: 'cyan',
}

const DRIVER_META: ReadonlyArray<{
  key: string
  title: string
  tone: 'cyan' | 'yellow' | 'pink' | 'purple'
  icon: string
  desc: string
}> = [
  {
    key: 'rss',
    title: 'YouTube Atom / RSS',
    tone: 'cyan',
    icon: '📻',
    desc: 'Zero-key YouTube channel XML & standard RSS 2.0 feeds.',
  },
  {
    key: 'playwright',
    title: 'Playwright DOM',
    tone: 'pink',
    icon: '🎭',
    desc: 'Headless Chromium automation for X, Instagram & YouTube live search.',
  },
  {
    key: 'openclaw',
    title: 'OpenClaw Crawler',
    tone: 'yellow',
    icon: '🦀',
    desc: 'DOM-to-Markdown structural extraction & anti-bot social tag feeds.',
  },
  {
    key: 'agent',
    title: 'Agentic AI Triage',
    tone: 'purple',
    icon: '🤖',
    desc: 'Autonomous multi-step synthesis, urgency scoring & executive briefs.',
  },
]

const urgencyTone = (score: number): ProgressTone =>
  score >= 85 ? 'pink' : score >= 70 ? 'accent' : score >= 55 ? 'cyan' : 'blue'

export default async function WorldMonitorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const overview = await getMonitorOverview()

  const selectedRadarId = params.radar || undefined
  const selectedSourceId = params.source || undefined
  const selectedPlatform = params.platform || undefined
  const selectedDriver = params.driver || undefined

  const selectedRadar = overview.radars.find((r) => r.id === selectedRadarId)

  const filteredSources = overview.sources.filter((s) => {
    if (selectedRadarId && s.radarRef !== selectedRadarId) return false
    if (selectedPlatform && s.platform !== selectedPlatform) return false
    if (selectedDriver && s.driver !== selectedDriver) return false
    return true
  })

  const selectedSource = overview.sources.find((s) => s.id === selectedSourceId)

  const filteredSignals = overview.signals.filter((sig) => {
    if (selectedSourceId && sig.sourceRef !== selectedSourceId) return false
    if (selectedRadarId && sig.radarRef !== selectedRadarId) return false
    if (selectedPlatform && sig.platform !== selectedPlatform) return false
    return true
  })

  const buildHref = (patch: Partial<SearchParams>): string => {
    const next: Record<string, string> = {}
    const merged = {
      radar: params.radar,
      source: params.source,
      platform: params.platform,
      driver: params.driver,
      ...patch,
    }
    for (const [k, v] of Object.entries(merged)) {
      if (v) next[k] = v
    }
    const qs = new URLSearchParams(next).toString()
    return qs ? `/world-monitor?${qs}` : '/world-monitor'
  }

  return (
    <div className="m-stack" style={{ gap: 14 }}>
      {/* 1. HERO BANNER */}
      <Card variant="art" bgImage="/art/mission-hero.jpg" className="hq-mc-hero">
        <CardBody className="hq-mc-hero-body">
          <div>
            <div className="m-row" style={{ alignItems: 'flex-start', gap: 10 }}>
              <h1 className="hq-mc-title">
                WORLD <span>MONITOR</span>
              </h1>
              <Crown tone="cyan" size="lg" />
            </div>

            <p className="m-mono" style={{ margin: '8px 0 12px', fontSize: 12 }}>
              3-Tier OSINT & Social/YouTube Telemetry Control Plane.
              <br />
              Tier 1: Macro Radars // Tier 2: Channels & Queries // Tier 3: Captured Signals & AI Triage.
            </p>

            <div className="hq-mc-pipeline">
              <span>TIER 1: RADARS ({overview.counts.radars})</span>
              <i>//</i>
              <span>TIER 2: SOURCES ({overview.counts.sources})</span>
              <i>//</i>
              <span>TIER 3: SIGNALS ({overview.counts.signals})</span>
              <i>//</i>
              <span>SENTINEL WORKERS</span>
            </div>
          </div>

          <div className="m-stack" style={{ gap: 8, alignItems: 'flex-end' }}>
            <ZineNote tone="accent" tilt="right">
              ♛ SENTINEL 3-TIER ENGINE
            </ZineNote>
            <div className="m-row" style={{ gap: 8 }}>
              <LinkButton href="/models/monitor_radars/new" variant="primary" size="sm">
                + New Radar
              </LinkButton>
              <LinkButton href="/models/monitor_sources/new" variant="cyan" size="sm">
                + New Source
              </LinkButton>
              <LinkButton href="/models/monitor_signals" variant="ghost" size="sm">
                All Signals →
              </LinkButton>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. TOP KPI ROW */}
      <div className="m-grid m-grid-3">
        <StatCard
          label="Tier 1 · Active Radars"
          value={`${overview.counts.activeRadars} / ${overview.counts.radars}`}
          hint="macro operations & issues"
        />
        <StatCard
          label="Tier 2 · Live Sources"
          value={`${overview.counts.activeSources} / ${overview.counts.sources}`}
          hint="YouTube, X, IG, TikTok, RSS, Web"
        />
        <StatCard
          label="Tier 3 · Captured Signals"
          value={overview.counts.signals}
          hint={`${overview.counts.criticalSignals} critical / high-urgency alerts`}
        />
      </div>

      {/* 3. FILTER BAR (PLATFORM & SENTINEL DRIVER) */}
      <Panel
        title="Filter Telemetry Matrix"
        subtitle="Filter across the 3-tier hierarchy by platform, collector driver, or active selection."
        actions={
          selectedRadarId || selectedSourceId || selectedPlatform || selectedDriver ? (
            <LinkButton href="/world-monitor" variant="ghost" size="sm">
              Reset Filters ✕
            </LinkButton>
          ) : undefined
        }
      >
        <div className="m-row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div className="m-row" style={{ gap: 6 }}>
            <span className="m-mono m-muted" style={{ fontSize: 11 }}>
              PLATFORM:
            </span>
            {(['youtube', 'x', 'instagram', 'tiktok', 'web', 'rss'] as const).map((plat) => (
              <LinkButton
                key={plat}
                href={buildHref({ platform: selectedPlatform === plat ? undefined : plat, source: undefined })}
                variant={selectedPlatform === plat ? 'primary' : 'ghost'}
                size="sm"
              >
                {plat.toUpperCase()}
              </LinkButton>
            ))}
          </div>

          <div className="m-row" style={{ gap: 6 }}>
            <span className="m-mono m-muted" style={{ fontSize: 11 }}>
              DRIVER:
            </span>
            {(['rss', 'api', 'playwright', 'openclaw', 'agent'] as const).map((drv) => (
              <LinkButton
                key={drv}
                href={buildHref({ driver: selectedDriver === drv ? undefined : drv, source: undefined })}
                variant={selectedDriver === drv ? 'cyan' : 'ghost'}
                size="sm"
              >
                {drv}
              </LinkButton>
            ))}
          </div>
        </div>
      </Panel>

      {/* 4. 3-HIERARCHY INTERACTIVE DRILLDOWN */}
      <section className="hq-wm-hierarchy">
        {/* TIER 1: RADARS */}
        <Panel
          title={`1. Radars (${overview.radars.length})`}
          subtitle="Macro issue / operation radar"
          actions={
            <LinkButton href="/models/monitor_radars" variant="ghost" size="sm">
              CRUD →
            </LinkButton>
          }
        >
          <div className="m-stack" style={{ gap: 8 }}>
            {overview.radars.map((radar) => {
              const isSelected = radar.id === selectedRadarId
              return (
                <a
                  key={radar.id}
                  href={buildHref({ radar: isSelected ? undefined : radar.id, source: undefined })}
                  className="hq-wm-item"
                  data-selected={isSelected ? 'true' : undefined}
                >
                  <div className="m-row" style={{ justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: 13 }}>{radar.name}</strong>
                    <Badge tone={PRIORITY_TONE[radar.priority] ?? 'cyan'}>{radar.priority}</Badge>
                  </div>

                  {radar.description ? (
                    <span className="m-muted" style={{ fontSize: 11, lineHeight: 1.35 }}>
                      {radar.description}
                    </span>
                  ) : null}

                  <div className="m-row" style={{ justifyContent: 'space-between', marginTop: 2 }}>
                    <Badge tone="night">{radar.category}</Badge>
                    <span className="m-mono m-muted" style={{ fontSize: 10 }}>
                      {radar.sourceCount} sources · {radar.signalCount} signals
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        </Panel>

        {/* TIER 2: SOURCES */}
        <Panel
          title={`2. Sources (${filteredSources.length})`}
          subtitle={
            selectedRadar
              ? `Filtered by radar: ${selectedRadar.name}`
              : 'YouTube channels, social accounts & queries'
          }
          actions={
            <LinkButton href="/models/monitor_sources" variant="ghost" size="sm">
              CRUD →
            </LinkButton>
          }
        >
          <div className="m-stack" style={{ gap: 8 }}>
            {filteredSources.length === 0 ? (
              <div className="m-empty">No sources match the active filter.</div>
            ) : (
              filteredSources.map((src) => {
                const isSelected = src.id === selectedSourceId
                return (
                  <a
                    key={src.id}
                    href={buildHref({ source: isSelected ? undefined : src.id })}
                    className="hq-wm-item"
                    data-selected={isSelected ? 'true' : undefined}
                  >
                    <div className="m-row" style={{ justifyContent: 'space-between' }}>
                      <span className="m-row" style={{ gap: 6 }}>
                        <LiveDot on={src.healthStatus === 'healthy'} />
                        <strong style={{ fontSize: 12 }}>{src.name}</strong>
                      </span>
                      <Badge tone="cyan">{src.platform}</Badge>
                    </div>

                    <div className="m-mono m-muted" style={{ fontSize: 10, wordBreak: 'break-all' }}>
                      {src.externalTarget ? `target: ${src.externalTarget}` : src.targetUrl}
                    </div>

                    <div className="m-row" style={{ justifyContent: 'space-between', marginTop: 2 }}>
                      <span className="m-row" style={{ gap: 4 }}>
                        <Badge tone="accent">{src.driver}</Badge>
                        <Badge tone="night">{src.kind}</Badge>
                      </span>
                      <span className="m-mono m-muted" style={{ fontSize: 10 }}>
                        every {src.intervalMin}m · {src.signalCount} signals
                      </span>
                    </div>
                  </a>
                )
              })
            )}
          </div>
        </Panel>

        {/* TIER 3: CAPTURED SIGNALS & AI INTELLIGENCE */}
        <Panel
          title={`3. Signals & AI Triage (${filteredSignals.length})`}
          subtitle={
            selectedSource
              ? `Signals from ${selectedSource.name}`
              : selectedRadar
                ? `Signals in ${selectedRadar.name}`
                : 'Latest captured videos, posts & AI intelligence'
          }
          actions={
            <LinkButton href="/views/monitorSignalFeed" variant="ghost" size="sm">
              Feed View →
            </LinkButton>
          }
        >
          <div className="m-stack" style={{ gap: 10 }}>
            {filteredSignals.length === 0 ? (
              <div className="m-empty">No signals captured for this selection yet.</div>
            ) : (
              filteredSignals.map((sig) => (
                <div key={sig.id} className="hq-wm-item">
                  <div className="m-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <a
                      href={`/models/monitor_signals/${sig.id}`}
                      style={{ fontWeight: 700, fontSize: 13, color: 'var(--fg)', textDecoration: 'none' }}
                    >
                      {sig.title}
                    </a>
                    <Badge tone={SENTIMENT_TONE[sig.sentiment] ?? 'cyan'}>{sig.sentiment}</Badge>
                  </div>

                  {sig.summary ? (
                    <div className="m-muted" style={{ fontSize: 11, lineHeight: 1.4 }}>
                      {sig.summary}
                    </div>
                  ) : null}

                  {sig.aiSummary ? (
                    <div
                      className="m-mono"
                      style={{
                        fontSize: 11,
                        padding: '6px 8px',
                        background: 'rgba(0, 229, 255, 0.08)',
                        borderLeft: '3px solid var(--cyan)',
                      }}
                    >
                      <strong>AI TRIAGE:</strong> {sig.aiSummary}
                    </div>
                  ) : null}

                  <div className="m-stack" style={{ gap: 4, marginTop: 2 }}>
                    <div className="m-row" style={{ justifyContent: 'space-between', fontSize: 10 }}>
                      <span className="m-mono m-muted">URGENCY SCORE: {sig.urgencyScore}/100</span>
                      <span className="m-mono m-muted">
                        👁 {sig.viewsCount.toLocaleString()} · ♥ {sig.likesCount.toLocaleString()} · 💬{' '}
                        {sig.commentsCount.toLocaleString()}
                      </span>
                    </div>
                    <ProgressBar value={sig.urgencyScore} tone={urgencyTone(sig.urgencyScore)} />
                  </div>

                  <div className="m-row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
                    <span className="m-row" style={{ gap: 6 }}>
                      <Badge tone="night">{sig.platform}</Badge>
                      <Badge tone={sig.status === 'promoted' || sig.status === 'verified' ? 'ok' : 'accent'}>
                        {sig.status}
                      </Badge>
                      {sig.author ? (
                        <span className="m-mono m-muted" style={{ fontSize: 10 }}>
                          by {sig.author}
                        </span>
                      ) : null}
                    </span>
                    <a
                      href={sig.url}
                      target="_blank"
                      rel="noreferrer"
                      className="m-mono"
                      style={{ fontSize: 10, color: 'var(--accent)' }}
                    >
                      Source URL ↗
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </section>

      {/* 5. SENTINEL WORKER DRIVER ARCHITECTURE & TASK QUEUE */}
      <PageHeader
        title="Sentinel Collector Drivers (apps/sentinel)"
        subtitle="Decoupled worker drivers for YouTube RSS/API, Playwright headless browsers, OpenClaw crawlers, and Agentic AI."
      />

      <div className="m-grid m-grid-2">
        {DRIVER_META.map((drv) => {
          const count = overview.sources.filter((s) => s.driver === drv.key).length
          return (
            <ModuleCard
              key={drv.key}
              href={buildHref({ driver: drv.key })}
              icon={drv.icon}
              tone={drv.tone}
              title={drv.title}
              description={drv.desc}
              compact
              metrics={
                <>
                  <Badge tone="ok">{count} sources assigned</Badge>
                  <Badge tone="cyan">driver={drv.key}</Badge>
                </>
              }
            />
          )
        })}
      </div>

      <Panel
        title="Sentinel Task Queue (monitor_tasks)"
        subtitle="Pull-queue tasks claimed and executed by apps/sentinel workers."
        actions={
          <LinkButton href="/models/monitor_tasks" variant="ghost" size="sm">
            Inspect Queue →
          </LinkButton>
        }
      >
        <DataTable
          rows={overview.tasks}
          rowKey={(row) => row.id}
          empty="No tasks in queue yet. Run `pnpm --filter @moonwitness/sentinel once` or `POST /api/v1/monitor/enqueue` to dispatch collector tasks."
          columns={[
            { key: 'driver', label: 'driver', render: (row) => <Badge tone="cyan">{row.driver}</Badge> },
            {
              key: 'status',
              label: 'status',
              render: (row) => (
                <Badge tone={row.status === 'done' ? 'ok' : row.status === 'error' ? 'hot' : 'accent'}>
                  {row.status}
                </Badge>
              ),
            },
            { key: 'workerId', label: 'worker', render: (row) => <span className="m-mono">{row.workerId ?? '—'}</span> },
            {
              key: 'signalsCaptured',
              label: 'signals',
              align: 'right',
              render: (row) => <span className="m-mono">{row.signalsCaptured}</span>,
            },
            { key: 'detail', label: 'detail' },
          ]}
        />
      </Panel>
    </div>
  )
}
