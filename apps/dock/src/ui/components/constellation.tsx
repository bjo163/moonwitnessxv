import type { ReactNode } from 'react'
import type { Locale } from '@moonwitness/core'
import { Badge, EmptyState, Panel, type BadgeTone } from '@moonwitness/moonui'
import type {
  ConstellationProjection,
  GraphAlias,
  GraphEdge,
  GraphNode,
  IdentityDecision,
  ReviewRubric,
} from '@/data/queries/constellation'
import { SourceEvidence } from './provenance'
import { dockHrefFor } from '@/lib/locale-context.mjs'

const IDENTITY_TONE: Record<string, BadgeTone> = {
  CANDIDATE: 'accent',
  REVIEWED: 'cyan',
  CONTESTED: 'hot',
  MERGED: 'ok',
}

const ALIAS_TONE: Record<string, BadgeTone> = {
  CANDIDATE: 'accent',
  ATTESTED: 'ok',
  DISPUTED: 'hot',
  REJECTED: 'night',
}

const EPISTEMIC_TONE: Record<string, BadgeTone> = {
  VERIFIED: 'ok',
  ASSERTED: 'accent',
  DISPUTED: 'hot',
  UNKNOWN: 'night',
}

const DECISION_TONE: Record<string, BadgeTone> = {
  PENDING: 'accent',
  APPROVED_MERGE: 'ok',
  REJECTED: 'night',
  REVOKED: 'hot',
}

const CONFLICT_TONE: Record<string, BadgeTone> = {
  UNKNOWN: 'night',
  DISPUTED: 'hot',
  ASSERTED: 'accent',
  PENDING: 'accent',
  CONTESTED: 'hot',
  COLLISION: 'moon',
}

const toneFor = (map: Record<string, BadgeTone>, status: string): BadgeTone => map[status] ?? 'night'

function AliasChips({ aliases, locale }: { aliases: GraphAlias[]; locale: Locale }): ReactNode {
  if (aliases.length === 0) return <span className="dk-graph-meta">No alias is recorded.</span>
  return (
    <ul className="dk-graph-aliases" aria-label="Aliases">
      {aliases.map((alias) => (
        <li className="dk-graph-alias" key={alias.aliasCode}>
          <span className="dk-graph-alias-surface" lang={alias.languageCode} dir={alias.direction}>
            {alias.alias}
          </span>
          <span className="dk-graph-meta">
            {alias.scriptCode} · {alias.languageCode} · {alias.direction.toUpperCase()} · {alias.perspective}
          </span>
          <Badge tone={toneFor(ALIAS_TONE, alias.status)}>{alias.status}</Badge>
          {alias.reviewer ? <span className="dk-graph-meta">reviewer: {alias.reviewer}</span> : null}
          {alias.reason ? <span className="dk-graph-citation">{alias.reason}</span> : null}
          {alias.evidenceRef ? <span className="dk-graph-meta">evidence: {alias.evidenceRef}</span> : null}
          <SourceEvidence source={alias.source} locale={locale} classPrefix="dk-graph" />
        </li>
      ))}
    </ul>
  )
}

function NodeCard({ node, locale }: { node: GraphNode; locale: Locale }): ReactNode {
  return (
    <article className="dk-graph-node" aria-labelledby={`graph-node-${node.stableId}`}>
      <div className="dk-graph-node-head">
        <div>
          <h3 className="dk-graph-node-title" id={`graph-node-${node.stableId}`}>
            {node.labelEn}
          </h3>
          <span className="dk-graph-meta">
            {node.labelId} · <code>{node.stableId}</code> · component <code>{node.componentId}</code>
          </span>
        </div>
        <div className="m-row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge tone="cyan">{node.kind}</Badge>
          <Badge tone="night">{node.perspective}</Badge>
          <Badge tone={toneFor(IDENTITY_TONE, node.identityStatus)}>{node.identityStatus}</Badge>
          <Badge tone="moon">IDENTITY v{node.identityVersion}</Badge>
        </div>
      </div>

      <p className="dk-graph-node-description">{node.description}</p>

      <div className="dk-graph-node-facts">
        <span className="dk-graph-meta">
          valid: {node.validFrom ?? 'open'} → {node.validTo ?? 'open'}
        </span>
        {node.unilexStableId ? (
          <span className="dk-graph-meta">
            UNILEX: <code>{node.unilexStableId}</code>
          </span>
        ) : (
          <span className="dk-graph-meta">UNILEX: no term mapping</span>
        )}
      </div>

      <AliasChips aliases={node.aliases} locale={locale} />
      <SourceEvidence source={node.source} locale={locale} classPrefix="dk-graph" />
    </article>
  )
}

