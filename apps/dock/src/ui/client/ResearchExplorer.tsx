'use client'

import { useMemo, useState, type ReactNode } from 'react'
import type {
  ResearchCasesRow,
  ResearchFramesRow,
  ResearchWitnessesRow,
  ResearchHypothesesRow,
} from '@moonwitness/moonql-client'
import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Field,
  Pill,
  PillGroup,
  Panel,
  TextInput,
  type BadgeTone,
} from '@moonwitness/moonui'

export interface ResearchExplorerProps {
  initialCases: ResearchCasesRow[]
  initialFrames: ResearchFramesRow[]
  initialWitnesses: ResearchWitnessesRow[]
  initialHypotheses: ResearchHypothesesRow[]
}

type ResearchTab = 'cases' | 'witnesses' | 'hypotheses' | 'methodology'

function rightsTone(status: string): BadgeTone {
  switch (status) {
    case 'RIGHTS_EXACT_VERSION_CLEARED':
    case 'PUBLIC_DOMAIN':
      return 'ok'
    case 'METADATA_ONLY':
      return 'cyan'
    case 'RESTRICTED':
    case 'RIGHTS_UNKNOWN':
      return 'hot'
    default:
      return 'night'
  }
}

function modeTone(mode: string): BadgeTone {
  switch (mode) {
    case 'SWING':
      return 'accent'
    case 'POSITIVE_CORRECTION':
      return 'cyan'
    case 'OFFSIDE':
      return 'hot'
    default:
      return 'night'
  }
}

