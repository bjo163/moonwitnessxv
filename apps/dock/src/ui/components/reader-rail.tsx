import type { ReactNode } from 'react'
import type { Locale } from '@moonwitness/core'
import { Badge, Panel } from '@moonwitness/moonui'
import type { BrowseEdition, BrowseResult, ReaderResult } from '@/data/queries/reader'
import { getReaderCopy, type ReaderCopy } from '@/lib/reader-copy'
import { getProvenanceCopy, rightsLabel } from '@/lib/provenance-copy'
import { dockHrefFor } from '@/lib/locale-context.mjs'

/**
 * UI-P05b: the two rails reference screen 05 asks for — the WORKS / CONTENTS rail
 * and the reading record — fed only by `/corpus/browse` plus the reader result the
 * route already holds. The projection carries no source text, which is exactly why
 * these rails can keep stating what exists while a passage stays withheld.
 *
 * In DOM order the passage comes first and the contents rail after it, so a narrow
 * screen reads the passage before the browse list; the desktop grid places the rail
 * in the left column.
 */

/** The locale-bound href builder from `dockHrefFor`; a component never names a locale itself. */
type LocaleHref = ReturnType<typeof dockHrefFor>

function addressHref(
  href: LocaleHref,
  citationKey: string,
  editionCode: string | null,
  currentEdition: string | null,
): string {
  const params = new URLSearchParams({ citation: citationKey })
  const edition = editionCode ?? currentEdition
  if (edition) params.set('edition', edition)
  return href('/reader', `?${params.toString()}`)
}

/** A group is either its rows or, when the hub lists nothing, the sentence that says so. */
function RailGroup({
  headingId,
  title,
  body,
  emptyText,
}: {
  headingId: string
  title: string
  body: ReactNode | null
  emptyText: string
}): ReactNode {
  return (
    <section className="dk-reader-rail-group" aria-labelledby={headingId}>
      <h3 id={headingId} className="dk-reader-rail-heading">
        {title}
      </h3>
      {body ?? <p className="dk-reader-rail-empty">{emptyText}</p>}
    </section>
  )
}

function RailRows({ children }: { children: ReactNode }): ReactNode {
  return <ul className="dk-reader-rail-list">{children}</ul>
}

function EditionRow({
  edition,
  copy,
  href,
  browse,
  locale,
  selected,
}: {
  edition: BrowseEdition
  copy: ReaderCopy
  href: LocaleHref
  browse: BrowseResult
  locale: Locale
  selected: boolean
}): ReactNode {
  return (
    <li className="dk-reader-rail-item">
      <a
        className="dk-reader-rail-link"
        href={addressHref(href, browse.citation, edition.code, browse.edition)}
        aria-label={`${copy.editionOpen}: ${edition.name ?? edition.code}`}
      >
        <span className="dk-reader-rail-name">
          {edition.name ?? edition.code}{' '}
          {selected ? <Badge tone="cyan">{copy.editionSelected}</Badge> : null}
        </span>
        <span className="dk-reader-rail-meta">
          {edition.code} · {rightsLabel(edition.rightsStatus, locale)} · {edition.passageCount}{' '}
          {copy.unitPassages}
        </span>
      </a>
    </li>
  )
}

