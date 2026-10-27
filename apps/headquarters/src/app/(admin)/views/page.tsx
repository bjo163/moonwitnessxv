import { Badge, DataTable, PageHeader, Panel } from '@moonwitness/moonui'
import { getSchema } from '@/data/schema'
import { interpolate, modelViewCopy } from '../models/locale-copy'
import { requestLocale } from '@/lib/request-locale'

export default async function ViewsIndexPage() {
  const locale = await requestLocale()
  const copy = modelViewCopy(locale)
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
        title={copy.views}
        subtitle={interpolate(copy.viewsSummary, { count: rows.length })}
        breadcrumbs={[{ label: copy.hq, href: '/' }, { label: copy.views }]}
      />
      <Panel title={copy.projections} subtitle={copy.viewDescription}>
        <DataTable
          rows={rows}
          rowKey={(row) => row.key}
          columns={[
            { key: 'key', label: copy.view, render: (row) => <a className="m-mono" href={`/views/${row.key}`}>{row.key}</a> },
            { key: 'label', label: copy.label },
            { key: 'from', label: copy.from },
            { key: 'addon', label: copy.addon },
            { key: 'kind', label: copy.kind, render: (row) => <Badge tone={row.kind === 'aggregate' ? 'moon' : 'night'}>{row.kind === 'aggregate' ? (locale === 'id' ? 'agregat' : 'aggregate') : (locale === 'id' ? 'proyeksi' : 'projection')}</Badge> },
            { key: 'expand', label: copy.expands },
            { key: 'limit', label: locale === 'id' ? 'Batas' : 'Limit', align: 'right' },
          ]}
        />
      </Panel>
    </div>
  )
}
