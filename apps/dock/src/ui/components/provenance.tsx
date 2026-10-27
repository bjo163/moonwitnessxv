import type { ReactNode } from 'react'
import type { Locale } from '@moonwitness/core'
import { getProvenanceCopy, reviewLabel } from '@/lib/provenance-copy'

/**
 * UI-F15: the single source-evidence block every public Dock view renders for a
 * source record. Provenance is evidence, so a row is never dropped because its
 * value is missing: the label stays and the value becomes the explicit
 * unrecorded word in the rendered locale.
 *
 * The props are data-only on purpose. These blocks render inside React Server
 * Components, and a server host cannot pass a function to a client element.
 * `classPrefix` carries each view's existing CSS naming (`dk-actors`, `dk-graph`,
 * `dk-terms`) instead of this component inventing classes of its own.
 */
export interface SourceEvidenceRecord {
  code?: string | null
  title?: string | null
  sourceType?: string | null
  citation?: string | null
  sourceUri?: string | null
  provenanceSha?: string | null
  reviewStatus?: string | null
  approvalNote?: string | null
}

export type SourceEvidenceInput = SourceEvidenceRecord | null | undefined

export interface SourceEvidenceProps {
  source: SourceEvidenceInput
  locale: Locale
  classPrefix: string
}

export function SourceEvidence({ source, locale, classPrefix }: SourceEvidenceProps): ReactNode {
  const copy = getProvenanceCopy(locale)
  const meta = `${classPrefix}-meta`
  if (!source) return <div className={meta}>{copy.noSource}</div>

  const shown = (value: string | null | undefined): string => value ?? copy.unrecorded

  return (
    <div className={`${classPrefix}-source`}>
      <span className={meta}>
        {copy.fieldSource}: {shown(source.code)} · {shown(source.title)} · {shown(source.sourceType)}
      </span>
      <span className={`${classPrefix}-citation`}>
        {copy.fieldCitation}: {shown(source.citation)}
      </span>
      <span className={meta}>
        {copy.fieldProvenanceSha}:{' '}
        <code className={`${classPrefix}-hash`} aria-label={copy.provenanceShaAria}>
          {shown(source.provenanceSha)}
        </code>
      </span>
      <span className={meta}>
        {copy.fieldSourceUri}:{' '}
        {source.sourceUri ? (
          <a className={`${classPrefix}-source-link`} href={source.sourceUri} rel="noreferrer noopener" target="_blank">
            {source.sourceUri}
          </a>
        ) : (
          copy.unrecorded
        )}
      </span>
      <span className={meta}>
        {copy.fieldReview}: {reviewLabel(source.reviewStatus, locale)}
      </span>
      <span className={meta}>
        {copy.fieldApprovalNote}: {shown(source.approvalNote)}
      </span>
    </div>
  )
}
