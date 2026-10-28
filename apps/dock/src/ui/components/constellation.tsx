import type { ReactNode } from 'react'
import type { Locale } from '@moonwitness/core'
import { Badge, EmptyState, Panel, type BadgeTone } from '@moonwitness/moonui'
import {
  findNode,
  nodeIdentityFacts,
  nodeRelations,
  type ConstellationProjection,
  type GraphAlias,
  type GraphConflict,
  type GraphEdge,
  type GraphNode,
  type IdentityDecision,
  type NodeIdentityFacts,
  type NodeRelations,
  type ReviewRubric,
} from '@/data/queries/constellation'
import { SourceEvidence } from './provenance'
import { dockHrefFor } from '@/lib/locale-context.mjs'
import { getConstellationCopy, type ConstellationCopy } from '@/ui/copy/constellation-copy'

/**
 * UI-II P15 · the `/[locale]/constellation` projection view.
 *
 * The whole view is read-only: one GET of `/ontology/constellation`, no write
 * path, no local inference of a status the hub did not record, and — since
 * P15b — a selected-node inspector reached by an ordinary `?node=<stableId>`
 * link. A link, not a widget: it stays in tab order, works with keyboard and
 * reduced motion, needs no script, and returns to the list by fragment.
 */

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

/**
 * The node's identity status in words, keeping the raw code visible. An unknown
 * code is printed as itself: inventing a meaning for a hub enum the Dock has not
 * been told about is the failure this screen exists to avoid.
 */
function identityWords(status: string, copy: ConstellationCopy): string {
  switch (status) {
    case 'CANDIDATE':
      return copy.identityCandidate
    case 'REVIEWED':
      return copy.identityReviewed
    case 'CONTESTED':
      return copy.identityContested
    case 'MERGED':
      return copy.identityMerged
    default:
      return `${copy.identityStatusUnnamed}${status}`
  }
}

function epistemicWords(status: string, copy: ConstellationCopy): string {
  switch (status) {
    case 'VERIFIED':
      return copy.epistemicVerified
    case 'ASSERTED':
      return copy.epistemicAsserted
    case 'DISPUTED':
      return copy.epistemicDisputed
    case 'UNKNOWN':
      return copy.epistemicUnknown
    default:
      return copy.epistemicUnnamed
  }
}

function decisionStateWords(decision: IdentityDecision, copy: ConstellationCopy): string {
  if (decision.candidate) return copy.candidateNotMerged
  if (decision.activeMerge) return copy.activeMergeWindow
  if (decision.superseded) return copy.supersededKept
  return copy.recordedDecision
}

function decisionOutcomeWords(decision: IdentityDecision, copy: ConstellationCopy): string {
  switch (decision.decision) {
    case 'PENDING':
      return copy.decisionPending
    case 'APPROVED_MERGE':
      return copy.decisionApprovedMerge
    case 'REJECTED':
      return copy.decisionRejected
    case 'REVOKED':
      return copy.decisionRevoked
    default:
      return copy.decisionUnknown
  }
}

function shown(value: string | null | undefined, copy: ConstellationCopy): string {
  return value && value.length > 0 ? value : copy.unrecorded
}

function AliasChips({
  aliases,
  locale,
  copy,
}: {
  aliases: GraphAlias[]
  locale: Locale
  copy: ConstellationCopy
}): ReactNode {
  if (aliases.length === 0) return <span className="dk-graph-meta">{copy.aliasNone}</span>
  return (
    <ul className="dk-graph-aliases" aria-label={copy.headingAliases}>
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
          {alias.evidenceRef ? (
            <span className="dk-graph-meta">
              {copy.fieldEvidenceRef}: <code>{alias.evidenceRef}</code>
            </span>
          ) : (
            <span className="dk-graph-meta">{copy.noEvidenceRef}</span>
          )}
          <SourceEvidence source={alias.source} locale={locale} classPrefix="dk-graph" />
        </li>
      ))}
    </ul>
  )
}

