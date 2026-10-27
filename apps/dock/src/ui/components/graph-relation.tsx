import type { ReactNode } from 'react'
import type { Locale } from '@moonwitness/core'
import { Badge, Panel, type BadgeTone } from '@moonwitness/moonui'
import type {
  GraphCandidateSummary,
  GraphOverview,
  GraphRelation,
  RelationDetail,
  RelationEntity,
  SamePairAlternative,
  SamePairRelations,
} from '@/data/queries/graph'
import { SourceEvidence } from './provenance'
import { getProvenanceCopy, type ProvenanceCopy } from '@/lib/provenance-copy'
import { dockHrefFor } from '@/lib/locale-context.mjs'

const STATE_TONE: Record<string, BadgeTone> = {
  PENDING: 'accent',
  APPROVED: 'ok',
  REJECTED: 'night',
  REVOKED: 'hot',
  VERIFIED: 'ok',
  ASSERTED: 'accent',
  DISPUTED: 'hot',
  UNKNOWN: 'night',
}

const toneFor = (status: string): BadgeTone => STATE_TONE[status] ?? 'night'

const kindLabel = (relation: GraphRelation, copy: ProvenanceCopy): string =>
  relation.kind === 'CANDIDATE' ? copy.kindCandidateKicker : copy.kindRelationKicker

function EntityFacts({
  role,
  stableId,
  entity,
  copy,
}: {
  role: string
  stableId: string
  entity: RelationEntity | null
  copy: ProvenanceCopy
}): ReactNode {
  return (
    <div className="dk-graph-detail-entity">
      <span className="dk-graph-meta">{role}</span>
      {entity ? (
        <>
          <strong className="dk-graph-detail-entity-label">{entity.labelEn}</strong>
          <span className="dk-graph-meta">
            {entity.labelId} · <code>{entity.stableId}</code>
          </span>
          <div className="m-row" style={{ gap: 6, flexWrap: 'wrap' }}>
            <Badge tone="cyan">{entity.kind}</Badge>
            <Badge tone="night">{entity.perspective}</Badge>
            <Badge tone="moon">{entity.identityStatus}</Badge>
          </div>
        </>
      ) : (
        <span className="dk-graph-meta">
          {copy.entityLabel} <code>{stableId}</code> {copy.entityNotProjected}
        </span>
      )}
    </div>
  )
}

function releaseLine(detail: RelationDetail, copy: ProvenanceCopy): string {
  const { relation, release } = detail
  if (relation.inActiveRelease) {
    return release
      ? `${copy.releaseActivePrefix} ${release.releaseCode}.`
      : copy.releaseActiveNoCode
  }
  return relation.kind === 'CANDIDATE' ? copy.releaseNotActiveCandidate : copy.releaseNotActiveRelation
}

