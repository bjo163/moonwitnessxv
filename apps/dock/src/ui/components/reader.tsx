import type { ReactNode } from 'react'
import { Alert, Badge, EmptyState, Panel, type BadgeTone } from '@moonwitness/moonui'
import { CitationCopy } from '../client/CitationCopy'
import type { ReaderCandidate, ReaderResult, ReaderSource } from '@/data/queries/reader'

const BLOCKED = '[TEXT_BLOCKED_PENDING_RIGHTS_CLEARANCE]'

const RIGHTS_LABEL: Record<string, string> = {
  RIGHTS_EXACT_VERSION_CLEARED: 'Rights cleared for this exact version',
  RIGHTS_UNKNOWN: 'Rights unknown',
  METADATA_ONLY: 'Metadata only',
  RESTRICTED: 'Restricted',
  PUBLIC_DOMAIN: 'Public domain, exact version not verified',
}

const rightsLabel = (status: string): string => RIGHTS_LABEL[status] ?? status

const sourceHref = (candidate: ReaderCandidate): string => {
  const params = new URLSearchParams({ citation: candidate.citationKey ?? '' })
  if (candidate.editionCode) params.set('edition', candidate.editionCode)
  return `/reader?${params.toString()}`
}

function SourceIdentity({ citation }: { citation: ReaderSource }): ReactNode {
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
      <dd>{rightsLabel(citation.rightsStatus)}</dd>

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

export function ReaderView({
  result,
  citation,
}: {
  result: ReaderResult
  citation: string
}): ReactNode {
  if (result.state === 'invalid' || result.state === 'absent') {
    return (
      <Panel title="No matching source" subtitle={result.message}>
        <EmptyState
          title={result.state === 'invalid' ? 'That citation cannot be read' : 'No passage is indexed for this citation'}
          hint="The Reader only shows an indexed, rights-checked source. It never fills a gap with an invented verse."
        />
      </Panel>
    )
  }

  if (result.state === 'ambiguous') {
    return (
      <Panel
        title="Choose an edition"
        subtitle={result.message ?? 'Several editions carry this address; the Reader will not choose one silently.'}
      >
        <ul className="dk-reader-candidates">
          {result.candidates.map((candidate) => (
            <li key={`${candidate.editionCode ?? 'no-code'}-${candidate.citationKey ?? citation}`}>
              <a className="dk-reader-candidate" href={sourceHref(candidate)}>
                <span className="dk-reader-candidate-name">
                  {candidate.workTitle ?? 'UNKNOWN WORK'} — {candidate.editionName ?? 'UNRESOLVED EDITION'}
                </span>
                <span className="dk-reader-candidate-meta m-muted">
                  {candidate.editionCode ?? 'no-code'} · {rightsLabel(candidate.rightsStatus)} ·{' '}
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
          <Badge tone={tone}>{cleared ? 'RIGHTS CLEARED' : rightsLabel(source?.rightsStatus ?? 'RIGHTS_UNKNOWN')}</Badge>
        </header>

        {result.state === 'rights_blocked' ? (
          <Alert tone="hot">{result.message ?? 'Text withheld: source rights are not cleared.'}</Alert>
        ) : null}

        <section className="dk-reader-block" aria-labelledby="reader-source-heading">
          <h3 id="reader-source-heading">Source identity</h3>
          {source ? <SourceIdentity citation={source} /> : null}
        </section>

        <section className="dk-reader-block" aria-labelledby="reader-arabic-heading">
          <h3 id="reader-arabic-heading">Arabic source text</h3>
          {result.arabic ? (
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
              <span className="m-muted">{result.message ?? 'Text withheld: source rights are not cleared.'}</span>
            </div>
          )}
        </section>

        <section className="dk-reader-block" aria-labelledby="reader-translations-heading">
          <h3 id="reader-translations-heading">Licensed parallel translations</h3>
          {result.translations.length === 0 ? (
            <p className="dk-reader-note">No licensed translation is indexed for this passage.</p>
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
                      {row.blocked ? `withheld (translation rights: ${rightsLabel(row.rightsStatus)})` : rightsLabel(row.rightsStatus)}
                    </span>
                  </div>
                  {row.text ? (
                    <p lang={row.languageCode} dir={row.languageCode === 'ar' ? 'rtl' : 'ltr'}>
                      {row.text}
                    </p>
                  ) : (
                    <p className="dk-reader-blocked-inline">
                      {BLOCKED} Translation withheld — rights are not cleared.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>

      <Panel
        title="Reproducible citation"
        subtitle="Exact edition, provenance version, source date and retrieval timestamp."
      >
        {result.citationText ? (
          <>
            <pre className="dk-reader-citation" aria-label="Reproducible citation text" tabIndex={0}>
              {result.citationText}
            </pre>
            <CitationCopy text={result.citationText} citationKey={source?.key ?? citation} />
          </>
        ) : (
          <p className="dk-reader-note">No citation can be produced for this state.</p>
        )}
        <p className="dk-reader-note dk-reader-version">
          Edition selector: use the optional edition field to pin a version when an address exists in more than one
          edition.
        </p>
      </Panel>
    </div>
  )
}