function NodeCard({
  node,
  locale,
  copy,
  selected,
}: {
  node: GraphNode
  locale: Locale
  copy: ConstellationCopy
  selected: boolean
}): ReactNode {
  const localeHref = dockHrefFor(locale)
  return (
    <article
      className="dk-graph-node"
      aria-labelledby={`graph-node-${node.stableId}`}
      data-selected={selected ? 'true' : 'false'}
    >
      <div className="dk-graph-node-head">
        <div>
          <h3 className="dk-graph-node-title" id={`graph-node-${node.stableId}`}>
            {node.labelEn}
          </h3>
          <span className="dk-graph-meta">
            {node.labelId} · <code>{node.stableId}</code> · {copy.fieldComponent} <code>{node.componentId}</code>
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
      <p className="dk-graph-meta">{identityWords(node.identityStatus, copy)}</p>

      <div className="dk-graph-node-facts">
        <span className="dk-graph-meta">
          {copy.fieldValidity}: {shown(node.validFrom, copy)} → {shown(node.validTo, copy)}
        </span>
        {node.unilexStableId ? (
          <span className="dk-graph-meta">
            UNILEX:{' '}
            <a
              className="dk-graph-source-link"
              href={localeHref(`/terms/${node.unilexStableId}`)}
              aria-label={`Open the UNILEX entry ${node.unilexStableId}`}
            >
              <code>{node.unilexStableId}</code>
            </a>
          </span>
        ) : (
          <span className="dk-graph-meta">UNILEX: no term mapping</span>
        )}
        <a
          className="dk-graph-source-link"
          href={localeHref('/constellation', `?node=${encodeURIComponent(node.stableId)}`)}
          aria-label={`${copy.inspectLinkAria} ${node.stableId}`}
          aria-current={selected ? 'true' : undefined}
        >
          {copy.inspectLink}
        </a>
      </div>

      <AliasChips aliases={node.aliases} locale={locale} copy={copy} />
      <SourceEvidence source={node.source} locale={locale} classPrefix="dk-graph" />
    </article>
  )
}

function EdgeRow({ edge, locale, copy }: { edge: GraphEdge; locale: Locale; copy: ConstellationCopy }): ReactNode {
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
      <p className="dk-graph-meta">{epistemicWords(edge.epistemicStatus, copy)}</p>
      <span className="dk-graph-meta">
        edge <code>{edge.edgeCode}</code> · {copy.fieldAssertedBy} {shown(edge.assertedBy, copy)}
      </span>
      {edge.reviewer ? (
        <span className="dk-graph-meta">
          {copy.fieldReviewer}: {edge.reviewer}
        </span>
      ) : (
        <span className="dk-graph-meta">{copy.noReviewer}</span>
      )}
      {edge.reason ? <p className="dk-graph-citation">{edge.reason}</p> : null}
      {edge.evidenceRef ? (
        <span className="dk-graph-meta">
          {copy.fieldEvidenceRef}: <code>{edge.evidenceRef}</code>
        </span>
      ) : (
        <span className="dk-graph-meta">{copy.noEvidenceRef}</span>
      )}
      <SourceEvidence source={edge.source} locale={locale} classPrefix="dk-graph" />
    </li>
  )
}

