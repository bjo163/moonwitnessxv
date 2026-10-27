import { Badge, Button, Field, PageHeader, Pagination, Panel, SelectInput, TableSkeleton, TextInput } from '@moonwitness/moonui'
import {
  readMatchPreview,
  readTerms,
  type MatchPreview,
  type TermsPage,
} from '@/data/queries/terms'
import { panelErrorMessage } from '@/data/queries/error'
import { MatchPreviewView, TermIndexTable, TermList } from '@/ui/components/terms'
import { DataPanel, OutcomePanel, PanelState, readPanel, type PanelCopy } from '@/ui/components/states'
import { headers } from 'next/headers'
import { DOCK_LOCALE_HEADER, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'UNILEX Terms',
  description: 'A versioned, source-backed multilingual vocabulary projection with explicit reviews.',
}

const PAGE_SIZE = 12

interface TermsSearchParams {
  q?: string
  lane?: string
  scope?: string
  status?: string
  source?: string
  page?: string
  left?: string
  right?: string
}

const stringOf = (value: string | undefined): string => (typeof value === 'string' ? value.trim() : '')

function termsHref(filters: Record<string, string>, page: number): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '') params.set(key, value)
  }
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `/terms?${query}` : '/terms'
}

export default async function TermsPageView({
  searchParams,
}: {
  searchParams: Promise<TermsSearchParams>
}) {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const copy = getStatesCopy(locale)

  const params = await searchParams
  const filters = {
    q: stringOf(params.q),
    lane: stringOf(params.lane),
    scope: stringOf(params.scope),
    status: stringOf(params.status),
    source: stringOf(params.source),
  }
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const listCopy: PanelCopy = {
    loadingLabel: copy.loadingContent,
    emptyTitle: copy.emptyTermsTitle,
    emptyHint: copy.emptyTermsSearchHint,
    errorMessage: copy.errorTermsUnavailable,
  }
  const previewCopy: PanelCopy = {
    loadingLabel: copy.loadingContent,
    emptyTitle: copy.emptyMatchPreviewIdle,
    emptyHint: copy.formTermsSearchHint,
    errorMessage: copy.errorMatchPreviewUnavailable,
  }

  // The filter shell reads its options from the same projection, so the list is
  // awaited here; the panel still speaks all four states through PanelState.
  const outcome = await readPanel<TermsPage>(
    () => readTerms({ ...filters, limit: PAGE_SIZE, offset }),
    listCopy,
    (termsPage) => termsPage.terms.length === 0,
    (err) => panelErrorMessage(err, copy.errorTermsUnavailable),
  )
  const registryReady = outcome.state === 'ready'
  const options = registryReady ? outcome.value.options : { lanes: [], scopes: [], statuses: [], sources: [] }
  const total = registryReady ? outcome.value.total : null

  const left = stringOf(params.left)
  const right = stringOf(params.right)

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="UNILEX Terms"
        subtitle="Source-backed terminology · forms kept in their own script · every identity is reviewed"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Terms' }]}
        actions={total === null ? undefined : <Badge tone="cyan">{total} terms</Badge>}
      />

      <OutcomePanel outcome={outcome} copy={listCopy} skeleton={<TableSkeleton rows={8} cols={7} />}>
        {(termsPage) => (
          <Panel title="Registry" subtitle="The seed is pinned, versioned and explicitly not a validated universal dictionary.">
            <div className="dk-terms-registry">
              <p className="dk-terms-notice" role="note">
                {termsPage.registry.notice}
              </p>
              <dl className="dk-terms-registry-meta">
                <dt>Version</dt>
                <dd>
                  {termsPage.registry.version} · {termsPage.registry.status}
                </dd>
                <dt>Pinned seed</dt>
                <dd>
                  {termsPage.registry.seedCount} concepts · {termsPage.registry.pin}
                </dd>
                <dt>Path</dt>
                <dd>
                  <code>{termsPage.registry.path}</code>
                </dd>
                <dt>Raw SHA-256</dt>
                <dd>
                  <code className="dk-terms-hash">{termsPage.registry.rawSha256}</code>
                </dd>
                <dt>Addenda</dt>
                <dd>
                  {termsPage.registry.addenda.version}: {termsPage.registry.addenda.ids.join(', ')} —{' '}
                  {termsPage.registry.addenda.notice}
                </dd>
              </dl>
            </div>
          </Panel>
        )}
      </OutcomePanel>

      <Panel title="Filter the Terms Table" subtitle="Search matches IDs, labels, definitions and recorded forms.">
        <form className="dk-terms-filter-form" method="get" action="/terms" role="search">
          <Field label={copy.formSearch} htmlFor="terms-q" hint={copy.formTermsSearchHint}>
            <TextInput id="terms-q" name="q" defaultValue={filters.q} placeholder={copy.formTermsSearchPlaceholder} maxLength={80} />
          </Field>
          <Field label={copy.formLane} htmlFor="terms-lane">
            <SelectInput
              id="terms-lane"
              name="lane"
              defaultValue={filters.lane}
              placeholder={copy.formAllLanes}
              options={options.lanes.map((lane) => ({ value: lane, label: lane }))}
            />
          </Field>
          <Field label={copy.formScope} htmlFor="terms-scope">
            <SelectInput
              id="terms-scope"
              name="scope"
              defaultValue={filters.scope}
              placeholder={copy.formAllScopes}
              options={options.scopes.map((scope) => ({ value: scope, label: scope }))}
            />
          </Field>
          <Field label={copy.formEditorialStatus} htmlFor="terms-status">
            <SelectInput
              id="terms-status"
              name="status"
              defaultValue={filters.status}
              placeholder={copy.formAllStatuses}
              options={options.statuses.map((status) => ({ value: status, label: status }))}
            />
          </Field>
          <Field label={copy.formSource} htmlFor="terms-source">
            <SelectInput
              id="terms-source"
              name="source"
              defaultValue={filters.source}
              placeholder={copy.formAllSources}
              options={options.sources
                .filter((source) => source.code)
                .map((source) => ({
                  value: source.code as string,
                  label: [source.code, source.title ?? (source.sourceType ?? '')].filter(Boolean).join(' — '),
                }))}
            />
          </Field>
          <Button type="submit" variant="accent">
            {copy.formApplyFilters}
          </Button>
        </form>
      </Panel>

      <OutcomePanel outcome={outcome} copy={listCopy} skeleton={<TableSkeleton rows={8} cols={7} />}>
        {(termsPage) => (
          <>
            <TermIndexTable page={termsPage} />
            <TermList page={termsPage} />
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={termsPage.total}
              hrefFor={(target) => termsHref(filters, target)}
            />
          </>
        )}
      </OutcomePanel>

      <Panel
        title="Match preview"
        subtitle="Surface comparison only. The preview never claims identity and never writes a relation."
      >
        <form className="dk-terms-match-form" method="get" action="/terms" role="search">
          {Object.entries(filters).map(([key, value]) =>
            value !== '' ? <input key={key} type="hidden" name={key} value={value} /> : null,
          )}
          {page > 1 ? <input type="hidden" name="page" value={String(page)} /> : null}
          <Field label={copy.formLeftSurface} htmlFor="terms-left">
            <TextInput id="terms-left" name="left" defaultValue={left} placeholder="ZILL" maxLength={160} />
          </Field>
          <Field label={copy.formRightSurface} htmlFor="terms-right">
            <TextInput id="terms-right" name="right" defaultValue={right} placeholder="ZIIL" maxLength={160} />
          </Field>
          <Button type="submit" variant="paper">
            {copy.formPreviewMatch}
          </Button>
        </form>

        {left !== '' && right !== '' ? (
          <DataPanel
            load={() => readMatchPreview(left, right)}
            copy={previewCopy}
            mapError={(err) => panelErrorMessage(err, copy.errorMatchPreviewUnavailable)}
            skeleton={<TableSkeleton rows={2} cols={4} />}
          >
            {(preview: MatchPreview) => <MatchPreviewView preview={preview} />}
          </DataPanel>
        ) : (
          <PanelState
            state="empty"
            loadingLabel={previewCopy.loadingLabel}
            emptyTitle={previewCopy.emptyTitle}
            emptyHint={previewCopy.emptyHint}
          >
            {null}
          </PanelState>
        )}
      </Panel>
    </div>
  )
}