export function RelationDetailView({ detail, locale = 'en' }: { detail: RelationDetail; locale?: Locale }): ReactNode {
  const { relation, release, policy } = detail
  const copy = getProvenanceCopy(locale)
  const isCandidate = relation.kind === 'CANDIDATE'
  /**
   * UI-P06d · what this projection does not know, derived only from fields the
   * hub actually sent. An empty list is rendered as an explicit statement about
   * the data, never as a claim that the relation holds.
   */
  const uncertainty: Array<{ text: string; code: string | null }> = []
  if (relation.unknown) {
    uncertainty.push({ text: copy.uncertaintyUnresolved, code: relation.epistemicStatus })
  }
  if (relation.reviewer === null) uncertainty.push({ text: copy.uncertaintyNoReviewer, code: null })
  if (!relation.evidence.exactSha) uncertainty.push({ text: copy.uncertaintyNoExactSha, code: null })
  if (!relation.inActiveRelease) uncertainty.push({ text: copy.uncertaintyNotReleased, code: null })
  if (relation.source === null) uncertainty.push({ text: copy.uncertaintyNoSource, code: null })
  if (relation.fromEntity === null || relation.toEntity === null) {
    uncertainty.push({ text: copy.uncertaintyEntityUnresolved, code: null })
  }
  if (uncertainty.length === 0) uncertainty.push({ text: copy.uncertaintyNothingFlagged, code: null })
  return (
    <article
      className="dk-graph-detail"
      data-relation-kind={relation.kind}
      data-status={relation.status ?? relation.epistemicStatus}
      data-verified={relation.verified ? 'true' : 'false'}
      data-in-release={relation.inActiveRelease ? 'true' : 'false'}
      data-unknown={relation.unknown ? 'true' : 'false'}
      aria-labelledby="graph-relation-heading"
    >
      <header className="dk-graph-detail-head">
        <div>
          <p className="dk-graph-detail-kicker">{kindLabel(relation, copy)}</p>
          <h2 className="dk-graph-detail-title" id="graph-relation-heading">
            {relation.fromLabel} <code>{relation.from}</code> — <em>{relation.relationType}</em> →{' '}
            {relation.toLabel} <code>{relation.to}</code>
          </h2>
          <span className="dk-graph-meta">
            <code>{relation.code}</code> · {relation.perspective}
            {relation.assertedBy ? ` · asserted by ${relation.assertedBy}` : ''}
          </span>
        </div>
        <div className="m-row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge tone={isCandidate ? 'accent' : 'cyan'}>{relation.kind}</Badge>
          <Badge tone={toneFor(relation.epistemicStatus)}>{relation.epistemicStatus}</Badge>
          {isCandidate && relation.status ? (
            <Badge tone={toneFor(relation.status)}>{relation.status}</Badge>
          ) : null}
          {relation.verified ? <Badge tone="ok">{copy.badgeVerified}</Badge> : null}
          <Badge tone={relation.inActiveRelease ? 'cyan' : 'night'}>
            {relation.inActiveRelease ? copy.badgeInRelease : copy.badgeNotInRelease}
          </Badge>
        </div>
      </header>

      <p className="dk-graph-notice" role="note">
        {isCandidate ? copy.noticeCandidate : copy.noticeRelation}
      </p>

      <dl className="dk-graph-detail-facts">
        <dt>{copy.fieldRelationType}</dt>
        <dd>
          <code>{relation.relationType}</code> · {relation.perspective} · {relation.kind}
        </dd>
        <dt>{copy.fieldDirection}</dt>
        <dd>
          <code>{relation.from}</code> → <code>{relation.to}</code>{' '}
          <span className="dk-graph-meta">({copy.directionAsRecorded})</span>
        </dd>
        <dt>{copy.fieldEndpointKinds}</dt>
        <dd>
          {relation.fromEntity?.kind ?? copy.unrecorded} → {relation.toEntity?.kind ?? copy.unrecorded}
        </dd>
        <dt>{copy.fieldStatus}</dt>
        <dd>{relation.statusLabel}</dd>
        <dt>{copy.fieldEpistemic}</dt>
        <dd>
          {relation.epistemicLabel} ({relation.epistemicStatus})
        </dd>
        <dt>{copy.fieldAssertedBy}</dt>
        <dd>{relation.assertedBy ?? copy.unrecorded}</dd>
        <dt>{copy.fieldRelease}</dt>
        <dd>{releaseLine(detail, copy)}</dd>
      </dl>

      {relation.unknown ? (
        <p className="dk-graph-detail-unknown" role="note">
          <code>{relation.epistemicStatus}</code> {copy.unknownStaysUnresolvedSuffix}
        </p>
      ) : null}

      <section className="dk-graph-detail-review" data-section="uncertainty" aria-labelledby="graph-relation-uncertainty">
        <h3 id="graph-relation-uncertainty">{copy.uncertaintyHeading}</h3>
        <p className="dk-graph-notice" role="note">
          {copy.uncertaintyIntro}
        </p>
        <ul className="dk-graph-rules">
          {uncertainty.map((item) => (
            <li key={item.text}>
              {item.text}
              {item.code ? (
                <>
                  {' '}
                  <code>{item.code}</code>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <div className="dk-graph-detail-entities">
        <EntityFacts role={copy.roleFrom} stableId={relation.from} entity={relation.fromEntity} copy={copy} />
        <EntityFacts role={copy.roleTo} stableId={relation.to} entity={relation.toEntity} copy={copy} />
      </div>

      <section className="dk-graph-detail-evidence" aria-labelledby="graph-relation-evidence">
        <h3 id="graph-relation-evidence">{copy.evidenceHeading}</h3>
        {relation.evidence.span ? (
          <blockquote className="dk-graph-detail-span">{relation.evidence.span}</blockquote>
        ) : (
          <p className="dk-graph-meta">
            {isCandidate ? copy.evidenceNoSpanCandidate : copy.evidenceNoSpanRelation}
          </p>
        )}
        <dl className="dk-graph-detail-facts">
          <dt>{copy.fieldFrame}</dt>
          <dd>{relation.evidence.frame ?? copy.notRecorded}</dd>
          <dt>{copy.fieldEvidenceSha}</dt>
          <dd>
            {relation.evidence.sha ? (
              <code className="dk-graph-detail-sha">{relation.evidence.sha}</code>
            ) : (
              copy.missingValue
            )}
          </dd>
          <dt>{copy.fieldExactSha}</dt>
          <dd>{relation.evidence.exactSha ? copy.exactShaYes : copy.exactShaNo}</dd>
          <dt>{copy.fieldEvidencePresent}</dt>
          <dd>{relation.evidence.present ? copy.yesValue : copy.noValue}</dd>
          <dt>{copy.fieldEvidenceRef}</dt>
          <dd>{relation.evidence.ref ?? copy.noneValue}</dd>
        </dl>
        <SourceEvidence source={relation.source} locale={locale} classPrefix="dk-graph" />
      </section>

      <section className="dk-graph-detail-review" aria-labelledby="graph-relation-review">
        <h3 id="graph-relation-review">{copy.reviewTrailHeading}</h3>
        <dl className="dk-graph-detail-facts">
          <dt>{copy.fieldReviewer}</dt>
          <dd>{relation.reviewer ?? (isCandidate ? copy.reviewerNoneCandidate : copy.reviewerNotRecorded)}</dd>
          <dt>{copy.fieldClaimReason}</dt>
          <dd>{relation.reason ?? copy.noReason}</dd>
          <dt>{copy.fieldDecisionNote}</dt>
          <dd>{relation.decisionNote ?? copy.noDecisionNote}</dd>
          <dt>{copy.fieldDecidedAt}</dt>
          <dd>{relation.decidedAt ?? copy.notDecided}</dd>
          {isCandidate ? (
            <>
              <dt>{copy.fieldSameAsPolicy}</dt>
              <dd>{policy.sameAsApproval}</dd>
            </>
          ) : null}
        </dl>
        {isCandidate && relation.relationType === 'sameAs' ? (
          <p className="dk-graph-detail-warning" role="note">
            {copy.sameAsWarning}
          </p>
        ) : null}
      </section>

      <section className="dk-graph-detail-policy" aria-labelledby="graph-relation-policy">
        <h3 id="graph-relation-policy">{copy.policyHeading}</h3>
        <ul className="dk-graph-rules">
          <li>
            {copy.policyEvidenceExactSha}: {policy.evidenceAtExactSha ? copy.yesValue : copy.noValue}
          </li>
          <li>
            {copy.policyEvidenceSpan}: {policy.evidenceSpanRequiredForApproval ? copy.yesValue : copy.noValue}
          </li>
          <li>
            {copy.policyAutomaticApproval}: {policy.automaticApproval ? copy.policyEnabled : copy.policyNever}
          </li>
          <li>
            {copy.policyReleaseImmutable}: {policy.releaseImmutable ? copy.yesValue : copy.noValue}
          </li>
          <li>
            {copy.policyRevokedVisible}: {policy.revokedVisible ? copy.yesValue : copy.noValue}
          </li>
        </ul>
        <p className="dk-graph-meta">{policy.deduplication}</p>
      </section>

      <p className="dk-graph-meta">
        {release
          ? `${copy.activeReleasePrefix} ${release.releaseCode} · ${copy.graphShaPrefix} ${release.graphSha}`
          : copy.noActiveRelease}
      </p>
    </article>
  )
}

/**
 * UI-P06d · one competing claim of the inspected pair, shown as itself: its own
 * type, direction, status, reviewer and source evidence. Nothing here folds it
 * into the inspected relation, and a row that is not a release member keeps its
 * candidate status in words.
 */
function SamePairRow({ alternative, locale }: { alternative: SamePairAlternative; locale: Locale }): ReactNode {
  const { claim, orientation, sameTypeAsInspected } = alternative
  const copy = getProvenanceCopy(locale)
  const localeHref = dockHrefFor(locale)
  return (
    <li
      className="dk-graph-release-candidate"
      data-status={claim.status}
      data-in-release={claim.inActiveRelease ? 'true' : 'false'}
      data-orientation={orientation}
      data-same-type={sameTypeAsInspected ? 'true' : 'false'}
    >
      <div className="dk-graph-release-candidate-head">
        <a className="dk-graph-candidate-link" href={localeHref(`/constellation/relations/${claim.candidateCode}`)}>
          <code>{claim.candidateCode}</code>
        </a>
        <div className="m-row" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge tone={toneFor(claim.status)}>{claim.status}</Badge>
          <Badge tone={toneFor(claim.epistemicStatus)}>{claim.epistemicStatus}</Badge>
          <Badge tone={claim.inActiveRelease ? 'cyan' : 'night'}>
            {claim.inActiveRelease ? copy.badgeReleaseMember : copy.badgeNotInRelease}
          </Badge>
        </div>
      </div>
      <span className="dk-graph-meta">
        {claim.fromLabel} <code>{claim.from}</code> — <em>{claim.relationType}</em> → {claim.toLabel}{' '}
        <code>{claim.to}</code>
      </span>
      <span className="dk-graph-meta">{claim.statusLabel}</span>
      <dl className="dk-graph-detail-facts">
        <dt>{copy.fieldRelationType}</dt>
        <dd>
          <code>{claim.relationType}</code> · {claim.perspective}
        </dd>
        <dt>{copy.alternativesTypeLabel}</dt>
        <dd>{sameTypeAsInspected ? copy.alternativesTypeSame : copy.alternativesTypeDifferent}</dd>
        <dt>{copy.fieldDirection}</dt>
        <dd>
          <code>{claim.from}</code> → <code>{claim.to}</code>
        </dd>
        <dt>{copy.alternativesOrientationLabel}</dt>
        <dd>{orientation === 'FORWARD' ? copy.alternativesOrientationForward : copy.alternativesOrientationReverse}</dd>
        <dt>{copy.fieldReviewer}</dt>
        <dd>{claim.reviewer ?? copy.unrecorded}</dd>
      </dl>
      <SourceEvidence source={claim.source} locale={locale} classPrefix="dk-graph" />
    </li>
  )
}

/**
 * UI-P06c/P06d · the relation inspector's alternative half: what else the public
 * projection claims about exactly this pair, with the limits of that list stated
 * rather than implied. An empty list is an answer in words, never a hidden
 * section, and it is never read as agreement.
 */
export function RelationAlternativesView({
  inspected,
  samePair,
  locale,
}: {
  inspected: GraphRelation
  samePair: SamePairRelations
  locale: Locale
}): ReactNode {
  const copy = getProvenanceCopy(locale)
  const inspectedMissing = inspected.kind === 'CANDIDATE' && !samePair.inspectedIsCandidate
  return (
    <Panel title={copy.alternativesHeading} subtitle={copy.alternativesIntro}>
      <div
        className="dk-graph-release"
        data-pair-resolved={samePair.pairResolved ? 'true' : 'false'}
        data-release={samePair.releaseCode ?? 'none'}
        data-alternative-count={samePair.alternatives.length}
      >
        {samePair.pairResolved ? null : (
          <p className="dk-graph-detail-warning" role="note">
            {copy.alternativesPairUnresolved}
          </p>
        )}
        {inspectedMissing ? (
          <p className="dk-graph-detail-warning" role="note">
            {copy.uncertaintyNotInOverview}
          </p>
        ) : null}

        <dl className="dk-graph-detail-facts">
          <dt>{copy.alternativesCountLabel}</dt>
          <dd>{samePair.alternatives.length}</dd>
          <dt>{copy.alternativesQueueLabel}</dt>
          <dd>{samePair.candidateTotal}</dd>
          <dt>{copy.alternativesReleaseLabel}</dt>
          <dd>{samePair.releaseCode ? <code>{samePair.releaseCode}</code> : copy.alternativesNoRelease}</dd>
          <dt>{copy.alternativesLimitLabel}</dt>
          <dd>{copy.alternativesLimitHint}</dd>
        </dl>

        {samePair.alternatives.length === 0 ? (
          <p className="dk-graph-notice" role="note">
            {copy.alternativesEmptyTitle}
          </p>
        ) : (
          <ul className="dk-graph-release-candidates">
            {samePair.alternatives.map((alternative) => (
              <SamePairRow alternative={alternative} key={alternative.claim.candidateCode} locale={locale} />
            ))}
          </ul>
        )}

        <p className="dk-graph-notice" role="note">
          {copy.alternativesCandidateNote}
        </p>
        <p className="dk-graph-detail-warning" role="note">
          {copy.uncertaintyNoMerge}
        </p>
      </div>
    </Panel>
  )
}

function CandidateRow({ candidate, locale = 'en' }: { candidate: GraphCandidateSummary; locale?: Locale }): ReactNode {
  const localeHref = dockHrefFor(locale)
  const copy = getProvenanceCopy(locale)
  return (
    <li
      className="dk-graph-release-candidate"
      data-status={candidate.status}
      data-in-release={candidate.inActiveRelease ? 'true' : 'false'}
    >
      <div className="dk-graph-release-candidate-head">
        <a className="dk-graph-candidate-link" href={localeHref(`/constellation/relations/${candidate.candidateCode}`)}>
          <code>{candidate.candidateCode}</code>
        </a>
        <div className="m-row" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge tone={toneFor(candidate.status)}>{candidate.status}</Badge>
          <Badge tone={toneFor(candidate.epistemicStatus)}>{candidate.epistemicStatus}</Badge>
          <Badge tone={candidate.inActiveRelease ? 'cyan' : 'night'}>
            {candidate.inActiveRelease ? copy.badgeReleaseMember : copy.badgeNotInRelease}
          </Badge>
        </div>
      </div>
      <span className="dk-graph-meta">
        {candidate.fromLabel} <code>{candidate.from}</code> — <em>{candidate.relationType}</em> →{' '}
        {candidate.toLabel} <code>{candidate.to}</code>
      </span>
      <span className="dk-graph-meta">{candidate.statusLabel}</span>
      <span className="dk-graph-meta">
        frame: {candidate.evidence.frame ?? 'not recorded'} · span:{' '}
        {candidate.evidence.present ? 'present' : 'missing'} · SHA:{' '}
        {candidate.evidence.exactSha ? 'exact' : 'not exact'}
      </span>
    </li>
  )
}

export function GraphReleasePanel({
  overview,
  locale = 'en',
}: {
  overview: GraphOverview
  locale?: Locale
}): ReactNode {
  const { active, pointer, counts, separation, candidates, policy } = overview
  return (
    <Panel
      title="Reviewed release and candidate queue"
      subtitle="An immutable release is the graph; a candidate is a claim beside it, never inside it."
    >
      <div className="dk-graph-release" data-active-release={active?.releaseCode ?? 'none'}>
        <p className="dk-graph-notice" role="note">
          {policy.notice}
        </p>

        <div className="dk-graph-release-head">
          <div>
            <span className="dk-graph-meta">Active release</span>
            <div className="dk-graph-release-code">
              {active ? <code>{active.releaseCode}</code> : 'No release is active'}
            </div>
            {active ? (
              <span className="dk-graph-meta">
                {active.edgeCount} edges · {active.ontologyCount} reviewed · {active.candidateCount} approved
                candidates · {active.deduplicatedCount} deduplicated · built by {active.builtBy}
              </span>
            ) : (
              <span className="dk-graph-meta">
                Candidates cannot be presented as the graph until a release is built and activated.
              </span>
            )}
          </div>
          <div className="m-row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Badge tone="ok">IMMUTABLE RELEASE</Badge>
            <Badge tone="night">POINTER v{pointer?.version ?? 0}</Badge>
          </div>
        </div>

        {active ? (
          <dl className="dk-graph-detail-facts">
            <dt>Graph SHA-256</dt>
            <dd>
              <code className="dk-graph-detail-sha">{active.graphSha}</code>
            </dd>
            <dt>Built at</dt>
            <dd>{active.builtAt ?? 'not recorded'}</dd>
            <dt>Adjacency</dt>
            <dd>
              {counts.adjacencyRows} derived rows · {counts.adjacencyStale ? 'stale — rebuild needed' : 'in sync'}
            </dd>
          </dl>
        ) : null}

        <ul className="dk-graph-counts" aria-label="Graph release and candidate counts">
          <li>
            <strong>{counts.edgesInActiveRelease}</strong> release edges
          </li>
          <li>
            <strong>{counts.reviewedRelations}</strong> verified relations
          </li>
          <li>
            <strong>{counts.candidates}</strong> candidates
          </li>
          <li>
            <strong>{separation.candidates.pending}</strong> pending
          </li>
          <li>
            <strong>{separation.candidates.approved}</strong> approved
          </li>
          <li>
            <strong>{separation.candidates.rejected}</strong> rejected
          </li>
          <li>
            <strong>{separation.candidates.revoked}</strong> revoked
          </li>
          <li>
            <strong>{counts.releases}</strong> releases
          </li>
        </ul>

        <div>
          <span className="dk-graph-meta">{separation.reviewed.notice}</span>
          <span className="dk-graph-meta">{separation.candidates.notice}</span>
        </div>

        <section className="dk-graph-release-queue" aria-labelledby="graph-candidate-queue">
          <h3 id="graph-candidate-queue">Candidate queue</h3>
          {candidates.length === 0 ? (
            <p className="dk-graph-meta">No candidate is recorded.</p>
          ) : (
            <ul className="dk-graph-release-candidates">
              {candidates.map((candidate) => (
                <CandidateRow candidate={candidate} key={candidate.candidateCode} locale={locale} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </Panel>
  )
}
