import type { ReactNode } from 'react'
import { Badge, Panel, type BadgeTone } from '@moonwitness/moonui'
import type {
  GraphCandidateSummary,
  GraphOverview,
  GraphRelation,
  GraphSource,
  RelationDetail,
  RelationEntity,
} from '@/data/queries/graph'

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

const kindLabel = (relation: GraphRelation): string =>
  relation.kind === 'CANDIDATE' ? 'Candidate claim — not a graph edge' : 'Reviewed ontology relation'

function SourceBlock({ source }: { source: GraphSource | null }): ReactNode {
  if (!source) return <span className="dk-graph-meta">No source is attached.</span>
  return (
    <div className="dk-graph-source">
      <span className="dk-graph-meta">
        source: {source.code ?? 'unnamed'} · {source.sourceType ?? 'UNKNOWN_TYPE'} ·{' '}
        {source.reviewStatus ?? 'UNREVIEWED'}
      </span>
      {source.title ? <span className="dk-graph-meta">{source.title}</span> : null}
      {source.citation ? <span className="dk-graph-citation">{source.citation}</span> : null}
      {source.provenanceSha ? (
        <code className="dk-graph-hash" aria-label="Source provenance SHA-256">
          {source.provenanceSha}
        </code>
      ) : (
        <span className="dk-graph-meta">The source carries no provenance SHA.</span>
      )}
      {source.sourceUri ? (
        <a className="dk-graph-source-link" href={source.sourceUri} rel="noreferrer noopener" target="_blank">
          {source.sourceUri}
        </a>
      ) : null}
    </div>
  )
}

function EntityFacts({
  role,
  stableId,
  entity,
}: {
  role: string
  stableId: string
  entity: RelationEntity | null
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
          Entity <code>{stableId}</code> is not part of the ontology projection.
        </span>
      )}
    </div>
  )
}

function releaseLine(detail: RelationDetail): string {
  const { relation, release } = detail
  if (relation.inActiveRelease) {
    return release
      ? `This relation is part of the active release ${release.releaseCode}.`
      : 'This relation is marked as part of the active release.'
  }
  return relation.kind === 'CANDIDATE'
    ? 'Not in the active release. Approval alone does not put a candidate into the graph.'
    : 'Not in the active release. A reviewed relation still needs a release build and activation.'
}