export function ReaderContentsRail({
  browse,
  locale,
  selectedEditionCode,
  hasCitationTarget,
}: {
  browse: BrowseResult
  locale: Locale
  selectedEditionCode: string | null
  /** False when the passage column rendered no citation line, so the export row must not anchor to it. */
  hasCitationTarget: boolean
}): ReactNode {
  const copy = getReaderCopy(locale)
  const provenance = getProvenanceCopy(locale)
  const href = dockHrefFor(locale)

  return (
    <nav className="dk-reader-rail" aria-labelledby="dk-reader-rail-title">
      <h2 id="dk-reader-rail-title" className="dk-reader-rail-title">
        {copy.railTitle}
      </h2>

      <RailGroup
        headingId="dk-reader-rail-works"
        title={copy.railSourceCatalog}
        emptyText={copy.railEmptyWorks}
        body={
          browse.works.length === 0
            ? null
            : (
              <RailRows>
                {browse.works.map((work) => (
                  <li className="dk-reader-rail-item" key={work.code}>
                    <span className="dk-reader-rail-name">{work.title ?? work.code}</span>
                    <span className="dk-reader-rail-meta">
                      {work.code} · {work.originalLanguage ?? provenance.unrecorded} · {work.editionCount}{' '}
                      {copy.unitEditions}
                    </span>
                  </li>
                ))}
              </RailRows>
            )
        }
      />

      <RailGroup
        headingId="dk-reader-rail-editions"
        title={copy.railEditions}
        emptyText={copy.railEmptyEditions}
        body={
          browse.editions.length === 0
            ? null
            : (
              <RailRows>
                {browse.editions.map((edition) => (
                  <EditionRow
                    key={edition.code}
                    edition={edition}
                    copy={copy}
                    href={href}
                    browse={browse}
                    locale={locale}
                    selected={edition.code === selectedEditionCode}
                  />
                ))}
              </RailRows>
            )
        }
      />

      <RailGroup
        headingId="dk-reader-rail-passages"
        title={copy.railPassageIndex}
        emptyText={copy.railEmptyPassages}
        body={
          browse.passages.length === 0
            ? null
            : (
              <RailRows>
                {browse.passages.map((passage) => (
                  <li className="dk-reader-rail-item" key={`${passage.editionCode ?? 'none'}-${passage.citationKey}`}>
                    <a
                      className="dk-reader-rail-link"
                      href={addressHref(href, passage.citationKey, passage.editionCode, browse.edition)}
                      aria-label={`${copy.addressOpen}: ${passage.citationKey}`}
                      aria-current={passage.citationKey === browse.citation ? 'true' : undefined}
                    >
                      <span className="dk-reader-rail-name">{passage.citationKey}</span>
                      <span className="dk-reader-rail-meta">
                        {passage.editionCode ?? provenance.unrecorded} ·{' '}
                        {passage.textAvailable ? copy.textCleared : copy.textWithheld}
                      </span>
                    </a>
                  </li>
                ))}
              </RailRows>
            )
        }
      />

      <RailGroup
        headingId="dk-reader-rail-translations"
        title={copy.railTranslations}
        emptyText={copy.railEmptyTranslations}
        body={
          browse.translations.length === 0
            ? null
            : (
              <RailRows>
                {browse.translations.map((row) => (
                  <li
                    className="dk-reader-rail-item"
                    key={`${row.editionCode ?? 'none'}-${row.languageCode}-${row.translatorName ?? 'unknown'}`}
                  >
                    <span className="dk-reader-rail-name">
                      {row.languageCode.toUpperCase()} · {row.translatorName ?? provenance.unrecorded}
                    </span>
                    <span className="dk-reader-rail-meta">
                      {row.licenseName ?? copy.unknownLicense} · {rightsLabel(row.rightsStatus, locale)} ·{' '}
                      {row.textAvailable ? copy.textCleared : copy.textWithheld}
                    </span>
                  </li>
                ))}
              </RailRows>
            )
        }
      />

      <RailGroup
        headingId="dk-reader-rail-export"
        title={copy.railCitationExport}
        emptyText={copy.exportAnchorHint}
        body={
          <div className="dk-reader-rail-export">
            {hasCitationTarget ? (
              <a className="dk-reader-rail-link" href={href('/reader', '', '#reader-citation')}>
                {copy.exportGoTo}
              </a>
            ) : (
              <span>{copy.exportNoTarget}</span>
            )}
            <span className="dk-reader-rail-meta">
              {browse.export.textExportAllowed ? copy.exportAllowed : copy.exportGuarded} · {browse.export.reason}
            </span>
          </div>
        }
      />
    </nav>
  )
}

/**
 * The five governed statuses the reference names: EDITION, RIGHTS, LANGUAGE,
 * INTERPRETATION, EXPORT. Each row comes from the hub, and the hub's own reason
 * string stays visible verbatim — an explanation the projection gives is evidence,
 * not something Dock translates into a claim. When the contents query failed the
 * two rows it fed are stated as not known rather than dropped or guessed.
 */
export function ReaderRecordRail({
  result,
  browse,
  locale,
}: {
  result: ReaderResult | null
  browse: BrowseResult | null
  locale: Locale
}): ReactNode {
  const copy = getReaderCopy(locale)
  const source = result?.citation ?? null
  const editionCode = source?.editionCode ?? browse?.edition ?? null
  const rightsStatus = source?.rightsStatus ?? 'RIGHTS_UNKNOWN'
  const language = source?.originalLanguage ?? browse?.work?.originalLanguage ?? null

  return (
    <Panel title={copy.recordTitle} subtitle={copy.recordSubtitle}>
      <dl className="dk-reader-record">
        <div className="dk-reader-record-row">
          <dt>{copy.rowEdition}</dt>
          <dd>
            {editionCode
              ? `${source?.editionName ?? copy.unresolvedEdition} [${editionCode}]`
              : copy.editionUnselected}
          </dd>
        </div>
        <div className="dk-reader-record-row">
          <dt>{copy.rowRights}</dt>
          <dd>{rightsLabel(rightsStatus, locale)}</dd>
        </div>
        <div className="dk-reader-record-row">
          <dt>{copy.rowLanguage}</dt>
          <dd>{language ? `${language} · ${copy.languageSource}` : copy.unknownLanguage}</dd>
        </div>
        <div className="dk-reader-record-row">
          <dt>{copy.rowInterpretation}</dt>
          <dd>
            {browse === null
              ? copy.browseUnavailable
              : browse.interpretation.available
                ? copy.interpretationRegistered
                : copy.interpretationNone}
            {browse ? <span className="dk-reader-record-reason">{browse.interpretation.reason}</span> : null}
          </dd>
        </div>
        <div className="dk-reader-record-row">
          <dt>{copy.rowExport}</dt>
          <dd>
            {browse === null
              ? copy.browseUnavailable
              : browse.export.textExportAllowed
                ? copy.exportAllowed
                : copy.exportGuarded}
            {browse ? <span className="dk-reader-record-reason">{browse.export.reason}</span> : null}
          </dd>
        </div>
      </dl>
    </Panel>
  )
}
