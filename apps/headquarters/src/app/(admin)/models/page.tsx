import { Badge, DataTable, PageHeader, Panel } from '@moonwitness/moonui'
import { getSchema } from '@/data/schema'
import { TierBadge } from '@/ui/widgets/ModelTable'

export default async function ModelsIndexPage() {
  const doc = await getSchema()
  const rows = Object.entries(doc.models).map(([name, meta]) => ({
    name,
    label: meta.label,
    addon: meta.addon,
    tier: meta.dataTier,
    delete: meta.delete,
    fields: Object.keys(meta.fields).length,
    ops: Object.entries(meta.operations)
      .filter(([, on]) => on)
      .map(([op]) => op)
      .join(' '),
  }))

  return (
    <div className="m-stack">
      <PageHeader
        title="Models"
        subtitle={`${rows.length} REST-exposed models from ${doc.addons.length} addons`}
        breadcrumbs={[{ label: 'HQ', href: '/' }, { label: 'Models' }]}
      />
      <Panel title="Registry" subtitle="click a model to browse and edit its rows">
        <DataTable
          rows={rows}
          rowKey={(row) => row.name}
          columns={[
            { key: 'name', label: 'model', render: (row) => <a className="m-mono" href={`/models/${row.name}`}>{row.name}</a> },
            { key: 'label', label: 'label' },
            { key: 'addon', label: 'addon' },
            { key: 'tier', label: 'tier', render: (row) => <TierBadge tier={row.tier} /> },
            { key: 'fields', label: 'fields', align: 'right' },
            { key: 'delete', label: 'delete' },
            { key: 'ops', label: 'operations', render: (row) => <span className="m-mono" style={{ fontSize: 11 }}>{row.ops}</span> },
          ]}
        />
      </Panel>
      <Panel title="Addons" subtitle="installed in dependency order">
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
      <div className="m-row">
        <Badge tone="moon">data-driven</Badge>
        <span className="m-muted">every table, form and menu on this screen came from GET /_schema</span>
      </div>
    </div>
  )
}
