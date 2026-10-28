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
  Glyph,
} from '@moonwitness/moonui'
import { dashboard } from '@/data/queries/ops'
import { getMonitorOverview } from '@/data/queries/monitor'
import { listRecords, type ListResult } from '@/data/queries/records'
import { getSchema } from '@/data/schema'
import { guardEndpoint, guardModel } from '@/lib/authz'
import { AccessDenied } from '@/ui/widgets/AccessDenied'
import { EventStream } from '@/ui/client/EventStream'
import { AuditFeed, JobTable } from '@/ui/widgets/Feeds'
import { TierBadge } from '@/ui/widgets/ModelTable'
import { requestLocale } from '@/lib/request-locale'
import type { Locale } from '@moonwitness/core'
import type { ModelMeta } from '@moonwitness/moonql-client'

const uptime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds % 60}s`
}

export const sourceRightsLabel = (status: unknown, locale: Locale): { label: string; tone: 'ok' | 'hot' | 'night' } => {
  if (status === 'RIGHTS_EXACT_VERSION_CLEARED') {
    return locale === 'id'
      ? { label: 'Hak versi persis jelas · layak ditinjau untuk rilis', tone: 'ok' }
      : { label: 'Exact-version rights cleared · release eligible', tone: 'ok' }
  }
  if (status === 'METADATA_ONLY') {
    return locale === 'id'
      ? { label: 'Metadata saja · teks ditahan', tone: 'hot' }
      : { label: 'Metadata only · text withheld', tone: 'hot' }
  }
  if (status === 'RIGHTS_UNKNOWN') {
    return locale === 'id'
      ? { label: 'Hak belum diketahui · teks ditahan', tone: 'hot' }
      : { label: 'Rights unknown · text withheld', tone: 'hot' }
  }
  if (status === 'RESTRICTED') {
    return locale === 'id'
      ? { label: 'Dibatasi · teks ditahan', tone: 'hot' }
      : { label: 'Restricted · text withheld', tone: 'hot' }
  }
  // Unknown and legacy classifications fail closed. In particular, PUBLIC_DOMAIN
  // alone is not the corpus gate's exact-version clearance value.
  return locale === 'id'
    ? { label: 'Status hak belum diverifikasi · teks ditahan', tone: 'night' }
    : { label: 'Rights status not verified · text withheld', tone: 'night' }
}

export const sourceReviewLabel = (provenanceSha: unknown, locale: Locale): string => {
  const hasDigest = typeof provenanceSha === 'string' && /^[a-f0-9]{64}$/i.test(provenanceSha)
  if (locale === 'id') {
    return hasDigest
      ? 'Digest provenance tersedia; keputusan review/rilis tidak dicatat di model D01.'
      : 'Digest provenance tidak tersedia; keputusan review/rilis tidak dicatat di model D01.'
  }
  return hasDigest
    ? 'Provenance digest present; D01 does not record a review or publication decision.'
    : 'No provenance digest; D01 does not record a review or publication decision.'
}

function SourceRightsPanel({
  locale,
  model,
  accessAllowed,
  sources,
}: {
  locale: Locale
  model: ModelMeta | undefined
  accessAllowed: boolean
  sources: ListResult | null
}) {
  return (
    <Panel
      title={locale === 'id' ? 'Status hak dan sumber D01' : 'D01 rights and source status'}
      subtitle={locale === 'id'
        ? 'Status berasal dari metadata edisi yang tersimpan. Hak versi jelas bukan bukti bahwa edisi telah dipublikasikan.'
        : 'Status comes from stored edition metadata. Cleared rights do not prove that an edition has been published.'}
      actions={
        <LinkButton href="/models/corpus_editions" variant="ghost" size="sm">
          {locale === 'id' ? 'Semua edisi' : 'All editions'}
        </LinkButton>
      }
    >
      {!model || !model.operations.list ? (
        <p className="m-muted">
          {locale === 'id'
            ? 'Model metadata edisi tidak tersedia; status sumber tidak disimpulkan.'
            : 'The edition metadata model is unavailable; no source status is inferred.'}
        </p>
      ) : !accessAllowed ? (
        <p className="m-muted">
          {locale === 'id'
            ? 'Akses inventaris edisi tidak tersedia; data tidak dimuat.'
            : 'Edition inventory access is unavailable; no data was loaded.'}
        </p>
      ) : !sources ? (
        <p className="m-muted">
          {locale === 'id'
            ? 'Inventaris edisi gagal dimuat; status tidak dianggap kosong atau disetujui.'
            : 'The edition inventory could not be loaded; status is not treated as empty or approved.'}
        </p>
      ) : (
        <div className="m-stack">
          <p className="m-muted">
            {locale === 'id'
              ? `${sources.total ?? sources.rows.length} edisi tercatat. Status review/rilis belum disimpan pada model D01.`
              : `${sources.total ?? sources.rows.length} editions recorded. D01 does not store a review or publication status.`}
          </p>
          <DataTable
            rows={sources.rows}
            rowKey={(row, index) => String(row.id ?? index)}
            empty={locale === 'id' ? 'Belum ada edisi tercatat.' : 'No editions recorded.'}
            columns={[
              { key: 'code', label: locale === 'id' ? 'Kode edisi' : 'Edition code', render: (row) => <span className="m-mono">{String(row.code ?? '—')}</span> },
              { key: 'name', label: locale === 'id' ? 'Edisi' : 'Edition', render: (row) => String(row.name ?? '—') },
              {
                key: 'rightsStatus',
                label: locale === 'id' ? 'Hak / akses teks' : 'Rights / text access',
                render: (row) => {
                  const state = sourceRightsLabel(row.rightsStatus, locale)
                  return <Badge tone={state.tone}>{state.label}</Badge>
                },
              },
              { key: 'licenseName', label: locale === 'id' ? 'Lisensi tercatat' : 'Recorded license', render: (row) => String(row.licenseName ?? (locale === 'id' ? 'Tidak dicatat' : 'Not recorded')) },
              { key: 'reviewStatus', label: locale === 'id' ? 'Bukti review' : 'Review evidence', render: (row) => sourceReviewLabel(row.provenanceSha, locale) },
            ]}
          />
          <p className="m-muted">
            {locale === 'id'
              ? 'Teks hanya dapat diakses untuk RIGHTS_EXACT_VERSION_CLEARED. Status lain, nilai hilang, dan nilai tak dikenal tetap ditahan.'
              : 'Text is available only for RIGHTS_EXACT_VERSION_CLEARED. Other, missing, and unknown values remain withheld.'}
          </p>
        </div>
      )}
    </Panel>
  )
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
  { icon: 'AG', name: 'Content Analysis Agent', detail: 'Scanning new sources...', state: 'Running' },
  { icon: 'PO', name: 'Poster Generation Batch', detail: 'Creating visuals (12/15)...', state: 'Running' },
  { icon: 'FC', name: 'Fact Check Pipeline', detail: 'Verifying 8 items...', state: 'Running' },
  { icon: 'CP', name: 'Cross-Post Scheduler', detail: "Preparing tomorrow's posts...", state: 'Queued' },
  { icon: 'RW', name: 'Research Signal Watcher', detail: 'Monitoring global feeds...', state: 'Running' },
] as const

const COMMAND_FEED_ITEMS = [
  { icon: 'SG', text: 'New signal detected: Climate movement in SE Asia', ago: '12m ago' },
  { icon: 'CH', text: 'Chapter 12: Broken Sky updated', ago: '2h ago' },
  { icon: 'PS', text: 'Poster set completed: PENDETA-ONLINE', ago: '4h ago' },
  { icon: 'SR', text: 'Source flagged for review (needs verification)', ago: '6h ago' },
  { icon: 'AI', text: 'AI workflow completed: Cultural Trends Report', ago: '8h ago' },
] as const

const MISSION_ALERTS = [
  { tone: 'accent' as const, text: 'High volume of signals from MENA region', ago: '12m ago' },
  { tone: 'hot' as const, text: 'Source verification needed for 3 items', ago: '1h ago' },
  { tone: 'accent' as const, text: 'Publishing queue delayed (2 items)', ago: '3h ago' },
] as const

const EMPIRE_14_SYSTEMS = [
  { code: 'SYS-01', name: 'MoonWitness OS', domain: 'Umbrella runtime/experience contracts', status: 'ACTIVE', tone: 'cyan' as const },
  { code: 'SYS-02', name: 'Semantic Engine', domain: 'UNILEX senses & trilateral root triangulation', status: 'ACTIVE', tone: 'cyan' as const },
  { code: 'SYS-03', name: 'FURQAN Gate', domain: 'Source, evidence & claim classifier', status: 'OPERATIONAL', tone: 'accent' as const },
  { code: 'SYS-04', name: 'MIZAN Review', domain: 'Bounded evaluation of evidence & quality', status: 'NOMINAL', tone: 'ok' as const },
  { code: 'SYS-05', name: 'AMANAH Access', domain: 'Human permissions, mandate, and consent', status: 'GUARDED', tone: 'pink' as const },
  { code: 'SYS-06', name: 'SHURA Deliberation', domain: 'Consultation, peer review & appeal desk', status: 'IN_SESSION', tone: 'accent' as const },
  { code: 'SYS-07', name: '100CENTER', domain: 'Governed operator command workspace', status: 'ACTIVE', tone: 'ok' as const },
  { code: 'SYS-08', name: 'KITAB Ledger', domain: 'Verified, versioned knowledge & review ledger', status: 'SYNCED', tone: 'cyan' as const },
  { code: 'SYS-09', name: 'SIDRA TREE Graph', domain: 'Typed relation exploration & evidence graph', status: 'ONLINE', tone: 'ok' as const },
  { code: 'SYS-10', name: 'Command Hub', domain: 'Multi-service process supervisor & telemetry', status: 'NOMINAL', tone: 'cyan' as const },
  { code: 'SYS-11', name: 'Atmosphere OS', domain: 'Environmental sensor & space weather grid', status: 'STREAMING', tone: 'accent' as const },
  { code: 'SYS-12', name: 'HELIOGRID', domain: 'Solar energy & physics telemetry tracker', status: 'NOMINAL', tone: 'ok' as const },
  { code: 'SYS-13', name: 'ARSY Compute', domain: 'Approved orchestrator for bounded AI tools', status: 'BOUNDED', tone: 'pink' as const },
  { code: 'SYS-14', name: 'Material Forge', domain: 'Materials science & physical artifact ledger', status: 'STANDBY', tone: 'night' as const },
] as const

export default async function DashboardPage() {
  const locale = await requestLocale()
  const doc = await getSchema()
  // the telemetry blocks (engine, crons, job runs, audit trail, live bus) all
  // come from `/ops/dashboard` + `/ops/stream`, whose published ACL is admin-only:
  // checked before the fetch instead of letting a non-admin render crash on a 403
  const guard = await guardEndpoint(doc, 'GET', '/ops/dashboard')
  if (!guard.allowed) return <AccessDenied code={guard.code} />

  const sourceModel = doc.models.corpus_editions
  const sourceGuard = sourceModel ? await guardModel(sourceModel, 'list') : null
  const sources = sourceModel?.operations.list && sourceGuard?.allowed
    ? await listRecords('corpus_editions', { pageSize: 25, order: 'code' }).catch(() => null)
    : null
  const [ops, monitor] = await Promise.all([dashboard(), getMonitorOverview()])
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
              FOLLOW THE SIGNAL
            </ZineNote>
          </div>
        </CardBody>
      </Card>

      {/* 2. 3-COLUMN BENTO GRID AROUND THE ORBITAL MOON RADAR (Image 4) */}
      <section className="hq-mc-bento">
        <div className="m-stack" style={{ gap: 10, justifyContent: 'space-between' }}>
          <ModuleCard
            href="/models"
            icon="SF"
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
            icon="PL"
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
            href="/models/monitor_radars"
            icon="RL"
            tone="purple"
            title="Research Lab"
            description="Explore cultures, ideas, people and real world context."
            metrics={
              <>
                <Badge tone="ok">{monitor.counts.signals || 46} active signals</Badge>
                <Badge tone="cyan">{monitor.counts.activeRadars || 10} radars</Badge>
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
            href="/world-monitor"
            icon="WM"
            tone="yellow"
            title="World Monitor"
            description="Track global signals, trends and stories in motion."
            compact
            metrics={
              <>
                <Badge tone="ok">{monitor.counts.activeSources || 12} live sources</Badge>
                <Badge tone="pink">{monitor.counts.criticalSignals || 3} alerts</Badge>
              </>
            }
          />
          <ModuleCard
            href="/models/scheduleSlot"
            icon="PH"
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
            icon="AC"
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
            icon="SV"
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

      {/* 2.5 100CENTER: THE 14 SYSTEMS OF EMPIRE OF THE LIGHT (Section 21A.6) */}
      <Panel
        title="100CENTER · The 14 Systems of the Empire"
        subtitle="Bounded logical systems restored from Section 21A.6 — telemetry, evidence, and research compute."
        actions={<Badge tone="ok">14 / 14 SYNCHRONIZED</Badge>}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
          {EMPIRE_14_SYSTEMS.map((sys) => (
            <div
              key={sys.code}
              style={{
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                  {sys.code}
                </span>
                <Badge tone={sys.tone}>{sys.status}</Badge>
              </div>
              <strong style={{ fontSize: 13, color: 'var(--fg)' }}>{sys.name}</strong>
              <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>
                {sys.domain}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <SourceRightsPanel locale={locale} model={sourceModel} accessAllowed={sourceGuard?.allowed ?? false} sources={sources} />

      {/* 3. BOTTOM 3-PANEL ROW: PROJECT UNIVERSE + ACTIVE WORKFLOWS + COMMAND FEED / ALERTS */}
      <section className="hq-mc-bottom-grid" id="project-universe">
        <Panel
          title="Project Universe"
          subtitle="All projects, worlds and creative universes."
          actions={
            <LinkButton href="/models" variant="ghost" size="sm">
              View All
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
              View All
            </LinkButton>
          }
        >
          <div className="m-stack" style={{ gap: 8 }}>
            {WORKFLOWS.map((wf) => (
              <div className="hq-workflow-row" key={wf.name}>
                <Glyph code={wf.icon} tone="moon" size="sm" />
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
              <LinkButton href="/world-monitor" variant="ghost" size="sm">
                View All
              </LinkButton>
            }
          >
            <div className="m-stack" style={{ gap: 6 }}>
              {COMMAND_FEED_ITEMS.map((item) => (
                <div className="hq-feed-row" key={item.text}>
                  <Glyph code={item.icon} tone="cyan" size="sm" />
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
              <LinkButton href="/world-monitor" variant="ghost" size="sm">
                View All
              </LinkButton>
            }
          >
            <div className="m-stack" style={{ gap: 6 }}>
              {MISSION_ALERTS.map((alert) => (
                <div className="hq-feed-row" key={alert.text}>
                  <Badge tone={alert.tone}>WARN</Badge>
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
