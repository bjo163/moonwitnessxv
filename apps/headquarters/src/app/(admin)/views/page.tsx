import { Badge, DataTable, PageHeader, Panel } from '@moonwitness/moonui'
import { getSchema } from '@/data/schema'

export default async function ViewsIndexPage() {
  const doc = await getSchema()
  const rows = Object.entries(doc.views).map(([key, meta]) => ({
    key,
    label: meta.label,
    from: meta.from,
    addon: meta.addon,
    limit: meta.limit,
    kind: meta.aggregate ? 'aggregate' : 'projection',
    expand: (meta.expand ?? []).join(', ') || '—',
  }))

  return (
    <div className="m-stack">
      <PageHeader
        title="Views"
        subtitle={`${rows.length} read-only projections declared by addons`}
        breadcrumbs={[{ label: 'HQ', href: '/' }, { label: 'Views' }]}
      />
      <Panel title="Projections" subtitle="a view is the curated, ACL-aware face of a model">
        <DataTable
          rows={rows}
          rowKey={(row) => row.key}
          columns={[
            { key: 'key', label: 'view', render: (row) => <a className="m-mono" href={`/views/${row.key}`}>{row.key}</a> },
            { key: 'label', label: 'label' },
            { key: 'from', label: 'from' },
            { key: 'addon', label: 'addon' },
            { key: 'kind', label: 'kind', render: (row) => <Badge tone={row.kind === 'aggregate' ? 'moon' : 'night'}>{row.kind}</Badge> },
            { key: 'expand', label: 'expands' },
            { key: 'limit', label: 'limit', align: 'right' },
          ]}
        />
      </Panel>
    </div>
  )
}
