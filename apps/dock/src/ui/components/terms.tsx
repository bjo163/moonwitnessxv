import type { ReactNode } from 'react'
import type { Locale } from '@moonwitness/core'
import { Alert, Badge, Chevron, DataTable, EmptyState, Panel, type BadgeTone, type ColumnDef } from '@moonwitness/moonui'
import type {
  IdentityReview,
  MatchPreview,
  TermDetail,
  TermForm,
  TermSource,
  TermsPage,
} from '@/data/queries/terms'
import { dockHrefFor } from '@/lib/locale-context.mjs'
import { getProvenanceCopy, reviewLabel } from '@/lib/provenance-copy'
import { SourceEvidence } from './provenance'

const STATUS_TONE: Record<string, BadgeTone> = {
  DRAFT_REVIEW: 'accent',
  SOURCE_CHECK: 'cyan',
  LINGUISTIC_REVIEW: 'moon',
  APPROVED: 'ok',
  DEPRECATED: 'hot',
  PROPOSED: 'accent',
  SOURCE_CHECKED: 'cyan',
  APPROVED_FOR_CITATION: 'ok',
}

const RELATION_TONE: Record<string, BadgeTone> = {
  APPROVED: 'ok',
  SEED_PROPOSED: 'night',
  REVIEW_PENDING: 'accent',
  REJECTED: 'hot',
}

const MATCH_TONE: Record<string, BadgeTone> = {
  EXACT: 'moon',
  NEAR: 'accent',
  DIFFERENT: 'night',
}

const toneFor = (status: string): BadgeTone => STATUS_TONE[status] ?? 'night'
const relationTone = (status: string): BadgeTone => RELATION_TONE[status] ?? 'night'

function FormChips({ forms, compact = false }: { forms: TermForm[]; compact?: boolean }): ReactNode {
  const shown = compact ? forms.slice(0, 4) : forms
  if (shown.length === 0) return <p className="dk-terms-meta">No form has been recorded.</p>
  return (
    <ul className="dk-terms-forms" aria-label="Written forms">
      {shown.map((form) => (
        <li
          className="dk-terms-form"
          key={form.formCode ?? `${form.languageCode}-${form.scriptCode}-${form.headword}`}
        >
          <span className="dk-terms-headword" lang={form.languageCode} dir={form.direction}>
            {form.headword}
          </span>
          <span className="dk-terms-form-meta">
            {form.scriptCode} · {form.languageCode} · {form.direction.toUpperCase()}
          </span>
          {form.transliteration ? (
            <span className="dk-terms-translit" lang="en">
              transliteration: {form.transliteration}
            </span>
          ) : null}
        </li>
      ))}
      {compact && forms.length > shown.length ? (
        <li className="dk-terms-form-meta">+{forms.length - shown.length} more forms</li>
      ) : null}
    </ul>
  )
}

function SourceList({ sources, locale }: { sources: TermSource[]; locale: Locale }): ReactNode {
  const copy = getProvenanceCopy(locale)
  if (sources.length === 0) return <p className="dk-terms-meta">{copy.noSource}</p>
  return (
    <ul className="dk-terms-sources">
      {sources.map((source, index) => (
        <li className="dk-terms-source" key={`${source.code ?? 'source'}-${index}`}>
          <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Badge tone={toneFor(source.reviewStatus ?? 'PROPOSED')}>{reviewLabel(source.reviewStatus, locale)}</Badge>
            <strong>{source.title ?? source.code ?? copy.unrecorded}</strong>
          </div>
          <SourceEvidence source={source} locale={locale} classPrefix="dk-terms" />
        </li>
      ))}
    </ul>
  )
}

function IdentityReviewRow({ review }: { review: IdentityReview }): ReactNode {
  return (
    <li className="dk-terms-review">
      <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <Badge tone={MATCH_TONE[review.classification] ?? 'night'}>{review.classification}</Badge>
        <Badge tone={review.decision === 'REJECTED' ? 'hot' : 'ok'}>{review.decision}</Badge>
        <code>{review.pairCode}</code>
      </div>
      <span className="dk-terms-meta">
        {review.leftForm ?? review.leftStableId} / {review.rightForm ?? review.rightStableId}
        {review.similarity !== null ? ` · similarity ${review.similarity}%` : ''}
      </span>
      {review.reason ? <p>{review.reason}</p> : null}
      {review.reviewer ? <span className="dk-terms-meta">reviewer: {review.reviewer}</span> : null}
    </li>
  )
}