export function ResearchExplorer({
  initialCases,
  initialFrames,
  initialWitnesses,
  initialHypotheses,
}: ResearchExplorerProps): ReactNode {
  const [activeTab, setActiveTab] = useState<ResearchTab>('cases')
  const [search, setSearch] = useState('')
  const [selectedCase, setSelectedCase] = useState<string | null>(initialCases[0]?.caseCode ?? null)

  const activeCaseRecord = useMemo(() => {
    return initialCases.find((c) => c.caseCode === selectedCase) ?? initialCases[0] ?? null
  }, [initialCases, selectedCase])

  const filteredCases = useMemo(() => {
    if (!search.trim()) return initialCases
    const q = search.toLowerCase()
    return initialCases.filter(
      (c) =>
        c.caseCode.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.citationKey.toLowerCase().includes(q) ||
        c.lens.toLowerCase().includes(q),
    )
  }, [initialCases, search])

  const filteredWitnesses = useMemo(() => {
    if (!search.trim()) return initialWitnesses
    const q = search.toLowerCase()
    return initialWitnesses.filter(
      (w) =>
        w.witnessCode.toLowerCase().includes(q) ||
        w.keyToken.toLowerCase().includes(q) ||
        w.conclusion.toLowerCase().includes(q),
    )
  }, [initialWitnesses, search])

  const filteredHypotheses = useMemo(() => {
    if (!search.trim()) return initialHypotheses
    const q = search.toLowerCase()
    return initialHypotheses.filter(
      (h) =>
        h.hypothesisCode.toLowerCase().includes(q) ||
        h.question.toLowerCase().includes(q) ||
        (h.operator && h.operator.toLowerCase().includes(q)),
    )
  }, [initialHypotheses, search])

  return (
    <div className="m-stack" style={{ gap: 24 }}>
      {/* Stage Gates & Epistemic Notice */}
      <Panel
        title="SRGBL V8 Bounded Stages & MIZAN Governance"
        subtitle="S1 Source → R2 Observed Text → G3 Correlation → B4 Actor Frame → L5 Scoped Trace"
        actions={<Badge tone="cyan">FAIL-CLOSED UNKNOWN</Badge>}
      >
        <div className="m-stack" style={{ gap: 12 }}>
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--muted)' }}>
            Research claims undergo strict stage gates: exact edition/rights verification (S1), observed text claims with exact SHA (R2),
            defensible relations (G3), bounded hermeneutic frame (B4), and scoped derived interpretations (L5). All AI candidates are unpromoted,
            theological truth rankings are forbidden, and publication is unavailable without four-eyes human review.
          </p>
          <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Badge tone="night">S1: Exact Source</Badge>
            <Badge tone="night">R2: Observed Text</Badge>
            <Badge tone="night">G3: Defensible Relation</Badge>
            <Badge tone="night">B4: Actor Frame</Badge>
            <Badge tone="night">L5: Scoped Trace</Badge>
            <Badge tone="ok">MIZAN: 4-Eyes Review</Badge>
          </div>
        </div>
      </Panel>

      {/* Navigation Pills */}
      <div className="m-row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <PillGroup aria-label="Research Surface Selection">
          <Pill
            label={`Research Cases (${initialCases.length})`}
            active={activeTab === 'cases'}
            tone={activeTab === 'cases' ? 'cyan' : 'night'}
            onClick={() => setActiveTab('cases')}
          />
          <Pill
            label={`Key Witness Profiles (${initialWitnesses.length})`}
            active={activeTab === 'witnesses'}
            tone={activeTab === 'witnesses' ? 'cyan' : 'night'}
            onClick={() => setActiveTab('witnesses')}
          />
          <Pill
            label={`Adversarial Hypotheses (${initialHypotheses.length})`}
            active={activeTab === 'hypotheses'}
            tone={activeTab === 'hypotheses' ? 'cyan' : 'night'}
            onClick={() => setActiveTab('hypotheses')}
          />
          <Pill
            label="MIZAN Rules & Governance"
            active={activeTab === 'methodology'}
            tone={activeTab === 'methodology' ? 'cyan' : 'night'}
            onClick={() => setActiveTab('methodology')}
          />
        </PillGroup>

        {activeTab !== 'methodology' ? (
          <div style={{ minWidth: 240 }}>
            <Field label="" htmlFor="research-search">
              <TextInput
                id="research-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search research ledger..."
                icon="FIND"
              />
            </Field>
          </div>
        ) : null}
      </div>

      {/* TAB 1: CASES */}
      {activeTab === 'cases' ? (
        <div className="m-stack" style={{ gap: 20 }}>
          <div className="m-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filteredCases.map((c) => {
              const isSelected = selectedCase === c.caseCode
              return (
                <div
                  key={c.caseCode}
                  onClick={() => setSelectedCase(c.caseCode)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 4,
                    outline: isSelected ? '2px solid var(--accent)' : undefined,
                  }}
                >
                  <Card>
                    <CardHeader
                      title={
                        <div className="m-row" style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <span>{c.title}</span>
                          <Badge tone={rightsTone(c.rightsSnapshot)}>{c.sourceSense}</Badge>
                        </div>
                      }
                      subtitle={`Citation: ${c.citationKey} · Status: ${c.researchStatus}`}
                    />
                    <CardBody>
                      <div className="m-stack" style={{ gap: 8, fontSize: '0.825rem' }}>
                        <div className="m-row" style={{ justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--muted)' }}>Lens:</span>
                          <code>{c.lens}</code>
                        </div>
                        <div className="m-row" style={{ justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--muted)' }}>Rights:</span>
                          <span>{c.rightsSnapshot}</span>
                        </div>
                        {c.evidenceSha ? (
                          <div className="m-stack" style={{ gap: 4 }}>
                            <span style={{ color: 'var(--muted)' }}>Exact SHA-256:</span>
                            <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{c.evidenceSha}</code>
                          </div>
                        ) : null}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )
            })}
          </div>

          {/* Active Case Detail Frame */}
          {activeCaseRecord ? (
            <Panel
              title={`Case Inspection: ${activeCaseRecord.caseCode}`}
              subtitle={activeCaseRecord.citationKey}
            >
              <div className="m-stack" style={{ gap: 16 }}>
                <div className="m-stack" style={{ gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Frames Linked to this Case:</span>
                  {initialFrames
                    .filter((f) => f.domain || f.agentLabel)
                    .slice(0, 3)
                    .map((f) => (
                      <div
                        key={f.frameCode}
                        className="m-stack"
                        style={{
                          padding: 12,
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: 4,
                          gap: 6,
                          fontSize: '0.825rem',
                        }}
                      >
                        <div className="m-row" style={{ justifyContent: 'space-between' }}>
                          <strong>{f.frameCode}</strong>
                          <Badge tone="night">{f.genre}</Badge>
                        </div>
                        <div>
                          <strong>Speaker / Agent:</strong> {f.agentLabel} ({f.agentBasis})
                        </div>
                        <div>
                          <strong>Recipient / Address:</strong> {f.recipientLabel} ({f.recipientBasis})
                        </div>
                        <div>
                          <strong>Domain & Scope:</strong> {f.domain} · {f.scope}
                        </div>
                        <div style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                          Lens Note: {f.lensNote}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Panel>
          ) : null}
        </div>
      ) : null}

      {/* TAB 2: KEY WITNESS PROFILES */}
      {activeTab === 'witnesses' ? (
        <div className="m-stack" style={{ gap: 20 }}>
          <Alert tone="accent">
            <strong>Four Independent Scores (No Score Merge Policy):</strong> Maturity (/15), Quality (/40), Witness Eligibility (/100),
            and Epistemic Direction (−2..2) are strictly separated. No theological truth ranking or score amalgamation is permitted.
          </Alert>

          <div className="m-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            {filteredWitnesses.map((w) => {
              return (
                <Card key={w.witnessCode}>
                  <CardHeader
                    title={
                      <div className="m-row" style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>{w.witnessCode}</span>
                        <Badge tone="accent">{w.keyToken}</Badge>
                      </div>
                    }
                    subtitle={`Citation: ${w.citationKey} · Scheme: ${w.scheme}`}
                  />
                  <CardBody>
                    <div className="m-stack" style={{ gap: 12, fontSize: '0.85rem' }}>
                      <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                        <Badge tone="night">Direction: {w.direction}</Badge>
                        <Badge tone="night">Intensity: {w.intensity}</Badge>
                        <Badge tone="night">Confidence: {w.confidencePct}%</Badge>
                        <Badge tone={w.humanReviewed ? 'ok' : 'night'}>
                          {w.humanReviewed ? 'Human Reviewed' : 'Candidate'}
                        </Badge>
                      </div>

                      <div className="m-stack" style={{ gap: 4 }}>
                        <strong style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Conclusion:</strong>
                        <p style={{ margin: 0, lineHeight: 1.5 }}>{w.conclusion}</p>
                      </div>

                      <div className="m-stack" style={{ gap: 4 }}>
                        <strong style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Hermeneutic Limits:</strong>
                        <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--muted)', lineHeight: 1.4 }}>
                          {w.limits}
                        </p>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(5, 1fr)',
                          gap: 6,
                          textAlign: 'center',
                          padding: 8,
                          background: 'rgba(0,0,0,0.2)',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                        }}
                      >
                        <div>
                          <div>Fidelity</div>
                          <strong>{w.sourceFidelity}/4</strong>
                        </div>
                        <div>
                          <div>Observe</div>
                          <strong>{w.observability}/4</strong>
                        </div>
                        <div>
                          <div>Semantics</div>
                          <strong>{w.semanticConsistency}/4</strong>
                        </div>
                        <div>
                          <div>Cross-Ref</div>
                          <strong>{w.crossReference}/4</strong>
                        </div>
                        <div>
                          <div>Non-Overlap</div>
                          <strong>{w.nonOverlapping}/4</strong>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* TAB 3: ADVERSARIAL HYPOTHESES */}
      {activeTab === 'hypotheses' ? (
        <div className="m-stack" style={{ gap: 20 }}>
          <Alert tone="accent">
            <strong>Adversarial Hypothesis Engine:</strong> Rigorous stress-testing of interpretations via multi-operator SWING
            (direction, polarity, subject-object, cause-effect, perspective, temporal, semantic opposition), Positive Correction
            (non-neutral lens counter-readings), and OFFSIDE frame bounds checking. Hypotheses cannot self-validate.
          </Alert>

          <div className="m-stack" style={{ gap: 16 }}>
            {filteredHypotheses.map((h) => {
              return (
                <Panel
                  key={h.hypothesisCode}
                  title={`${h.mode}: ${h.hypothesisCode}`}
                  subtitle={`Question: ${h.question}`}
                  actions={
                    <div className="m-row" style={{ gap: 8 }}>
                      <Badge tone={modeTone(h.mode)}>{h.mode}</Badge>
                      <Badge tone={h.status === 'CORROBORATED' ? 'ok' : 'night'}>{h.status}</Badge>
                    </div>
                  }
                >
                  <div className="m-stack" style={{ gap: 10 }}>
                    <div className="m-stack" style={{ gap: 4, fontSize: '0.825rem' }}>
                      <span style={{ color: 'var(--muted)' }}>Evidence Span & SHA:</span>
                      <div style={{ padding: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 4, fontStyle: 'italic' }}>
                        &ldquo;{h.evidenceSpan}&rdquo;
                      </div>
                      <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{h.evidenceSha}</code>
                    </div>

                    {h.counterReadings ? (
                      <div style={{ fontSize: '0.85rem' }}>
                        <strong>Counter-Reading:</strong> {h.counterReadings}
                      </div>
                    ) : null}

                    <div className="m-row" style={{ justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)' }}>
                      <span>Proposed by: {h.proposedBy}</span>
                      <span>Verified: {h.verified ? 'Yes' : 'Unverified candidate'}</span>
                    </div>
                  </div>
                </Panel>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* TAB 4: METHODOLOGY & MIZAN RULES */}
      {activeTab === 'methodology' ? (
        <Panel
          title="MIZAN Human Research Review & Governance Invariants"
          subtitle="Four-Eyes Protocol, Version Mutex & Fail-Closed Publication Gate"
        >
          <div className="m-stack" style={{ gap: 20 }}>
            <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--muted)' }}>
              In accordance with milestone M14, research hypotheses, AI suggestions, and textual claims can never achieve
              canonical publication automatically. The following immutable contracts are enforced:
            </p>

            <div className="m-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
                <strong style={{ color: 'var(--ok)' }}>1. Four-Eyes Approval</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--muted)' }}>
                  Submitter cannot approve their own submission. Approval requires a named human reviewer from <code>auth_users</code> with explicit role credentials.
                </p>
              </div>

              <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
                <strong style={{ color: 'var(--cyan)' }}>2. Concurrent Mutex & CAS</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--muted)' }}>
                  State transitions utilize version CAS and mutex locks. Concurrent conflicting reviews yield <code>[200, 409]</code> with exactly one winner.
                </p>
              </div>

              <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
                <strong style={{ color: 'var(--hot)' }}>3. Counterevidence Resolution</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--muted)' }}>
                  Open counterevidence must be resolved with cited reasons prior to approval. An unaddressed counter-reading blocks transition.
                </p>
              </div>

              <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
                <strong style={{ color: 'var(--accent)' }}>4. Fail-Closed Publication Gate</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--muted)' }}>
                  Review release only reflects eligibility. <code>publicationAvailable</code> remains permanently <code>false</code> until publication gate M18 is formally ratified.
                </p>
              </div>
            </div>
          </div>
        </Panel>
      ) : null}
    </div>
  )
}