function EdgeRow({ edge, locale = 'en' }: { edge: GraphEdge; locale?: Locale }): ReactNode {
  const localeHref = dockHrefFor(locale)
  return (
    <li className="dk-graph-edge" data-verified={edge.verified ? 'true' : 'false'}>
      <div className="dk-graph-edge-head">
        <a
          className="dk-graph-edge-link"
          href={localeHref(`/constellation/relations/${edge.edgeCode}`)}
          aria-label={`Open relation detail for ${edge.edgeCode}`}
        >
          <span className="dk-graph-edge-route">
            <strong>{edge.fromLabel}</strong> <code>{edge.from}</code> — <em>{edge.relationType}</em> →{' '}
            <strong>{edge.toLabel}</strong> <code>{edge.to}</code>
          </span>
        </a>
        <div className="m-row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge tone="night">{edge.perspective}</Badge>
          <Badge tone={toneFor(EPISTEMIC_TONE, edge.epistemicStatus)}>{edge.epistemicStatus}</Badge>
          <span className="dk-graph-meta">{edge.statusLabel}</span>
        </div>
      </div>
      <span className="dk-graph-meta">
        edge <code>{edge.edgeCode}</code> · asserted by {edge.assertedBy}
      </span>
      {edge.reviewer ? <span className="dk-graph-meta">reviewer: {edge.reviewer}</span> : null}
      {edge.reason ? <p className="dk-graph-citation">{edge.reason}</p> : null}
      {edge.evidenceRef ? <span className="dk-graph-meta">evidence: {edge.evidenceRef}</span> : null}
      <SourceEvidence source={edge.source} locale={locale} classPrefix="dk-graph" />
    </li>
  )
}

function DecisionRow({ decision }: { decision: IdentityDecision }): ReactNode {
  const state = decision.candidate
    ? 'Candidate — not merged'
    : decision.activeMerge
      ? 'Active merge window'
      : decision.superseded
        ? 'Superseded — history kept'
        : 'Recorded decision'
  return (
    <li
      className="dk-graph-decision"
      data-candidate={decision.candidate ? 'true' : 'false'}
      data-active={decision.activeMerge ? 'true' : 'false'}
    >
      <div className="dk-graph-decision-head">
        <div>
          <span className="dk-graph-decision-pair">
            {decision.left} ↔ {decision.right}
          </span>
          <span className="dk-graph-meta">
            <code>{decision.reviewCode}</code> · pair <code>{decision.pairCode}</code> · {decision.identityKind}
          </span>
        </div>
        <div className="m-row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge tone={toneFor(DECISION_TONE, decision.decision)}>{decision.decision}</Badge>
          <span className="dk-graph-meta">{state}</span>
        </div>
      </div>
      {decision.reason ? <p>{decision.reason}</p> : null}
      {decision.reviewer ? <span className="dk-graph-meta">reviewer: {decision.reviewer}</span> : null}
      {decision.evidenceRef ? <span className="dk-graph-meta">evidence: {decision.evidenceRef}</span> : null}
      <span className="dk-graph-meta">
        effective: {decision.effectiveFrom ?? 'not set'} → {decision.effectiveTo ?? 'open'} · decided:{' '}
        {decision.decidedAt ?? 'not recorded'}
      </span>
    </li>
  )
}