export function TermIndexTable({ page, locale = 'en' }: { page: TermsPage; locale?: Locale }): ReactNode {
  type Row = TermsPage['terms'][number]
  const localeHref = dockHrefFor(locale)
  const columns: ColumnDef<Row>[] = [
    {
      key: 'term',
      label: 'Term',
      render: (row) => (
        <a className="dk-terms-link" href={localeHref(`/terms/${row.stableId}`)}>
          {row.preferredEn}
        </a>
      ),
    },
    { key: 'stableId', label: 'Stable ID', render: (row) => <code>{row.stableId}</code> },
    { key: 'preferredId', label: 'Indonesian', render: (row) => row.preferredId },
    { key: 'lane', label: 'Lane', render: (row) => row.lane },
    { key: 'status', label: 'Status', render: (row) => row.editorialStatus },
    { key: 'senses', label: 'Senses', align: 'right', render: (row) => row.senses.length },
    { key: 'sources', label: 'Sources', align: 'right', render: (row) => row.sources.length },
    { key: 'relations', label: 'Relations', align: 'right', render: (row) => row.relations.length },
  ]

  return (
    <details className="dk-term-index">
      <summary>
        Table index · {page.terms.length} of {page.total} terms on this page
      </summary>
      <DataTable
        columns={columns}
        rows={page.terms}
        rowKey={(row) => row.stableId}
        empty={
          <EmptyState
            title="No term matches that filter"
            hint="Search matches stable IDs, labels, definitions and recorded forms."
          />
        }
      />
    </details>
  )
}

export function TermList({ page, locale = 'en' }: { page: TermsPage; locale?: Locale }): ReactNode {
  const localeHref = dockHrefFor(locale)
  if (page.terms.length === 0) {
    return (
      <Panel title="No term matches" subtitle="The projection only includes terms backed by an approved citation source.">
        <EmptyState
          title="Try a broader search"
          hint="Search matches stable IDs, labels, definitions and recorded forms. A term without an approved source stays outside this table."
        />
      </Panel>
    )
  }

  return (
    <div className="dk-terms-list">
      {page.terms.map((term) => (
        <article className="dk-terms-row" key={term.stableId} aria-labelledby={`term-title-${term.stableId}`}>
          <div className="dk-terms-row-head">
            <div>
              <a className="dk-terms-link" href={localeHref(`/terms/${term.stableId}`)} id={`term-title-${term.stableId}`}>
                {term.preferredEn}
              </a>
              <div className="dk-terms-meta">
                {term.preferredId} · <code>{term.stableId}</code> · {term.registryVersion}
              </div>
            </div>
            <div className="m-row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {term.relevanceScore ? <Badge tone="cyan">MATCH {term.relevanceScore}%</Badge> : null}
              <Badge tone="cyan">{term.lane}</Badge>
              <Badge tone={toneFor(term.editorialStatus)}>{term.editorialStatus}</Badge>
            </div>
          </div>

          <p className="dk-terms-definition">{term.definition}</p>
          <p className="dk-terms-context">{term.contextNote}</p>

          <FormChips forms={term.forms} compact />

          <div className="dk-terms-row-foot">
            <span className="dk-terms-meta">
              {term.senses.length} sense{term.senses.length === 1 ? '' : 's'} · {term.sources.length} source
              {term.sources.length === 1 ? '' : 's'} · {term.relations.length} relation
              {term.relations.length === 1 ? '' : 's'}
            </span>
            <a className="dk-terms-detail-link" href={localeHref(`/terms/${term.stableId}`)}>
              Read term <Chevron dir="right" />
            </a>
          </div>
        </article>
      ))}
    </div>
  )
}

export function MatchPreviewView({ preview }: { preview: MatchPreview }): ReactNode {
  return (
    <div className="dk-terms-match" role="status">
      <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <Badge tone={MATCH_TONE[preview.classification] ?? 'night'}>{preview.classification}</Badge>
        <Badge tone="night">{preview.suggestedAction}</Badge>
        <span className="dk-terms-meta">
          {preview.identityClaimed ? 'identity claimed' : 'no identity claimed'} · similarity{' '}
          {Math.round(preview.similarity * 100)}%
        </span>
      </div>

      <div className="dk-terms-match-sides">
        {[preview.left, preview.right].map((side, index) => (
          <div className="dk-terms-match-side" key={`${side.raw}-${index}`}>
            <span className="dk-terms-match-raw" lang={side.language ?? undefined} dir={side.direction}>
              {side.raw}
            </span>
            <span className="dk-terms-meta">
              normalized: <code>{side.normalized}</code>
            </span>
            <span className="dk-terms-meta">
              {side.script} · {side.direction.toUpperCase()}
              {side.mixedScripts ? ' · mixed scripts' : ''}
              {side.diacriticsPresent ? ' · diacritics present' : ''}
            </span>
          </div>
        ))}
      </div>

      <ul className="dk-terms-reasons">
        {preview.reasons.map((reason, index) => (
          <li key={`${reason}-${index}`}>{reason}</li>
        ))}
      </ul>
      <p className="dk-terms-notice">{preview.notice}</p>
    </div>
  )
}

