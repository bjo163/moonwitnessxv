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
  PosterCard,
  StatCard,
  ZineNote,
  type ProgressTone,
} from '@moonwitness/moonui'
import { dashboard } from '@/data/queries/ops'
import { EventStream } from '@/ui/client/EventStream'
import { AuditFeed, JobTable } from '@/ui/widgets/Feeds'
import { TierBadge } from '@/ui/widgets/ModelTable'

const uptime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds % 60}s`
}

const PROJECTS: ReadonlyArray<{
  title: string
  status: string
  tone: ProgressTone
  progress: number
  img: string
  href: string
}> = [
  {
    title: 'THE BATTERIES',
    status: 'Active',
    tone: 'cyan',
    progress: 72,
    img: '/art/proj-batteries.jpg',
    href: '/models/station',
  },
  {
    title: 'PENDETA-ONLINE',
    status: 'Writing',
    tone: 'blue',
    progress: 58,
    img: '/art/proj-pendeta.jpg',
    href: '/models/scheduleSlot',
  },
  {
    title: 'ALLAH-PROMISE',
    status: 'Research',
    tone: 'accent',
    progress: 34,
    img: '/art/proj-allah.jpg',
    href: '/views/stationCatalog',
  },
  {
    title: 'ZILL',
    status: 'Planning',
    tone: 'purple',
    progress: 18,
    img: '/art/proj-zill.jpg',
    href: '/models',
  },
]

const WORKFLOWS = [
  { icon: '🤖', name: 'Content Analysis Agent', detail: 'Scanning new sources...', state: 'Running' },
  { icon: '🖼', name: 'Poster Generation Batch', detail: 'Creating visuals (12/15)...', state: 'Running' },
  { icon: '✔', name: 'Fact Check Pipeline', detail: 'Verifying 8 items...', state: 'Running' },
  { icon: '📅', name: 'Cross-Post Scheduler', detail: "Preparing tomorrow's posts...", state: 'Queued' },
  { icon: '📡', name: 'Research Signal Watcher', detail: 'Monitoring global feeds...', state: 'Running' },
] as const

const COMMAND_FEED_ITEMS = [
  { icon: '🟣', text: 'New signal detected: Climate movement in SE Asia', ago: '12m ago' },
  { icon: '🔵', text: 'Chapter 12: Broken Sky updated', ago: '2h ago' },
  { icon: '🩷', text: 'Poster set completed: PENDETA-ONLINE', ago: '4h ago' },
  { icon: '🟡', text: 'Source flagged for review (needs verification)', ago: '6h ago' },
  { icon: '🟢', text: 'AI workflow completed: Cultural Trends Report', ago: '8h ago' },
] as const

const MISSION_ALERTS = [
  { tone: 'accent' as const, text: 'High volume of signals from MENA region', ago: '12m ago' },
  { tone: 'hot' as const, text: 'Source verification needed for 3 items', ago: '1h ago' },
  { tone: 'accent' as const, text: 'Publishing queue delayed (2 items)', ago: '3h ago' },
] as const

export default async function DashboardPage() {
  // satu putaran, bukan dua: `/ops/dashboard` sudah menghitung model, cron, audit
  // dan job di sisi hub, jadi mengambil `_schema` di sini hanya menambah satu
  // request yang hasilnya tidak dibaca siapa pun.
  const ops = await dashboard()
  const totalRows = ops.models.reduce((sum, model) => sum + model.count, 0)
  const crons = ops.crons

  return (
    <div className="m-stack" style={{ gap: 14 }}>
      {/* 1. MISSION CONTROL HERO BANNER (Image 4) */}
      <Card variant="art" bgImage="/art/mission-hero.jpg" className="hq-mc-hero">
        <CardBody className="hq-mc-hero-body">
          <div>
            <div className="m-row" style={{ alignItems: 'flex-start', gap: 10 }}>
              <h1 className="hq-mc-title">
                MISSION <span>CONTROL</span>
              </h1>
              <Crown tone="gold" size="lg" />
            </div>

            <p className="m-mono" style={{ margin: '8px 0 12px', fontSize: 12 }}>
              Coordinate stories, research, world signals, AI workflows,
              <br />
              and publishing operations. Different people. Same sky.
              <br />A brighter tomorrow for a bolder humanity.
            </p>

            <div className="hq-mc-pipeline">
              <span>PLAN</span>
              <i>//</i>
              <span>CREATE</span>
              <i>//</i>
              <span>RESEARCH</span>
              <i>//</i>
              <span>VERIFY</span>
              <i>//</i>
              <span>PUBLISH</span>
              <i>//</i>
              <span>AMPLIFY</span>
            </div>
          </div>

          <div className="m-row" style={{ gap: 16 }} aria-hidden="true">
            <ZineNote tone="dark" tilt="left">
              SAME MOON
              <br />
              DIFFERENT PEOPLE
            </ZineNote>
            <ZineNote tone="accent" tilt="right">
              ♛ FOLLOW THE SIGNAL
            </ZineNote>
          </div>
        </CardBody>
      </Card>

      {/* 2. 3-COLUMN BENTO GRID AROUND THE ORBITAL MOON RADAR (Image 4) */}
      <section className="hq-mc-bento">
        <div className="m-stack" style={{ gap: 10, justifyContent: 'space-between' }}>
          <ModuleCard
            href="/models"
            icon="✎"
            tone="pink"
            title="Story Forge"
            description="Develop stories, characters, worlds and narratives."
            metrics={
              <>
                <Badge tone="ok">12 active projects</Badge>
                <Badge tone="cyan">4 in review</Badge>
              </>
            }
          />
          <ModuleCard
            href="/views"
            icon="▣"
            tone="cyan"
            title="Poster Lab"
            description="Create visual stories, posters, and social campaigns."
            metrics={
              <>
                <Badge tone="ok">8 in progress</Badge>
                <Badge tone="pink">3 queued</Badge>
              </>
            }
          />
          <ModuleCard
            href="/models/station"
            icon="⚗"
            tone="purple"
            title="Research Lab"
            description="Explore cultures, ideas, people and real world context."
            metrics={
              <>
                <Badge tone="ok">46 active signals</Badge>
                <Badge tone="cyan">12 new today</Badge>
              </>
            }
          />
        </div>

        {/* Center Orbital Blue Moon Radar */}
        <Card className="hq-mc-radar-card">
          <img
            src="/art/moon-radar.jpg"
            alt="Moonwitness orbital network connecting ideas, cultures, worlds, publication, stories, and people"
            className="hq-radar-img"
          />
          <div className="hq-radar-nodes" aria-hidden="true">
            <span className="hq-node-top">
              <Badge tone="cyan">IDEAS</Badge>
            </span>
            <span className="hq-node-tl">
              <Badge tone="cyan">PEOPLE</Badge>
            </span>
            <span className="hq-node-tr">
              <Badge tone="cyan">CULTURES</Badge>
            </span>
            <span className="hq-node-bl">
              <Badge tone="cyan">STORIES</Badge>
            </span>
            <span className="hq-node-br">
              <Badge tone="cyan">WORLDS</Badge>
            </span>
            <span className="hq-node-bottom">
              <Badge tone="cyan">PUBLICATION</Badge>
            </span>
          </div>
          <div className="hq-radar-caption">
            <ZineNote tone="dark" tilt="left">
              A BRIGHTER TOMORROW
              <br />
              FOR A BOLDER HUMANITY. <Crown tone="gold" size="sm" />
            </ZineNote>
          </div>
        </Card>

        <div className="m-stack" style={{ gap: 10, justifyContent: 'space-between' }}>
          <ModuleCard
            href="/views/stationCatalog"
            icon="🌐"
            tone="yellow"
            title="World Monitor"
            description="Track global signals, trends and stories in motion."
            compact
            metrics={
              <>
                <Badge tone="ok">128 live sources</Badge>
                <Badge tone="pink">7 alerts</Badge>
              </>
            }
          />
          <ModuleCard
            href="/models/scheduleSlot"
            icon="➤"
            tone="pink"
            title="Publishing Hub"
            description="Prepare and publish across platforms and communities."
            compact
            metrics={
              <>
                <Badge tone="ok">5 scheduled</Badge>
                <Badge tone="cyan">2 publishing</Badge>
              </>
            }
          />
          <ModuleCard
            href="/system"
            icon="⚙"
            tone="cyan"
            title="Automation Center"
            description="Manage AI workflows, agents and automated operations."
            compact
            metrics={
              <>
                <Badge tone="ok">{Math.max(18, crons.length)} active workflows</Badge>
                <Badge tone="pink">{ops.jobs.length || 3} runs</Badge>
              </>
            }
          />
          <ModuleCard
            href="/models"
            icon="🛡"
            tone="purple"
            title="Source Verification"
            description="Verify sources, facts and media before publishing."
            compact
            metrics={
              <>
                <Badge tone="ok">{totalRows || 34} items verified</Badge>
                <Badge tone="pink">{ops.models.length} models</Badge>
              </>
            }
          />
        </div>
      </section>

      {/* 3. BOTTOM 3-PANEL ROW: PROJECT UNIVERSE + ACTIVE WORKFLOWS + COMMAND FEED / ALERTS */}
      <section className="hq-mc-bottom-grid" id="project-universe">
        <Panel
          title="Project Universe"
          subtitle="All projects, worlds and creative universes."
          actions={
            <LinkButton href="/models" variant="ghost" size="sm">
              View All →
            </LinkButton>
          }
        >
          <div className="hq-universe-cards">
            {PROJECTS.map((proj) => (
              <PosterCard
                key={proj.title}
                href={proj.href}
                title={proj.title}
                image={proj.img}
                status={proj.status}
                tone={proj.tone}
                progress={proj.progress}
              />
            ))}
          </div>
        </Panel>

        <Panel
          title="Active Workflows"
          actions={
            <LinkButton href="/system" variant="ghost" size="sm">
              View All →
            </LinkButton>
          }
        >
          <div className="m-stack" style={{ gap: 8 }}>
            {WORKFLOWS.map((wf) => (
              <div className="hq-workflow-row" key={wf.name}>
                <Badge tone="moon">{wf.icon}</Badge>
                <div className="hq-wf-copy">
                  <strong>{wf.name}</strong>
                  <span className="m-muted" style={{ fontSize: 10 }}>
                    {wf.detail}
                  </span>
                </div>
                <Badge tone={wf.state === 'Running' ? 'ok' : 'cyan'}>{wf.state}</Badge>
              </div>
            ))}
          </div>
        </Panel>

        <div className="m-stack" style={{ gap: 10 }} id="alerts">
          <Panel
            title="Command Feed"
            actions={
              <LinkButton href="/#telemetry" variant="ghost" size="sm">
                View All →
              </LinkButton>
            }
          >
            <div className="m-stack" style={{ gap: 6 }}>
              {COMMAND_FEED_ITEMS.map((item) => (
                <div className="hq-feed-row" key={item.text}>
                  <span>{item.icon}</span>
                  <span className="hq-feed-text">{item.text}</span>
                  <span className="m-mono m-muted" style={{ fontSize: 10 }}>
                    {item.ago}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="Mission Alerts"
            actions={
              <LinkButton href="/system" variant="ghost" size="sm">
                View All →
              </LinkButton>
            }
          >
            <div className="m-stack" style={{ gap: 6 }}>
              {MISSION_ALERTS.map((alert) => (
                <div className="hq-feed-row" key={alert.text}>
                  <Badge tone={alert.tone}>⚠</Badge>
                  <span className="hq-feed-text">{alert.text}</span>
                  <span className="m-mono m-muted" style={{ fontSize: 10 }}>
                    {alert.ago}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      {/* 4. LIVE MOONQL ENGINE & REGISTRY TELEMETRY */}
      <section className="m-stack" id="telemetry" style={{ marginTop: 12 }}>
        <PageHeader
          title="MoonQL Hub Telemetry"
          subtitle={`engine ${ops.engine} · started ${ops.startedAt.slice(0, 19)} · up ${uptime(ops.uptimeSec)}`}
          breadcrumbs={[{ label: 'The Empire', href: '/' }, { label: 'Mission Control' }, { label: 'Hub Telemetry' }]}
          actions={
            <span className="m-row">
              <LiveDot on={ops.engine === 'memory' || ops.engine === 'pg'} />
              <Badge tone={ops.engine === 'pg' ? 'ok' : 'accent'}>{ops.engine}</Badge>
            </span>
          }
        />

        <div className="m-grid m-grid-3">
          <StatCard label="models" value={ops.models.length} hint="REST-exposed" />
          <StatCard label="rows" value={totalRows} hint="all models" />
          <StatCard label="addons" value={ops.addons.length} hint="dependency order" />
          <StatCard label="crons" value={crons.length} hint={`${ops.jobs.length} runs recorded`} />
          <StatCard label="bus events" value={ops.busEvents.length} hint="typology" />
          <StatCard label="uptime" value={uptime(ops.uptimeSec)} hint={`min demo rows ${ops.minDemoRows}`} />
        </div>

        <Panel title="Models" subtitle="counts, default-data tier and exposure">
          <DataTable
            rows={ops.models}
            rowKey={(row) => row.name}
            columns={[
              { key: 'name', label: 'model', render: (row) => <a className="m-mono" href={`/models/${row.name}`}>{row.name}</a> },
              { key: 'label', label: 'label' },
              { key: 'addon', label: 'addon' },
              { key: 'dataTier', label: 'tier', render: (row) => <TierBadge tier={row.dataTier} /> },
              { key: 'count', label: 'rows', align: 'right', render: (row) => <span className="m-mono">{row.count}</span> },
              { key: 'delete', label: 'delete' },
              {
                key: 'rest',
                label: 'ops',
                render: (row) => (
                  <span className="m-mono" style={{ fontSize: 11 }}>
                    {Object.entries(row.rest)
                      .filter(([, on]) => on)
                      .map(([op]) => op)
                      .join(' · ')}
                  </span>
                ),
              },
            ]}
          />
        </Panel>

        <div className="m-grid m-grid-2">
          <Panel title="Live bus" subtitle="SSE proxy from the radio hub">
            <EventStream />
          </Panel>
          <Panel title="Cron watch" subtitle="declared jobs and their last run">
            <DataTable
              rows={crons}
              rowKey={(row) => `${row.addon}/${row.name}`}
              empty="No crons declared."
              columns={[
                { key: 'name', label: 'cron', render: (row) => `${row.addon}/${row.name}` },
                { key: 'every', label: 'every' },
                {
                  key: 'lastRun',
                  label: 'last run',
                  render: (row) => <span className="m-mono">{row.lastRun ? row.lastRun.slice(11, 19) : '—'}</span>,
                },
              ]}
            />
            <div style={{ height: 16 }} />
            <JobTable rows={ops.jobs.slice(0, 5)} />
          </Panel>
        </div>

        <Panel title="Audit trail" subtitle="the last 10 writes (ops_audit)">
          <AuditFeed rows={ops.audit} />
        </Panel>

        <Panel title="Views" subtitle="read-only projections declared by addons">
          <DataTable
            rows={ops.views}
            rowKey={(row) => row.key}
            empty="No views."
            columns={[
              { key: 'key', label: 'view', render: (row) => <a className="m-mono" href={`/views/${row.key}`}>{row.key}</a> },
              { key: 'from', label: 'from' },
              { key: 'addon', label: 'addon' },
              {
                key: 'aggregate',
                label: 'kind',
                render: (row) => <Badge tone={row.aggregate ? 'moon' : 'night'}>{row.aggregate ? 'aggregate' : 'projection'}</Badge>,
              },
            ]}
          />
        </Panel>
      </section>
    </div>
  )
}