function ReviewRubricPanel({ rubric }: { rubric: ReviewRubric }): ReactNode {
  return (
    <Panel title="Reviewer conflict queue and evidence rubric" subtitle="The queue is visible, the rules are fixed, and an unresolved state is legitimate.">
      <div className="dk-graph-rubric">
        <p className="dk-graph-notice" role="note">
          {rubric.notice}
        </p>
        <ul className="dk-graph-rules">
          <li>Reviewer required: {rubric.reviewerRequired ? 'yes' : 'no'}</li>
          <li>Evidence required for a decision: {rubric.evidenceRequiredForDecision ? 'yes' : 'no'}</li>
          <li>Automatic merge: {rubric.automaticMerge ? 'enabled' : 'never'}</li>
          <li>Unresolved items allowed: {rubric.unresolvedAllowed ? 'yes' : 'no'}</li>
        </ul>
        <div>
          <span className="dk-graph-meta">Accepted evidence kinds</span>
          <ul className="dk-graph-evidence">
            {rubric.evidenceKinds.map((kind) => (
              <li key={kind}>{kind}</li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  )
}

export function ConstellationView({
  projection,
  locale = 'en',
}: {
  projection: ConstellationProjection
  locale?: Locale
}): ReactNode {
  const { counts } = projection
  return (
    <div className="dk-graph">
      <Panel title="Graph identity" subtitle="Read-only projection · the hub owns the graph and its ID">
        <div className="dk-graph-identity">
          <div className="m-row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <Badge tone="ok">READ ONLY</Badge>
            <Badge tone="cyan">REGISTRY {projection.registry.version}</Badge>
            <Badge tone="night">{projection.registry.status}</Badge>
            <span className="dk-graph-meta">{projection.registry.entityCount} seeded entities</span>
          </div>
          <p className="dk-graph-notice" role="note">
            {projection.authority.notice}
          </p>
          <dl className="dk-graph-identity-meta">
            <dt>Graph ID</dt>
            <dd>
              <code className="dk-graph-id" data-graph-id={projection.graphId}>
                {projection.graphId}
              </code>
            </dd>
            <dt>Canonical tables</dt>
            <dd>{projection.authority.canonicalTables.join(', ')}</dd>
            <dt>Registry notice</dt>
            <dd>{projection.registry.notice}</dd>
          </dl>
          <ul className="dk-graph-counts" aria-label="Graph counts">
            <li>
              <strong>{counts.nodes}</strong> entities
            </li>
            <li>
              <strong>{counts.aliases}</strong> aliases
            </li>
            <li>
              <strong>{counts.edges}</strong> edges
            </li>
            <li>
              <strong>{counts.verifiedEdges}</strong> verified edges
            </li>
            <li>
              <strong>{counts.identityReviews}</strong> identity reviews
            </li>
            <li>
              <strong>{counts.activeMerges}</strong> active merges
            </li>
            <li>
              <strong>{counts.components}</strong> components
            </li>
            <li>
              <strong>{counts.unresolvedConflicts}</strong> unresolved conflicts
            </li>
          </ul>
        </div>
      </Panel>

      <section className="dk-graph-section" aria-labelledby="graph-entities-heading">
        <h2 id="graph-entities-heading">Entities, actors and characters</h2>
        <p className="dk-graph-meta">
          Kinds stay separate. An alias is a claim about a surface, never an automatic identity.
        </p>
        {projection.nodes.length === 0 ? (
          <Panel title="No entity">
            <EmptyState title="The graph is empty" hint="Seed the ontology tables before projecting a Constellation." />
          </Panel>
        ) : (
          <div className="dk-graph-nodes">
            {projection.nodes.map((node) => (
              <NodeCard node={node} key={node.stableId} locale={locale} />
            ))}
          </div>
        )}
      </section>

      <Panel title="Typed edges" subtitle="Source- and perspective-scoped. Only a reviewer decision makes an edge verified.">
        {projection.edges.length === 0 ? (
          <p className="dk-graph-meta">No relation edge is recorded.</p>
        ) : (
          <ul className="dk-graph-edges">
            {projection.edges.map((edge) => (
              <EdgeRow edge={edge} key={edge.edgeCode} locale={locale} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Identity decisions" subtitle="Merge, rejection and split are append-only. A candidate is never a merge.">
        {projection.identityDecisions.length === 0 ? (
          <p className="dk-graph-meta">No identity decision is recorded.</p>
        ) : (
          <ul className="dk-graph-decisions">
            {projection.identityDecisions.map((decision) => (
              <DecisionRow decision={decision} key={decision.reviewCode} />
            ))}
          </ul>
        )}
      </Panel>

      <ReviewRubricPanel rubric={projection.review} />

      <Panel title="Unresolved conflict queue" subtitle="Candidates, contradictions and label collisions that still need a reviewer.">
        {projection.conflicts.length === 0 ? (
          <p className="dk-graph-meta">No unresolved conflict: every edge and identity is decided.</p>
        ) : (
          <ul className="dk-graph-conflicts">
            {projection.conflicts.map((conflict) => (
              <li className="dk-graph-conflict" key={`${conflict.type}-${conflict.code}`}>
                <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <Badge tone={toneFor(CONFLICT_TONE, conflict.status)}>{conflict.status}</Badge>
                  <Badge tone="night">{conflict.type}</Badge>
                  <strong>{conflict.title}</strong>
                </div>
                <span className="dk-graph-meta">
                  <code>{conflict.code}</code>
                  {conflict.perspective ? ` · ${conflict.perspective}` : ''}
                </span>
                {conflict.detail ? <p>{conflict.detail}</p> : null}
                {conflict.evidenceRef ? (
                  <span className="dk-graph-meta">evidence: {conflict.evidenceRef}</span>
                ) : null}
                <SourceEvidence source={conflict.source} locale={locale} classPrefix="dk-graph" />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