export function TermDetailView({ detail, locale = 'en' }: { detail: TermDetail; locale?: Locale }): ReactNode {
  const { term } = detail
  const localeHref = dockHrefFor(locale)
  return (
    <div className="dk-terms-detail">
      {term.editorialStatus === 'DEPRECATED' ? (
        <Alert tone="hot">
          Deprecated: {term.deprecationReason ?? 'no reason recorded'}
          {term.supersededBy ? ` — successor ${term.supersededBy.stableId} (${term.supersededBy.preferredEn})` : ''}
        </Alert>
      ) : null}

      <div className="dk-terms-detail-grid">
        <article className="dk-terms-article" aria-labelledby="term-meanings-heading">
          <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Badge tone="cyan">{term.lane}</Badge>
            <Badge tone={toneFor(term.editorialStatus)}>{term.editorialStatus}</Badge>
            <span className="dk-terms-meta">
              <code>{term.stableId}</code> · registry {term.registryVersion}
            </span>
          </div>

          <p className="dk-terms-lede">{term.preferredId}</p>
          <p className="dk-terms-definition">{term.definition}</p>
          <p className="dk-terms-context">{term.contextNote}</p>

          <section className="dk-terms-section" aria-labelledby="term-forms-heading">
            <h2 id="term-forms-heading">Forms — language, script, direction</h2>
            <FormChips forms={detail.forms} />
          </section>

          <section className="dk-terms-section" aria-labelledby="term-meanings-heading">
            <h2 id="term-meanings-heading">Senses — context-scoped meanings</h2>
            {detail.senses.length === 0 ? (
              <p className="dk-terms-meta">No sense is recorded.</p>
            ) : (
              <ul className="dk-terms-senses">
                {detail.senses.map((sense) => (
                  <li className="dk-terms-sense" key={sense.key} data-current={sense.current === false ? 'false' : 'true'}>
                    <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <strong>{sense.key}</strong>
                      <Badge tone="night">{sense.scope}</Badge>
                      <Badge tone={toneFor(sense.editorialStatus)}>{sense.editorialStatus}</Badge>
                      {sense.current === false ? <Badge tone="hot">SUPERSEDED</Badge> : null}
                    </div>
                    <p>{sense.definition}</p>
                    {sense.sourceCode ? <span className="dk-terms-meta">source: {sense.sourceCode}</span> : null}
                    {sense.reviewer ? <span className="dk-terms-meta">reviewer: {sense.reviewer}</span> : null}
                    {sense.reviewerNote ? <p className="dk-terms-review-note">{sense.reviewerNote}</p> : null}
                    {sense.supersedes ? (
                      <span className="dk-terms-meta">supersedes: {sense.supersedes}</span>
                    ) : null}
                    {sense.supersededBy ? (
                      <span className="dk-terms-meta">superseded by: {sense.supersededBy}</span>
                    ) : null}
                    {sense.deprecatedAt ? (
                      <span className="dk-terms-meta">deprecated at: {sense.deprecatedAt}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="dk-terms-section" aria-labelledby="term-sources-heading">
            <h2 id="term-sources-heading">Sources and provenance</h2>
            <SourceList sources={detail.sources} locale={locale} />
          </section>
        </article>

        <aside className="dk-terms-aside">
          <Panel title="Relations" subtitle="Typed edges; a reviewer decision is named on each one.">
            {detail.relations.length === 0 ? (
              <p className="dk-terms-meta">No relation recorded.</p>
            ) : (
              <ul className="dk-terms-relations">
                {detail.relations.map((relation, index) => (
                  <li className="dk-terms-relation" key={`${relation.relationType}-${relation.targetStableId}-${index}`}>
                    <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <Badge tone={relationTone(relation.status)}>{relation.status}</Badge>
                      <strong>{relation.relationType}</strong>
                      <span className="dk-terms-meta">{relation.direction}</span>
                    </div>
                    <span>
                      {relation.targetStableId ? (
                        <a className="dk-terms-link" href={localeHref(`/terms/${relation.targetStableId}`)}>
                          {relation.targetStableId}
                          {relation.targetLabel ? ` — ${relation.targetLabel}` : ''}
                        </a>
                      ) : (
                        'unknown target'
                      )}
                    </span>
                    {relation.reason ? <p>{relation.reason}</p> : null}
                    {relation.reviewer ? <span className="dk-terms-meta">reviewer: {relation.reviewer}</span> : null}
                    {relation.evidenceRef ? (
                      <span className="dk-terms-meta">evidence: {relation.evidenceRef}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Identity reviews" subtitle="Surface evidence stays separate from an identity decision.">
            {detail.identityReviews.length === 0 ? (
              <p className="dk-terms-meta">No identity review involves this term.</p>
            ) : (
              <ul className="dk-terms-reviews">
                {detail.identityReviews.map((review) => (
                  <IdentityReviewRow key={review.pairCode} review={review} />
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Review log" subtitle="Who decided what, with the reason on record.">
            {detail.reviewLog.length === 0 ? (
              <p className="dk-terms-meta">No decision is logged for this term.</p>
            ) : (
              <ul className="dk-terms-log">
                {detail.reviewLog.map((entry, index) => (
                  <li className="dk-terms-log-entry" key={`${entry.action}-${entry.targetRef}-${index}`}>
                    <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <Badge tone="night">{entry.action}</Badge>
                      <code>{entry.targetRef}</code>
                    </div>
                    <p>{entry.reason}</p>
                    <span className="dk-terms-meta">
                      {entry.reviewer} · {entry.decidedAt}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  )
}