export function RelationDetailView({ detail }: { detail: RelationDetail }): ReactNode {
  const { relation, release, policy } = detail
  const isCandidate = relation.kind === 'CANDIDATE'
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
          <p className="dk-graph-detail-kicker">{kindLabel(relation)}</p>
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
          {relation.verified ? <Badge tone="ok">VERIFIED BY REVIEWER</Badge> : null}
          <Badge tone={relation.inActiveRelease ? 'cyan' : 'night'}>
            {relation.inActiveRelease ? 'IN ACTIVE RELEASE' : 'NOT IN RELEASE'}
          </Badge>
        </div>
      </header>

      <p className="dk-graph-notice" role="note">
        {isCandidate
          ? 'A candidate is a claim under review. It is never presented as a graph edge; it needs a reviewer, exact evidence, a release build and an activation.'
          : 'A reviewed relation is part of the ontology record. It still enters the presented graph only through an immutable release.'}
      </p>

      <p className="dk-graph-meta">{relation.statusLabel}</p>
      <p className="dk-graph-meta">{releaseLine(detail)}</p>

      {relation.unknown ? (
        <p className="dk-graph-detail-unknown" role="note">
          {relation.epistemicStatus} stays unresolved. Absence of evidence is not a decision, and UNKNOWN may stay
          unresolved.
        </p>
      ) : null}

      <div className="dk-graph-detail-entities">
        <EntityFacts role="From" stableId={relation.from} entity={relation.fromEntity} />
        <EntityFacts role="To" stableId={relation.to} entity={relation.toEntity} />
      </div>

      <section className="dk-graph-detail-evidence" aria-labelledby="graph-relation-evidence">
        <h3 id="graph-relation-evidence">Evidence</h3>
        {relation.evidence.span ? (
          <blockquote className="dk-graph-detail-span">{relation.evidence.span}</blockquote>
        ) : (
          <p className="dk-graph-meta">
            {isCandidate
              ? 'No evidence span is recorded. A candidate without a span cannot be approved.'
              : 'A reviewed relation is evidenced by its ontology source; no separate span is stored.'}
          </p>
        )}
        <dl className="dk-graph-detail-facts">
          <dt>Frame</dt>
          <dd>{relation.evidence.frame ?? 'not recorded'}</dd>
          <dt>Evidence SHA-256</dt>
          <dd>
            {relation.evidence.sha ? (
              <code className="dk-graph-detail-sha">{relation.evidence.sha}</code>
            ) : (
              'missing'
            )}
          </dd>
          <dt>Exact SHA</dt>
          <dd>
            {relation.evidence.exactSha ? 'yes — pinned to the source provenance' : 'no — not pinned to an exact SHA'}
          </dd>
          <dt>Evidence present</dt>
          <dd>{relation.evidence.present ? 'yes' : 'no'}</dd>
          <dt>Evidence reference</dt>
          <dd>{relation.evidence.ref ?? 'none'}</dd>
        </dl>
        <SourceBlock source={relation.source} />
      </section>

      <section className="dk-graph-detail-review" aria-labelledby="graph-relation-review">
        <h3 id="graph-relation-review">Review trail</h3>
        <dl className="dk-graph-detail-facts">
          <dt>Reviewer</dt>
          <dd>{relation.reviewer ?? (isCandidate ? 'No reviewer yet' : 'Not recorded')}</dd>
          <dt>Claim reason</dt>
          <dd>{relation.reason ?? 'No reason recorded'}</dd>
          <dt>Decision note</dt>
          <dd>{relation.decisionNote ?? 'No decision note'}</dd>
          <dt>Decided at</dt>
          <dd>{relation.decidedAt ?? 'Not decided'}</dd>
          {isCandidate ? (
            <>
              <dt>sameAs policy</dt>
              <dd>{policy.sameAsApproval}</dd>
            </>
          ) : null}
        </dl>
        {isCandidate && relation.relationType === 'sameAs' ? (
          <p className="dk-graph-detail-warning" role="note">
            sameAs can never be approved as a correlation candidate; identity changes belong to the M10 identity
            review.
          </p>
        ) : null}
      </section>

      <section className="dk-graph-detail-policy" aria-labelledby="graph-relation-policy">
        <h3 id="graph-relation-policy">Release and evidence policy</h3>
        <ul className="dk-graph-rules">
          <li>Evidence at exact SHA required: {policy.evidenceAtExactSha ? 'yes' : 'no'}</li>
          <li>Evidence span required for approval: {policy.evidenceSpanRequiredForApproval ? 'yes' : 'no'}</li>
          <li>Automatic approval: {policy.automaticApproval ? 'enabled' : 'never'}</li>
          <li>Release immutable: {policy.releaseImmutable ? 'yes' : 'no'}</li>
          <li>Revoked candidates visible: {policy.revokedVisible ? 'yes' : 'no'}</li>
        </ul>
        <p className="dk-graph-meta">{policy.deduplication}</p>
      </section>

      <p className="dk-graph-meta">
        {release
          ? `Active release ${release.releaseCode} · graph SHA ${release.graphSha}`
          : 'No graph release is active.'}
      </p>
    </article>
  )
}

function CandidateRow({ candidate }: { candidate: GraphCandidateSummary }): ReactNode {
  return (
    <li
      className="dk-graph-release-candidate"
      data-status={candidate.status}
      data-in-release={candidate.inActiveRelease ? 'true' : 'false'}
    >
      <div className="dk-graph-release-candidate-head">
        <a className="dk-graph-candidate-link" href={`/constellation/relations/${candidate.candidateCode}`}>
          <code>{candidate.candidateCode}</code>
        </a>
        <div className="m-row" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge tone={toneFor(candidate.status)}>{candidate.status}</Badge>
          <Badge tone={toneFor(candidate.epistemicStatus)}>{candidate.epistemicStatus}</Badge>
          <Badge tone={candidate.inActiveRelease ? 'cyan' : 'night'}>
            {candidate.inActiveRelease ? 'RELEASE MEMBER' : 'NOT IN RELEASE'}
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

export function GraphReleasePanel({ overview }: { overview: GraphOverview }): ReactNode {
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
                <CandidateRow candidate={candidate} key={candidate.candidateCode} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </Panel>
  )
}
