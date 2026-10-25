import { Badge, DataTable, LiveDot, PageHeader, Panel, StatCard } from '@moonwitness/moonui'
import { dashboard } from '@/data/queries/ops'
import { EventStream } from '@/ui/client/EventStream'
import { AuditFeed, JobTable } from '@/ui/widgets/Feeds'
import { TierBadge } from '@/ui/widgets/ModelTable'

const uptime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds % 60}s`
}

export default async function DashboardPage() {
  // satu putaran, bukan dua: `/ops/dashboard` sudah menghitung model, cron, audit
  // dan job di sisi hub, jadi mengambil `_schema` di sini hanya menambah satu
  // request yang hasilnya tidak dibaca siapa pun.
  const ops = await dashboard()
  const totalRows = ops.models.reduce((sum, model) => sum + model.count, 0)
  const crons = ops.crons

  return (
    <div className="m-stack">
      <PageHeader
        title="Command center"
        subtitle={`engine ${ops.engine} · started ${ops.startedAt.slice(0, 19)} · up ${uptime(ops.uptimeSec)}`}
        breadcrumbs={[{ label: 'HQ', href: '/' }, { label: 'Dashboard' }]}
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
    </div>
  )
}
