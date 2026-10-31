import { Badge, DataTable, PageHeader, Panel, TierBadge } from '@moonwitness/moonui'
import { getSchema } from '@/data/schema'
import { interpolate, modelViewCopy } from './locale-copy'
import { requestLocale } from '@/lib/request-locale'

export default async function ModelsIndexPage() {
  const locale = await requestLocale()
  const copy = modelViewCopy(locale)
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
        title={copy.models}
        subtitle={interpolate(copy.modelsSummary, { models: rows.length, addons: doc.addons.length })}
        breadcrumbs={[{ label: copy.hq, href: '/' }, { label: copy.models }]}
      />
      <Panel title={copy.registry} subtitle={copy.registrySubtitle}>
        <DataTable
          rows={rows}
          rowKey={(row) => row.name}
          columns={[
            { key: 'name', label: copy.model, render: (row) => <a className="m-mono" href={`/models/${row.name}`}>{row.name}</a> },
            { key: 'label', label: copy.label },
            { key: 'addon', label: copy.addon },
            { key: 'tier', label: copy.tier, render: (row) => <TierBadge tier={row.tier} /> },
            { key: 'fields', label: locale === 'id' ? 'Bidang' : 'Fields', align: 'right' },
            { key: 'delete', label: copy.deleteRule },
            { key: 'ops', label: copy.operations, render: (row) => <span className="m-mono" style={{ fontSize: 11 }}>{row.ops}</span> },
          ]}
        />
      </Panel>
      <Panel title={copy.addonRegistry} subtitle={copy.installedOrder}>
        <DataTable
          rows={doc.addons}
          rowKey={(row) => row.name}
          columns={[
            { key: 'name', label: copy.addon },
            { key: 'version', label: copy.version },
            { key: 'depends', label: copy.depends, render: (row) => (row.depends.length ? row.depends.join(', ') : '—') },
          ]}
        />
      </Panel>
      <div className="m-row">
        <Badge tone="moon">{copy.dataDriven}</Badge>
        <span className="m-muted">{copy.schemaNote}</span>
      </div>
    </div>
  )
}
