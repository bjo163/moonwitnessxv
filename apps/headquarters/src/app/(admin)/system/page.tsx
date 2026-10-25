import { Badge, DataTable, LiveDot, PageHeader, Panel, StatCard } from '@moonwitness/moonui'
import { dashboard } from '@/data/queries/ops'
import { getSchema } from '@/data/schema'
import { TierBadge } from '@/ui/widgets/ModelTable'

const anchor = (method: string, path: string): string =>
  `${method.toLowerCase()}-${path.replace(/^\/+/, '').replace(/[^a-zA-Z0-9]+/g, '-')}`

export default async function SystemPage() {
  const [doc, ops] = await Promise.all([getSchema(), dashboard()])

  return (
    <div className="m-stack">
      <PageHeader
        title="System"
        subtitle={`engine ${ops.engine} · seed policy visible per model · ${doc.endpoints.length} endpoints`}
        breadcrumbs={[{ label: 'HQ', href: '/' }, { label: 'System' }]}
        actions={
          <span className="m-row">
            <LiveDot />
            <Badge tone={ops.engine === 'pg' ? 'ok' : 'accent'}>{ops.engine}</Badge>
          </span>
        }
      />

      <div className="m-grid m-grid-3">
        <StatCard label="min demo rows" value={doc.minDemoRows} hint="seed policy floor" />
        <StatCard label="bus events" value={ops.busEvents.length} hint={ops.busEvents.join(' · ')} />
        <StatCard label="crons" value={doc.crons.length} hint="armed at boot" />
      </div>

      <Panel title="Endpoints" subtitle="every declarative route, stream endpoints flagged">
        <DataTable
          rows={doc.endpoints}
          rowKey={(row) => `${row.method} ${row.path}`}
          columns={[
            {
              key: 'path',
              label: 'route',
              render: (row) => (
                <span id={anchor(row.method, row.path)} className="m-mono">
                  {row.method} {row.path}
                </span>
              ),
            },
            { key: 'addon', label: 'addon' },
            {
              key: 'acl',
              label: 'acl',
              render: (row) => <Badge tone={row.acl === 'public' ? 'accent' : 'night'}>{Array.isArray(row.acl) ? row.acl.join(',') : row.acl}</Badge>,
            },
            {
              key: 'stream',
              label: 'transport',
              render: (row) => <Badge tone={row.stream ? 'moon' : 'night'}>{row.stream ? 'stream' : 'json'}</Badge>,
            },
          ]}
        />
      </Panel>

      <Panel title="Crons" subtitle="declared jobs (last run from the ops job log)">
        <DataTable
          rows={ops.crons}
          rowKey={(row) => `${row.addon}/${row.name}`}
          empty="No crons declared."
          columns={[
            { key: 'name', label: 'cron', render: (row) => `${row.addon}/${row.name}` },
            { key: 'every', label: 'every' },
            { key: 'lastRun', label: 'last run', render: (row) => <span className="m-mono">{row.lastRun ?? '—'}</span> },
          ]}
        />
      </Panel>

      <Panel title="Models" subtitle="data tier, ACL surface and delete strategy">
        <DataTable
          rows={Object.entries(doc.models).map(([name, meta]) => ({ name, meta }))}
          rowKey={(row) => row.name}
          columns={[
            { key: 'name', label: 'model', render: (row) => <a className="m-mono" href={`/models/${row.name}`}>{row.name}</a> },
            { key: 'label', label: 'label', render: (row) => row.meta.label },
            { key: 'tier', label: 'tier', render: (row) => <TierBadge tier={row.meta.dataTier} /> },
            { key: 'delete', label: 'delete', render: (row) => row.meta.delete },
            {
              key: 'acl',
              label: 'acl',
              render: (row) => (
                <span className="m-mono" style={{ fontSize: 11 }}>
                  {Object.entries(row.meta.acl)
                    .map(([op, rule]) => `${op}:${Array.isArray(rule) ? rule.join('|') : rule}`)
                    .join(' ')}
                </span>
              ),
            },
          ]}
        />
      </Panel>

      <Panel title="Addons" subtitle="install order = dependency order">
        <DataTable
          rows={doc.addons}
          rowKey={(row) => row.name}
          columns={[
            { key: 'name', label: 'addon' },
            { key: 'version', label: 'version' },
            { key: 'depends', label: 'depends', render: (row) => (row.depends.length ? row.depends.join(', ') : '—') },
          ]}
        />
      </Panel>

      <Panel title="Bus" subtitle="the events an addon may observe">
        <div className="m-row">
          {ops.busEvents.map((event) => (
            <Badge key={event} tone="moon">
              {event}
            </Badge>
          ))}
        </div>
      </Panel>
    </div>
  )
}
