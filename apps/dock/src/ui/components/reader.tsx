import type { ReactNode } from 'react'
import type { Locale } from '@moonwitness/core'
import { Alert, Badge, Panel, type BadgeTone } from '@moonwitness/moonui'
import { CitationCopy } from '../client/CitationCopy'
import type { ReaderCandidate, ReaderResult, ReaderSource } from '@/data/queries/reader'
import { PanelState } from './states'
import type { StatesCopy } from '@/lib/states-copy'
import { rightsLabel } from '@/lib/provenance-copy'
import { dockHrefFor } from '@/lib/locale-context.mjs'

const BLOCKED = '[TEXT_BLOCKED_PENDING_RIGHTS_CLEARANCE]'

/** The locale-bound href builder from `dockHrefFor`; a component never names a locale itself. */
type LocaleHref = ReturnType<typeof dockHrefFor>

const sourceHref = (candidate: ReaderCandidate, localeHref: LocaleHref): string => {
  const params = new URLSearchParams({ citation: candidate.citationKey ?? '' })
  if (candidate.editionCode) params.set('edition', candidate.editionCode)
  return localeHref('/reader', `?${params.toString()}`)
}

function SourceIdentity({ citation, locale }: { citation: ReaderSource; locale: Locale }): ReactNode {
  return (
    <dl className="dk-reader-source">
      <dt>Work</dt>
      <dd>
        {citation.workTitle ?? 'UNKNOWN WORK'}
        {citation.workCode ? <span className="m-muted"> ({citation.workCode})</span> : null}
      </dd>

      <dt>Edition</dt>
      <dd>
        {citation.editionName ?? 'UNRESOLVED EDITION'}
        {citation.editionCode ? <span className="m-muted"> [{citation.editionCode}]</span> : null}
      </dd>

      <dt>Publisher</dt>
      <dd>{citation.editorOrPublisher ?? 'UNRECORDED'}</dd>

      <dt>Original language</dt>
      <dd>{citation.originalLanguage ?? 'UNKNOWN'}</dd>

      <dt>Permission</dt>
      <dd>{rightsLabel(citation.rightsStatus, locale)}</dd>

      <dt>License</dt>
      <dd>{citation.licenseName ?? 'UNKNOWN'}</dd>

      <dt>Source</dt>
      <dd>
        {citation.sourceUri ? (
          <a href={citation.sourceUri} rel="noreferrer noopener" target="_blank">
            {citation.sourceUri}
          </a>
        ) : (
          'UNRECORDED'
        )}
      </dd>

      <dt>Provenance version</dt>
      <dd>
        <code>{citation.provenanceSha ?? 'UNRECORDED'}</code>
      </dd>

      <dt>Source date</dt>
      <dd>{citation.sourceDate ?? 'UNKNOWN'}</dd>

      <dt>Retrieved</dt>
      <dd>{citation.retrievedAt}</dd>
    </dl>
  )
}

/**
 * The passage panel body. Absent and invalid readings are the panel's empty
 * state; ambiguous and rights-blocked readings carry content, so they stay
 * ready. Every sentence here comes from the states catalogue: the Reader has no
 * private wording for a failed read.
 */
