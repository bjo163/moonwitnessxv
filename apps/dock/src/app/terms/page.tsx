import { MoonApiError } from '@moonwitness/moonql-client'
import { Alert, Badge, Button, Field, PageHeader, Panel, Pagination, SelectInput, TextInput } from '@moonwitness/moonui'
import {
  readMatchPreview,
  readTerms,
  type MatchPreview,
  type TermsPage,
} from '@/data/queries/terms'
import { MatchPreviewView, TermList } from '@/ui/components/terms'
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

  let termsPage: TermsPage | null = null
  let termsError: string | null = null
  try {
    termsPage = await readTerms({ ...filters, limit: PAGE_SIZE, offset })
  } catch (err) {
    termsError = err instanceof MoonApiError ? err.message : copy.errorTermsUnavailable
  }

  const left = stringOf(params.left)
  const right = stringOf(params.right)
  let preview: MatchPreview | null = null
  let previewError: string | null = null
  if (left !== '' && right !== '') {
    try {
      preview = await readMatchPreview(left, right)
    } catch (err) {
      previewError = err instanceof MoonApiError ? err.message : copy.errorMatchPreviewUnavailable
    }
  }

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="UNILEX Terms"
        subtitle="Source-backed terminology · forms kept in their own script · every identity is reviewed"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Terms' }]}
        actions={termsPage ? <Badge tone="cyan">{termsPage.total} terms</Badge> : undefined}
      />

      {termsPage ? (
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
      ) : null}

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
              options={(termsPage?.options.lanes ?? []).map((lane) => ({ value: lane, label: lane }))}
            />
          </Field>
          <Field label={copy.formScope} htmlFor="terms-scope">
            <SelectInput
              id="terms-scope"
              name="scope"
              defaultValue={filters.scope}
              placeholder={copy.formAllScopes}
              options={(termsPage?.options.scopes ?? []).map((scope) => ({ value: scope, label: scope }))}
            />
          </Field>
          <Field label={copy.formEditorialStatus} htmlFor="terms-status">
            <SelectInput
              id="terms-status"
              name="status"
              defaultValue={filters.status}
              placeholder={copy.formAllStatuses}
              options={(termsPage?.options.statuses ?? []).map((status) => ({ value: status, label: status }))}
            />
          </Field>
          <Field label={copy.formSource} htmlFor="terms-source">
            <SelectInput
              id="terms-source"
              name="source"
              defaultValue={filters.source}
              placeholder={copy.formAllSources}
              options={(termsPage?.options.sources ?? [])
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

      {termsError ? <Alert tone="hot">{termsError}</Alert> : null}

      {termsPage ? (
        <>
          <TermList page={termsPage} />
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={termsPage.total}
            hrefFor={(target) => termsHref(filters, target)}
          />
        </>
      ) : null}

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
        {previewError ? <Alert tone="hot">{previewError}</Alert> : null}
        {preview ? <MatchPreviewView preview={preview} /> : null}
      </Panel>
    </div>
  )
}
