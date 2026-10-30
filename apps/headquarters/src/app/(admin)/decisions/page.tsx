import { Badge, DataTable, PageHeader, Panel } from '@moonwitness/moonui'
import { listRecords } from '@/data/queries/records'
import { getSchema } from '@/data/schema'
import { guardModel } from '@/lib/authz'
import { HUMAN_DECISION_ROLES } from '@/lib/human-decision'
import { requestLocale } from '@/lib/request-locale'
import { loadSourceRightsInventory } from '@/lib/source-rights-inventory'

/**
 * M20-06 — the 100CENTER queue for ordinary human decisions. It reads stored
 * edition metadata only, never executes anything, and says so in every row.
 */
export default async function DecisionsPage() {
  const locale = await requestLocale()
  const doc = await getSchema()
  const model = doc.models.corpus_editions
  const inventory = await loadSourceRightsInventory(
    model,
    async (candidate) => (await guardModel(candidate, 'list')).allowed,
    () => listRecords('corpus_editions', { pageSize: 25, order: 'code' }),
  )
  const id = locale === 'id'
  const approvers = HUMAN_DECISION_ROLES.join(' / ')

  return (
    <div className="m-stack">
      <PageHeader
        title={id ? 'Antrean keputusan manusia' : 'Human decision queue'}
        subtitle={id
          ? 'Tugas dan insiden biasa yang membutuhkan keputusan manusia bernama. Tidak ada tindakan yang dijalankan otomatis.'
          : 'Ordinary tasks and incidents that need a named human decision. No action runs automatically.'}
        breadcrumbs={[{ label: 'HQ', href: '/' }, { label: id ? 'Keputusan' : 'Decisions' }]}
      />

      <Panel
        title={id ? 'Aturan keputusan' : 'Decision rules'}
        subtitle={id
          ? 'Kontrak classifyDecision menolak mandat non-manusia dan tidak pernah mengembalikan verdict yang dapat dieksekusi.'
          : 'The classifyDecision contract refuses non-human mandates and never returns an executable verdict.'}
        actions={<Badge tone="night">{id ? 'Hanya-baca' : 'Read only'}</Badge>}
      >
        <ol className="m-stack" style={{ margin: 0, paddingLeft: 18, gap: 6 }}>
          <li>{id ? 'Setiap keputusan membutuhkan operator manusia bernama dan approver manusia lain.' : 'Every decision needs a named human operator and a separate human approver.'}</li>
          <li>{id ? 'Mandat dari model, worker, agen, atau layanan ditolak.' : 'Mandates from a model, worker, agent, or service are refused.'}</li>
          <li>{id ? 'Tindakan tak dapat dibalik membutuhkan persetujuan eksplisit dan tidak pernah otomatis.' : 'Irreversible actions need explicit approval and never run automatically.'}</li>
          <li>{id ? `Peran approver yang dikenali: ${approvers}.` : `Recognized approver roles: ${approvers}.`}</li>
        </ol>
      </Panel>

      <Panel
        title={id ? 'Keputusan hak sumber D01' : 'D01 source rights decisions'}
        subtitle={id
          ? 'Baris berasal dari metadata edisi tersimpan. D01 tidak menyimpan keputusan review atau publikasi, dan tidak ada catatan rilis D08.'
          : 'Rows come from stored edition metadata. D01 stores no review or publication decision, and no D08 release record exists.'}
      >
        {!model || !model.operations.list ? (
          <p className="m-muted">{id ? 'Model metadata edisi tidak tersedia; tidak ada keputusan yang disimpulkan.' : 'The edition metadata model is unavailable; no decision is inferred.'}</p>
        ) : !inventory.accessAllowed ? (
          <p className="m-muted">{id ? 'Akses inventaris edisi tidak tersedia; antrean tidak dimuat.' : 'Edition inventory access is unavailable; the queue was not loaded.'}</p>
        ) : !inventory.sources ? (
          <p className="m-muted">{id ? 'Inventaris edisi gagal dimuat; antrean tidak dianggap kosong atau disetujui.' : 'The edition inventory could not be loaded; the queue is not treated as empty or approved.'}</p>
        ) : (
          <div className="m-stack">
            <p className="m-muted">
              {id
                ? `${inventory.sources.total ?? inventory.sources.rows.length} edisi menunggu keputusan manusia bernama.`
                : `${inventory.sources.total ?? inventory.sources.rows.length} editions await a named human decision.`}
            </p>
            <DataTable
              rows={inventory.sources.rows}
              rowKey={(row, index) => String(row.id ?? index)}
              empty={id ? 'Belum ada edisi tercatat.' : 'No editions recorded.'}
              columns={[
                { key: 'code', label: id ? 'Kode edisi' : 'Edition code', render: (row) => <span className="m-mono">{String(row.code ?? '—')}</span> },
                { key: 'name', label: id ? 'Edisi' : 'Edition', render: (row) => String(row.name ?? '—') },
                { key: 'rightsStatus', label: id ? 'Status hak tercatat' : 'Recorded rights status', render: (row) => <span className="m-mono">{String(row.rightsStatus ?? (id ? 'tidak dicatat' : 'not recorded'))}</span> },
                { key: 'decision', label: id ? 'Keputusan diperlukan' : 'Decision required', render: () => (id ? 'Operator manusia bernama + approver' : 'Named human operator + approver') },
                { key: 'automatic', label: id ? 'Tindakan otomatis' : 'Automatic action', render: () => <Badge tone="ok">{id ? 'Tidak ada' : 'None'}</Badge> },
              ]}
            />
            <p className="m-muted">
              {id
                ? 'Antrean ini tidak mengeksekusi atau menyetujui apa pun. Status hak yang jelas bukan bukti publikasi.'
                : 'This queue executes and approves nothing. Cleared rights are not proof of publication.'}
            </p>
          </div>
        )}
      </Panel>
    </div>
  )
}
