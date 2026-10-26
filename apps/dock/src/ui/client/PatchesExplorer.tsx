'use client'

import { useMemo, useState, type ReactNode } from 'react'
import type { JourneyPatchesOverviewOutput, JourneyMandatesRow } from '@moonwitness/moonql-client'
import {
  Alert,
  Badge,
  Button,
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

export interface PatchesExplorerProps {
  initialPatches: JourneyPatchesOverviewOutput[]
  initialMandates: JourneyMandatesRow[]
}

const THEMATIC_FILTERS = [
  { id: 'ALL', label: 'All Patches' },
  { id: 'PROTECTION', label: 'Protection' },
  { id: 'ETHICS', label: 'Ethics' },
  { id: 'COMMUNITY', label: 'Community' },
  { id: 'STEWARDSHIP', label: 'Stewardship' },
  { id: 'JUSTICE', label: 'Justice' },
  { id: 'ACTION', label: 'Action' },
] as const

function statusTone(status: string): BadgeTone {
  switch (status) {
    case 'REPORTED_IN_CHAT':
    case 'RECOVERED_DRAFT':
      return 'ok'
    case 'UNRESOLVED_NUMBERING_CONFLICT':
      return 'hot'
    case 'USER_SUBMITTED_IN_CHAT':
      return 'accent'
    case 'UNNUMBERED_HISTORICAL':
      return 'cyan'
    default:
      return 'night'
  }
}

export function PatchesExplorer({ initialPatches, initialMandates }: PatchesExplorerProps): ReactNode {
  const [search, setSearch] = useState('')
  const [selectedFocus, setSelectedFocus] = useState<string>('ALL')
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null)

  const filteredPatches = useMemo(() => {
    return initialPatches.filter((p) => {
      if (selectedFocus !== 'ALL' && p.thematicFocus !== selectedFocus) {
        return false
      }
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchTitle = p.title.toLowerCase().includes(query)
        const matchSlot = p.slot.toLowerCase().includes(query)
        const matchLore = p.description?.toLowerCase().includes(query) ?? false
        const matchDispute = p.disputedTitle?.toLowerCase().includes(query) ?? false
        if (!matchTitle && !matchSlot && !matchLore && !matchDispute) {
          return false
        }
      }
      return true
    })
  }, [initialPatches, selectedFocus, search])

  const mandatesBySlot = useMemo(() => {
    const map = new Map<string, JourneyMandatesRow[]>()
    for (const m of initialMandates) {
      if (!m.patchRef) continue
      const slot = m.patchRef
      const list = map.get(slot) ?? []
      list.push(m)
      map.set(slot, list)
    }
    return map
  }, [initialMandates])

  const conflictPatch = initialPatches.find((p) => p.status === 'UNRESOLVED_NUMBERING_CONFLICT')

  return (
    <div className="m-stack" style={{ gap: 24 }}>
      {conflictPatch ? (
        <Alert tone="hot">
          <strong>Open Historical Discrepancy (Slot {conflictPatch.slot}):</strong> Canonical title is{' '}
          <em>&ldquo;{conflictPatch.title}&rdquo;</em>, but primary source archives dispute this as{' '}
          <em>&ldquo;{conflictPatch.disputedTitle}&rdquo;</em>. Preserved as an open epistemic split per Master
          Vision Narrative §21A.8.
        </Alert>
      ) : null}

      <Panel title="Explore World Patches" subtitle="33 Canonical Patches and Historical Context of the Empire of the Light">
        <div className="m-stack" style={{ gap: 16 }}>
          <div className="m-row" style={{ gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <Field label="Filter by keyword or slot" htmlFor="patch-search">
              <TextInput
                id="patch-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="search title, slot 014, lore..."
                icon="FIND"
              />
            </Field>
            {search ? (
              <Button variant="ghost" size="sm" onClick={() => setSearch('')}>
                CLEAR SEARCH
              </Button>
            ) : null}
          </div>

          <PillGroup>
            {THEMATIC_FILTERS.map((cat) => (
              <Pill
                key={cat.id}
                label={cat.label}
                active={selectedFocus === cat.id}
                tone={selectedFocus === cat.id ? 'cyan' : 'night'}
                onClick={() => setSelectedFocus(cat.id)}
              />
            ))}
          </PillGroup>
        </div>
      </Panel>

      <div className="m-stack" style={{ gap: 16 }}>
        <div className="m-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', letterSpacing: '0.04em' }}>
            SHOWING {filteredPatches.length} OF {initialPatches.length} PATCHES
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            CANONICAL SLOTS 001–033 & HISTORICAL SOURCES
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filteredPatches.map((patch) => {
            const isExpanded = expandedSlot === patch.slot
            const mandates = mandatesBySlot.get(patch.slot) ?? []

            return (
              <Card key={patch.id} variant="paper">
                <CardHeader
                  title={
                    <div className="m-row" style={{ gap: 8, alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'var(--surface-2)',
                          color: 'var(--cyan)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        #{patch.slot}
                      </span>
                      <span>{patch.title}</span>
                    </div>
                  }
                  subtitle={
                    patch.disputedTitle ? (
                      <span style={{ color: 'var(--hot)' }}>
                        Disputed Archive Title: {patch.disputedTitle}
                      </span>
                    ) : (
                      <span>{patch.thematicFocus} · {patch.scope}</span>
                    )
                  }
                  actions={
                    <Badge tone={statusTone(patch.status)}>
                      {patch.status === 'UNRESOLVED_NUMBERING_CONFLICT' ? 'DISPUTED' : patch.status.replace(/_/g, ' ')}
                    </Badge>
                  }
                />
                <CardBody>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      color: 'var(--muted)',
                      margin: 0,
                      display: isExpanded ? 'block' : '-webkit-box',
                      WebkitLineClamp: isExpanded ? undefined : 3,
                      WebkitBoxOrient: isExpanded ? undefined : 'vertical',
                      overflow: isExpanded ? 'visible' : 'hidden',
                    }}
                  >
                    {patch.description || 'No description recorded.'}
                  </p>

                  {isExpanded && patch.historicalNotes ? (
                    <div style={{ marginTop: 10, padding: 8, borderRadius: 4, background: 'var(--surface-2)', fontSize: '0.78rem', color: 'var(--chalk-dim)', border: '1px solid var(--border)' }}>
                      <strong>Historical Citation:</strong> {patch.historicalNotes}
                    </div>
                  ) : null}

                  {isExpanded && mandates.length > 0 ? (
                    <div className="m-stack" style={{ gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--chalk-dim)', letterSpacing: '0.05em' }}>
                        ACTIVE MANDATES ({mandates.length})
                      </span>
                      {mandates.map((m) => (
                        <div
                          key={m.id}
                          style={{
                            padding: 8,
                            borderRadius: 4,
                            background: 'var(--surface-2)',
                            fontSize: '0.8rem',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div className="m-row" style={{ justifyContent: 'space-between', marginBottom: 2 }}>
                            <strong style={{ color: 'var(--cyan)' }}>{m.title}</strong>
                            <Badge tone="ok">{m.status}</Badge>
                          </div>
                          <div style={{ color: 'var(--fg)' }}>{m.deliverableDesc}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 4 }}>
                            Operator: {m.operatorPseudonym} · Expires: {m.expiresAt}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="m-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      Focus: {patch.thematicFocus}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedSlot(isExpanded ? null : patch.slot)}
                    >
                      {isExpanded ? 'COLLAPSE' : 'READ LORE'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