function DecisionRow({ decision, copy }: { decision: IdentityDecision; copy: ConstellationCopy }): ReactNode {
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
            <code>{decision.reviewCode}</code> · {copy.fieldPair} <code>{decision.pairCode}</code> ·{' '}
            {decision.identityKind}
          </span>
        </div>
        <div className="m-row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge tone={toneFor(DECISION_TONE, decision.decision)}>{decision.decision}</Badge>
          <span className="dk-graph-meta">{decisionStateWords(decision, copy)}</span>
        </div>
      </div>
      <p className="dk-graph-meta">{decisionOutcomeWords(decision, copy)}</p>
      {decision.reason ? <p>{decision.reason}</p> : null}
      {decision.reviewer ? (
        <span className="dk-graph-meta">
          {copy.fieldReviewer}: {decision.reviewer}
        </span>
      ) : (
        <span className="dk-graph-meta">{copy.noReviewer}</span>
      )}
      {decision.evidenceRef ? (
        <span className="dk-graph-meta">
          {copy.fieldEvidenceRef}: <code>{decision.evidenceRef}</code>
        </span>
      ) : (
        <span className="dk-graph-meta">{copy.noEvidenceRef}</span>
      )}
      <span className="dk-graph-meta">
        {copy.fieldEffective}: {shown(decision.effectiveFrom, copy)} → {shown(decision.effectiveTo, copy)} ·{' '}
        {copy.fieldDecidedAt}: {shown(decision.decidedAt, copy)}
      </span>
    </li>
  )
}