export function ReaderView({
  result,
  citation,
  copy,
  locale = 'en',
}: {
  result: ReaderResult
  citation: string
  copy: StatesCopy
  locale?: Locale
}): ReactNode {
  const localeHref = dockHrefFor(locale)
  if (result.state === 'invalid' || result.state === 'absent') {
    return (
      <Panel title={copy.emptyReaderPanel} subtitle={result.message}>
        <PanelState
          state="empty"
          loadingLabel={copy.loadingContent}
          emptyTitle={
            result.state === 'invalid' ? copy.emptyReaderInvalidTitle : copy.emptyReaderAbsentTitle
          }
          emptyHint={copy.emptyReaderHint}
          errorMessage={copy.errorReaderUnavailable}
        >
          {null}
        </PanelState>
      </Panel>
    )
  }

  if (result.state === 'ambiguous') {
    return (
      <Panel
        title={copy.emptyReaderAmbiguousTitle}
        subtitle={result.message ?? copy.emptyReaderAmbiguousSubtitle}
      >
        <ul className="dk-reader-candidates">
          {result.candidates.map((candidate) => (
            <li key={`${candidate.editionCode ?? 'no-code'}-${candidate.citationKey ?? citation}`}>
              <a className="dk-reader-candidate" href={sourceHref(candidate, localeHref)}>
                <span className="dk-reader-candidate-name">
                  {candidate.workTitle ?? 'UNKNOWN WORK'} — {candidate.editionName ?? 'UNRESOLVED EDITION'}
                </span>
                <span className="dk-reader-candidate-meta m-muted">
                  {candidate.editionCode ?? 'no-code'} · {rightsLabel(candidate.rightsStatus, locale)} ·{' '}
                  {candidate.licenseName ?? 'UNKNOWN LICENSE'}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Panel>
    )
  }

  const source = result.citation
  const cleared = source?.rightsStatus === 'RIGHTS_EXACT_VERSION_CLEARED'
  const tone: BadgeTone = cleared ? 'ok' : 'hot'
  // ADR-0003/ADR-0009: a rights-blocked result must never render passage text,
  // even if an upstream projection accidentally returns it.
  const withheld = result.state === 'rights_blocked'
  const provenanceShort = source?.provenanceSha ? source.provenanceSha.slice(0, 12) : 'UNRECORDED'

  return (
    <div className="dk-reader-grid">
      <article className="dk-reader-passage" aria-labelledby="reader-passage-title">
        <header className="dk-reader-head">
          <div>
            <h2 className="dk-reader-title" id="reader-passage-title">
              {source?.key ?? citation}
            </h2>
            <p className="dk-reader-note">{source?.editionName ?? 'UNRESOLVED EDITION'}</p>
          </div>
          <Badge tone={tone}>
            {cleared ? 'RIGHTS CLEARED' : rightsLabel(source?.rightsStatus ?? 'RIGHTS_UNKNOWN', locale)}
          </Badge>
        </header>

        {result.state === 'rights_blocked' ? (
          <Alert tone="hot">{result.message ?? copy.errorRightsBlocked}</Alert>
        ) : null}

        <section className="dk-reader-block" aria-labelledby="reader-source-heading">
          <h3 id="reader-source-heading" className="dk-reader-block-title">
            Source identity
          </h3>
          <p className="dk-reader-provenance-strip">
            Edition <strong>{source?.editionCode ?? 'UNRESOLVED'}</strong> ·{' '}
            {rightsLabel(source?.rightsStatus ?? 'RIGHTS_UNKNOWN', locale)} · SHA <code>{provenanceShort}</code>
          </p>
          <details className="dk-provenance">
            <summary>Full provenance, licence and retrieval record</summary>
            {source ? <SourceIdentity citation={source} locale={locale} /> : null}
          </details>
        </section>

        <section className="dk-reader-block" aria-labelledby="reader-arabic-heading">
          <h3 id="reader-arabic-heading">Arabic source text</h3>
          {!withheld && result.arabic ? (
            <>
              <p className="dk-reader-arabic" lang={result.arabic.language} dir={result.arabic.direction}>
                {result.arabic.text}
              </p>
              <p className="dk-reader-note">
                {result.arabic.script} script · {result.arabic.direction.toUpperCase()} · exact edition bytes
              </p>
            </>
          ) : (
            <div className="dk-reader-blocked" role="note" aria-label="Arabic text withheld pending rights clearance">
              <code>{result.blockedPlaceholder ?? BLOCKED}</code>
              <span className="m-muted">{result.message ?? copy.errorRightsBlocked}</span>
            </div>
          )}
        </section>

        <section className="dk-reader-block" aria-labelledby="reader-translations-heading">
          <h3 id="reader-translations-heading">Licensed parallel translations</h3>
          {result.translations.length === 0 ? (
            <p className="dk-reader-note">{copy.emptyReaderTranslations}</p>
          ) : (
            <ul className="dk-reader-translations">
              {result.translations.map((row, index) => (
                <li
                  className="dk-reader-translation"
                  data-blocked={row.blocked ? 'true' : 'false'}
                  key={`${row.languageCode}-${row.translatorName ?? 'unknown'}-${index}`}
                >
                  <div className="dk-reader-translation-head">
                    <Badge tone={row.blocked ? 'hot' : 'ok'}>{row.languageCode.toUpperCase()}</Badge>
                    <strong>{row.translatorName ?? 'Unknown translator'}</strong>
                    <span className="m-muted">
                      {row.licenseName ?? 'UNKNOWN LICENSE'} ·{' '}
                      {row.blocked
                        ? `withheld (translation rights: ${rightsLabel(row.rightsStatus, locale)})`
                        : rightsLabel(row.rightsStatus, locale)}
                    </span>
                  </div>
                  {row.text && !withheld ? (
                    <p lang={row.languageCode} dir={row.languageCode === 'ar' ? 'rtl' : 'ltr'}>
                      {row.text}
                    </p>
                  ) : (
                    <p className="dk-reader-blocked-inline">
                      {BLOCKED} {copy.errorTranslationBlocked}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>

      <div id="reader-citation" className="dk-reader-export-anchor">
        <Panel
          title="Reproducible citation"
          subtitle="Exact edition, provenance version, source date and retrieval timestamp."
        >
          {result.citationText ? (
            <>
              <pre className="dk-reader-citation" aria-label="Reproducible citation text" tabIndex={0}>
                {result.citationText}
              </pre>
              <CitationCopy text={result.citationText} citationKey={source?.key ?? citation} locale={locale} />
            </>
          ) : (
            <p className="dk-reader-note">{copy.emptyReaderCitation}</p>
          )}
          <p className="dk-reader-note dk-reader-version">
            Edition selector: use the optional edition field to pin a version when an address exists in more than one
            edition.
          </p>
        </Panel>
      </div>
    </div>
  )
}