function ReviewRubricPanel({ rubric, copy }: { rubric: ReviewRubric; copy: ConstellationCopy }): ReactNode {
  return (
    <Panel title={copy.panelRubric} subtitle={copy.panelRubricSub}>
      <div className="dk-graph-rubric">
        <p className="dk-graph-notice" role="note">
          {rubric.notice}
        </p>
        <ul className="dk-graph-rules">
          <li>
            {copy.rubricReviewerRequired}: {rubric.reviewerRequired ? copy.yes : copy.no}
          </li>
          <li>
            {copy.rubricEvidenceRequired}: {rubric.evidenceRequiredForDecision ? copy.yes : copy.no}
          </li>
          <li>
            {copy.rubricAutomaticMerge}: {rubric.automaticMerge ? copy.rubricEnabled : copy.rubricNever}
          </li>
          <li>
            {copy.rubricUnresolvedAllowed}: {rubric.unresolvedAllowed ? copy.yes : copy.no}
          </li>
        </ul>
        <div>
          <span className="dk-graph-meta">{copy.rubricEvidenceKinds}</span>
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

/**
 * UI-II P15b/P15d · the selected-node inspector.
 *
 * It reads only what `projection` already holds (`nodeRelations` and
 * `nodeIdentityFacts` walk the arrays the single `/ontology/constellation` read
 * returned), and it never turns a candidate into a verified claim: every row
 * keeps the hub's own status code in a badge and adds a sentence about what the
 * projection does and does not say. It offers no merge, no split and no alias
 * edit — the notice at its foot says so in the rendered locale.
 */
function NodeInspector({
  node,
  relations,
  identity,
  locale,
  copy,
}: {
  node: GraphNode
  relations: NodeRelations
  identity: NodeIdentityFacts
  locale: Locale
  copy: ConstellationCopy
}): ReactNode {
  const localeHref = dockHrefFor(locale)
  const conflicts: GraphConflict[] = [
    ...identity.entityConflicts,
    ...identity.relationConflicts,
    ...identity.identityConflicts,
    ...identity.aliasConflicts,
  ]
  const conflictsTotal = conflicts.length

  return (
    <div className="dk-graph-detail" role="group" aria-labelledby="graph-node-inspector-heading">
      <div className="dk-graph-detail-head">
        <div>
          <p className="dk-graph-detail-kicker">{copy.inspectorKicker}</p>
          <h3 className="dk-graph-detail-title" id="graph-node-inspector-heading">
            {node.labelEn}
          </h3>
          <span className="dk-graph-meta">{identityWords(node.identityStatus, copy)}</span>
        </div>
        <div className="m-row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge tone="ok">{copy.badgeReadOnly}</Badge>
          <Badge tone="cyan">{node.kind}</Badge>
          <Badge tone="night">{node.perspective}</Badge>
          <Badge tone={toneFor(IDENTITY_TONE, node.identityStatus)}>{node.identityStatus}</Badge>
          <Badge tone="moon">IDENTITY v{node.identityVersion}</Badge>
        </div>
      </div>

      <div className="m-row" style={{ gap: 10, flexWrap: 'wrap' }}>
        <a className="dk-graph-source-link" href={localeHref('/constellation', '', `#graph-node-${node.stableId}`)}>
          {copy.backToList}
        </a>
        <a className="dk-graph-source-link" href={localeHref('/constellation')}>
          {copy.clearSelection}
        </a>
      </div>
      <p className="dk-graph-meta">{copy.backToListHint}</p>

      <dl className="dk-graph-detail-facts">
        <dt>{copy.fieldStableId}</dt>
        <dd>
          <code>{node.stableId}</code>
        </dd>
        <dt>{copy.fieldComponent}</dt>
        <dd>
          <code>{node.componentId}</code>
        </dd>
        <dt>{copy.fieldPerspective}</dt>
        <dd>{node.perspective}</dd>
        <dt>{copy.fieldLabelId}</dt>
        <dd>{shown(node.labelId, copy)}</dd>
        <dt>{copy.fieldValidity}</dt>
        <dd>
          {shown(node.validFrom, copy)} {copy.validityTo} {shown(node.validTo, copy)}
        </dd>
        <dt>UNILEX</dt>
        <dd>
          {node.unilexStableId ? (
            <a className="dk-graph-source-link" href={localeHref(`/terms/${node.unilexStableId}`)}>
              <code>{node.unilexStableId}</code>
            </a>
          ) : (
            copy.senseNoMapping
          )}
        </dd>
      </dl>

      <p className="dk-graph-node-description">{node.description}</p>

      <section className="dk-graph-detail-review" data-section="relations">
        <h3>{copy.headingRelations}</h3>
        <p className="dk-graph-meta">
          {copy.relationCountLine}: {copy.directionOutgoing} {relations.outgoing.length} · {copy.directionIncoming}{' '}
          {relations.incoming.length}
        </p>
        <p className="dk-graph-notice" role="note">
          {copy.relationsIntro}
        </p>
        {relations.total === 0 ? (
          <p className="dk-graph-detail-unknown" role="note">
            {copy.relationsNone}
          </p>
        ) : (
          <ul className="dk-graph-edges">
            {[...relations.outgoing, ...relations.incoming].map((edge) => (
              <EdgeRow edge={edge} key={edge.edgeCode} locale={locale} copy={copy} />
            ))}
          </ul>
        )}
        {relations.unresolved.length > 0 ? (
          <p className="dk-graph-detail-warning" role="note">
            {copy.unresolvedOnNode} {relations.unresolved.length}.{' '}
            {relations.unresolved.every((edge) => edge.epistemicStatus === 'UNKNOWN')
              ? copy.epistemicUnknown
              : copy.epistemicDisputed}
          </p>
        ) : null}
        {relations.unknownEndpoints.length > 0 ? (
          <p className="dk-graph-detail-warning" role="note">
            {copy.unknownEndpoint}{' '}
            {relations.unknownEndpoints.map((id) => (
              <code key={id}>{id}</code>
            ))}
          </p>
        ) : null}
      </section>

      <section className="dk-graph-detail-evidence" data-section="evidence">
        <h3>{copy.headingEvidence}</h3>
        <SourceEvidence source={node.source} locale={locale} classPrefix="dk-graph" />
        <p className="dk-graph-meta">{copy.noNodeEvidenceRef}</p>
        <AliasChips aliases={node.aliases} locale={locale} copy={copy} />
      </section>

      <section className="dk-graph-detail-policy" data-section="sense">
        <h3>{copy.headingSense}</h3>
        <p className="dk-graph-meta">{copy.senseUnprojected}</p>
        {node.unilexStableId ? (
          <p className="dk-graph-meta">
            {copy.senseViaUnilex}{' '}
            <a className="dk-graph-source-link" href={localeHref(`/terms/${node.unilexStableId}`)}>
              <code>{node.unilexStableId}</code>
            </a>
          </p>
        ) : (
          <p className="dk-graph-meta">{copy.senseNoMapping}</p>
        )}
      </section>

      <section className="dk-graph-detail-review" data-section="decisions">
        <h3>{copy.headingDecisions}</h3>
        <p className="dk-graph-notice" role="note">
          {copy.decisionsIntro}
        </p>
        {identity.decisions.length === 0 ? (
          <p className="dk-graph-meta">{copy.nodeDecisionsNone}</p>
        ) : (
          <ul className="dk-graph-decisions">
            {identity.decisions.map((decision) => (
              <DecisionRow decision={decision} key={decision.reviewCode} copy={copy} />
            ))}
          </ul>
        )}
      </section>

      <section className="dk-graph-detail-review" data-section="conflicts">
        <h3>{copy.headingConflicts}</h3>
        <p className="dk-graph-notice" role="note">
          {copy.conflictsIntro}
        </p>
        {conflictsTotal === 0 ? (
          <p className="dk-graph-meta">{copy.nodeConflictsNone}</p>
        ) : (
          <ul className="dk-graph-conflicts">
            {conflicts.map((conflict) => (
              <li
                className="dk-graph-conflict"
                key={`${conflict.type}-${conflict.code}`}
                data-conflict-type={conflict.type}
              >
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
                  <span className="dk-graph-meta">
                    {copy.fieldEvidenceRef}: <code>{conflict.evidenceRef}</code>
                  </span>
                ) : (
                  <span className="dk-graph-meta">{copy.noEvidenceRef}</span>
                )}
                <SourceEvidence source={conflict.source} locale={locale} classPrefix="dk-graph" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="dk-graph-detail-warning" role="note">
        {copy.readOnlyNotice}
      </p>
      <p className="dk-graph-meta">{copy.mergeNever}</p>
    </div>
  )
}

function NodeSelectionMissing({ stableId, copy }: { stableId: string; copy: ConstellationCopy }): ReactNode {
  return (
    <div className="dk-graph-detail-unknown" role="status">
      <strong>{copy.selectionMissingTitle}</strong>
      <p>
        <code>{stableId}</code> — {copy.selectionMissingHint}
      </p>
    </div>
  )
}

export function ConstellationView({
  projection,
  locale = 'en',
  selectedNodeId = '',
}: {
  projection: ConstellationProjection
  locale?: Locale
  selectedNodeId?: string
}): ReactNode {
  const { counts } = projection
  const copy = getConstellationCopy(locale)
  const selectedNode = selectedNodeId === '' ? null : findNode(projection, selectedNodeId)

  return (
    <div className="dk-graph">
      <Panel title={copy.panelGraphIdentity} subtitle={copy.panelGraphIdentitySub}>
        <div className="dk-graph-identity">
          <div className="m-row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <Badge tone="ok">READ ONLY</Badge>
            <Badge tone="cyan">REGISTRY {projection.registry.version}</Badge>
            <Badge tone="night">{projection.registry.status}</Badge>
            <span className="dk-graph-meta">
              {projection.registry.entityCount} {copy.labelSeededEntities}
            </span>
          </div>
          <p className="dk-graph-notice" role="note">
            {projection.authority.notice}
          </p>
          <dl className="dk-graph-identity-meta">
            <dt>{copy.labelGraphId}</dt>
            <dd>
              <code className="dk-graph-id" data-graph-id={projection.graphId}>
                {projection.graphId}
              </code>
            </dd>
            <dt>{copy.labelCanonicalTables}</dt>
            <dd>{projection.authority.canonicalTables.join(', ')}</dd>
            <dt>{copy.labelRegistryNotice}</dt>
            <dd>{projection.registry.notice}</dd>
          </dl>
          <ul className="dk-graph-counts" aria-label={copy.countsAria}>
            <li>
              <strong>{counts.nodes}</strong> {copy.countEntities}
            </li>
            <li>
              <strong>{counts.aliases}</strong> {copy.countAliases}
            </li>
            <li>
              <strong>{counts.edges}</strong> {copy.countEdges}
            </li>
            <li>
              <strong>{counts.verifiedEdges}</strong> {copy.countVerifiedEdges}
            </li>
            <li>
              <strong>{counts.identityReviews}</strong> {copy.countIdentityReviews}
            </li>
            <li>
              <strong>{counts.activeMerges}</strong> {copy.countActiveMerges}
            </li>
            <li>
              <strong>{counts.components}</strong> {copy.countComponents}
            </li>
            <li>
              <strong>{counts.unresolvedConflicts}</strong> {copy.countConflicts}
            </li>
          </ul>
        </div>
      </Panel>

      {selectedNodeId === '' ? null : (
        <section className="dk-graph-section" aria-labelledby="graph-node-inspector-section-heading">
          <h2 id="graph-node-inspector-section-heading">{copy.inspectorHeading}</h2>
          <p className="dk-graph-meta">{copy.inspectorSubtitle}</p>
          {selectedNode ? (
            <NodeInspector
              node={selectedNode}
              relations={nodeRelations(projection, selectedNode.stableId)}
              identity={nodeIdentityFacts(projection, selectedNode.stableId)}
              locale={locale}
              copy={copy}
            />
          ) : (
            <NodeSelectionMissing stableId={selectedNodeId} copy={copy} />
          )}
        </section>
      )}

      <section className="dk-graph-section" aria-labelledby="graph-entities-heading">
        <h2 id="graph-entities-heading">{copy.sectionEntities}</h2>
        <p className="dk-graph-meta">{copy.sectionEntitiesNote}</p>
        {projection.nodes.length === 0 ? (
          <Panel title={copy.panelNoEntity}>
            <EmptyState title={copy.emptyGraph} hint={copy.emptyGraphHint} />
          </Panel>
        ) : (
          <div className="dk-graph-nodes">
            {projection.nodes.map((node) => (
              <NodeCard
                node={node}
                key={node.stableId}
                locale={locale}
                copy={copy}
                selected={selectedNodeId === node.stableId}
              />
            ))}
          </div>
        )}
      </section>

      <Panel title={copy.panelTypedEdges} subtitle={copy.panelTypedEdgesSub}>
        {projection.edges.length === 0 ? (
          <p className="dk-graph-meta">{copy.edgesNone}</p>
        ) : (
          <ul className="dk-graph-edges">
            {projection.edges.map((edge) => (
              <EdgeRow edge={edge} key={edge.edgeCode} locale={locale} copy={copy} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={copy.panelIdentityDecisions} subtitle={copy.panelIdentityDecisionsSub}>
        {projection.identityDecisions.length === 0 ? (
          <p className="dk-graph-meta">{copy.decisionsNone}</p>
        ) : (
          <ul className="dk-graph-decisions">
            {projection.identityDecisions.map((decision) => (
              <DecisionRow decision={decision} key={decision.reviewCode} copy={copy} />
            ))}
          </ul>
        )}
      </Panel>

      <ReviewRubricPanel rubric={projection.review} copy={copy} />

      <Panel title={copy.panelConflicts} subtitle={copy.panelConflictsSub}>
        {projection.conflicts.length === 0 ? (
          <p className="dk-graph-meta">{copy.conflictsAllDecided}</p>
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
                  <span className="dk-graph-meta">
                    {copy.fieldEvidenceRef}: <code>{conflict.evidenceRef}</code>
                  </span>
                ) : (
                  <span className="dk-graph-meta">{copy.noEvidenceRef}</span>
                )}
                <SourceEvidence source={conflict.source} locale={locale} classPrefix="dk-graph" />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
