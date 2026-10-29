'use client'

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import type { Locale } from '@moonwitness/core'
import type { BadgeTone } from '@moonwitness/moonui'
import type { PatchesRegistry } from '@/data/queries/journey'
import { clientDockLocale } from '@/lib/locale-context.mjs'
import {
  censusPatches,
  filterPatches,
  focusWords,
  patchAnchor,
  scopeWords,
  statusMeaning,
  type PatchRecord,
} from '@/data/queries/patches'
import { getPatchesCopy, type PatchesCopy } from '@/ui/copy/patches-copy'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Field,
  Panel,
  TextInput,
} from '@moonwitness/moonui'

export interface PatchesExplorerProps {
  registry: PatchesRegistry
  locale?: Locale
}

const wrap: CSSProperties = { overflowWrap: 'anywhere', minWidth: 0 }
const note: CSSProperties = { fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.5, ...wrap }
const codeChip: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.75rem',
  letterSpacing: '0.04em',
  padding: '2px 6px',
  borderRadius: 4,
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  overflowWrap: 'anywhere',
}

/** The tone is presentation only: the badge text always carries the hub code. */
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

function Tally({ rows }: { rows: { code: string; count: number }[] }): ReactNode {
  if (rows.length === 0) {
    return null
  }
  return (
    <ul className="m-stack" style={{ gap: 4, listStyle: 'none', margin: 0, padding: 0 }}>
      {rows.map((row) => (
        <li key={row.code} className="m-row" style={{ gap: 8, alignItems: 'baseline', flexWrap: 'wrap', ...wrap }}>
          <span style={{ ...codeChip, color: 'var(--cyan)' }}>{row.code}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{row.count}</span>
        </li>
      ))}
    </ul>
  )
}

export function PatchesExplorer({ registry, locale }: PatchesExplorerProps): ReactNode {
  const [activeLocale, setActiveLocale] = useState<Locale>(() => locale ?? clientDockLocale())

  useEffect(() => {
    if (locale) {
      setActiveLocale(locale)
    } else {
      setActiveLocale(clientDockLocale())
    }
  }, [locale])

  const copy = getPatchesCopy(activeLocale)

  const [search, setSearch] = useState('')
  const [selectedFocus, setSelectedFocus] = useState<string>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const census = useMemo(() => censusPatches(registry), [registry])

  const shown = useMemo(
    () => filterPatches(registry.patches, { focus: selectedFocus, query: search }),
    [registry.patches, selectedFocus, search],
  )

  const filterIsActive = search.trim() !== '' || selectedFocus !== 'ALL'

  const chips = [
    { code: 'ALL', label: copy.categoryAll, count: registry.patches.length },
    ...census.categories.map((entry) => ({
      code: entry.code,
      label: focusWords(entry.code, copy),
      count: entry.count,
    })),
  ]

  return (
    <div className="m-stack" style={{ gap: 24 }}>
      <Alert tone="hot">
        <span style={{ fontWeight: 700 }}>{copy.readOnlyNotice}</span>
      </Alert>

      {census.disputed.map((pair) => (
        <Alert key={pair.recordId} tone="hot">
          <div className="m-stack" style={{ gap: 6 }}>
            <strong style={wrap}>
              {copy.disputeHeading} ({copy.disputeSlot} {pair.slot})
            </strong>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5, ...wrap }}>{copy.disputeBody}</p>
            <dl className="m-stack" style={{ gap: 4, margin: 0, fontSize: '0.82rem' }}>
              <div>
                <dt style={{ color: 'var(--muted)', display: 'inline' }}>{copy.disputeCanonical}: </dt>
                <dd style={{ display: 'inline', margin: 0, color: 'var(--fg)' }}>{pair.title}</dd>
              </div>
              <div>
                <dt style={{ color: 'var(--muted)', display: 'inline' }}>{copy.disputeDisputed}: </dt>
                <dd style={{ display: 'inline', margin: 0, color: 'var(--hot)' }}>{pair.disputedTitle}</dd>
              </div>
              <div className="m-row" style={{ gap: 6, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <dt style={{ color: 'var(--muted)', margin: 0 }}>{copy.disputeStatus}:</dt>
                <dd style={{ margin: 0 }}>
                  <Badge tone={statusTone(pair.status)}>{pair.status}</Badge>
                </dd>
              </div>
            </dl>
            <p style={note}>
              {pair.historicalNotes ? `${copy.disputeSourceNote}: ${pair.historicalNotes}` : copy.disputeSourceMissing}
            </p>
          </div>
        </Alert>
      ))}

      <Panel title={copy.censusTitle} subtitle={copy.censusSubtitle}>
        <div className="m-stack" style={{ gap: 14 }}>
          <ul className="m-stack" style={{ gap: 4, listStyle: 'none', margin: 0, padding: 0, fontSize: '0.85rem' }}>
            <li style={wrap}>
              {census.records} {copy.censusRecords}
            </li>
            <li style={wrap}>
              {census.numberedSlots} {copy.censusNumbered}
            </li>
            <li style={wrap}>
              {census.unnumberedSlots.length} {copy.censusUnnumbered}
              {census.unnumberedSlots.length > 0 ? `: ${census.unnumberedSlots.join(', ')}` : ''}
            </li>
            <li style={wrap}>
              {census.canonical} {copy.censusCanonical}
            </li>
            <li style={wrap}>
              {census.conflicts} {copy.censusDisputed}
            </li>
            <li style={wrap}>
              {census.disputed.length} {copy.censusDualTitle}
            </li>
          </ul>

          <p style={note}>
            {census.slotSpan
              ? `${copy.censusSlotRange} ${census.slotSpan.first} ${copy.censusThrough} ${census.slotSpan.last}.`
              : copy.censusNoNumbered}
          </p>
          <p style={note}>{copy.censusSlotAbsent}</p>
          <p style={note}>
            {census.missingSlots.length > 0
              ? `${copy.censusMissing} ${census.missingSlots.join(', ')}`
              : copy.censusNoMissing}
          </p>

          <div className="m-row" style={{ gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div className="m-stack" style={{ gap: 6, flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--chalk-dim)' }}>
                {copy.censusStatusHeading}
              </span>
              <Tally rows={census.statuses} />
            </div>
            <div className="m-stack" style={{ gap: 6, flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--chalk-dim)' }}>
                {copy.censusFocusHeading}
              </span>
              <Tally rows={census.categories} />
            </div>
          </div>

        </div>
      </Panel>

      <div className="m-stack" style={{ gap: 8 }}>
        <Panel title={copy.sourceOwnerHeading}>
          <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.55, ...wrap }}>{copy.sourceOwnerBody}</p>
        </Panel>
        <Alert tone="accent">
          <span style={{ fontSize: '0.85rem', ...wrap }}>{copy.noMapNotice}</span>
        </Alert>
      </div>

      <Panel title={copy.filterHeading} subtitle={copy.filterSubtitle}>
        <div className="m-stack" style={{ gap: 16 }}>
          <div className="m-row" style={{ gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <Field label={copy.filterFieldLabel} htmlFor="patch-search" hint={copy.categoryHint}>
                <TextInput
                  id="patch-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  icon="FIND"
                />
              </Field>
            </div>
            {search !== '' ? (
              <Button variant="ghost" size="sm" onClick={() => setSearch('')}>
                {copy.clearSearch}
              </Button>
            ) : null}
          </div>

          <div className="m-stack" style={{ gap: 6 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--chalk-dim)' }}>
              {copy.categoryHeading}
            </span>
            <div
              className="m-row"
              style={{ gap: 8, flexWrap: 'wrap' }}
              role="group"
              aria-label={copy.categoryGroupAria}
            >
              {chips.map((chip) => (
                <Button
                  key={chip.code}
                  variant="ghost"
                  size="sm"
                  aria-pressed={selectedFocus === chip.code}
                  onClick={() => setSelectedFocus(chip.code)}
                >
                  {chip.label} <span style={{ color: 'var(--muted)' }}>{chip.count}</span>
                </Button>
              ))}
            </div>
            {selectedFocus !== 'ALL' ? (
              <div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFocus('ALL')}>
                  {copy.clearFocus}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </Panel>

      <div className="m-stack" style={{ gap: 16 }}>
        <div className="m-row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span role="status" aria-live="polite" style={{ fontSize: '0.85rem', color: 'var(--muted)', letterSpacing: '0.04em' }}>
            {copy.showingLine} {shown.length} {copy.showingOf} {registry.patches.length} {copy.showingRecords}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            {census.slotSpan
              ? `${copy.slotSpanLabel} ${census.slotSpan.first}–${census.slotSpan.last}`
              : copy.slotSpanNone}
          </span>
        </div>

        {shown.length === 0 ? (
          <div className="m-stack" style={{ gap: 12 }}>
            <EmptyState title={copy.zeroTitle} hint={copy.zeroHint} />
            {filterIsActive ? (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('')
                    setSelectedFocus('ALL')
                  }}
                >
                  {copy.clearFocus}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
              gap: 16,
            }}
          >
            {shown.map((patch) => (
              <PatchCard
                key={patch.id}
                patch={patch}
                copy={copy}
                expanded={expandedId === patch.id}
                onToggle={() => setExpandedId(expandedId === patch.id ? null : patch.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PatchCard({
  patch,
  copy,
  expanded,
  onToggle,
}: {
  patch: PatchRecord
  copy: PatchesCopy
  expanded: boolean
  onToggle: () => void
}): ReactNode {
  const anchor = patchAnchor(patch.slot)
  const bodyId = `patch-record-${patch.id}`

  return (
    <Card id={anchor} variant="paper">
      <CardHeader
        title={
          <div className="m-row" style={{ gap: 8, alignItems: 'baseline', flexWrap: 'wrap', ...wrap }}>
            <span style={{ ...codeChip, color: 'var(--cyan)' }}>
              {copy.slotLabel} {patch.slot}
            </span>
            <span style={wrap}>{patch.title}</span>
          </div>
        }
        subtitle={
          <div className="m-stack" style={{ gap: 2, ...wrap }}>
            {patch.disputedTitle ? (
              <span style={{ color: 'var(--hot)', ...wrap }}>
                {copy.disputeDisputed}: {patch.disputedTitle}
              </span>
            ) : null}
            <span>
              {focusWords(patch.thematicFocus, copy)} · {copy.scopeLabel} {scopeWords(patch.scope, copy)}
            </span>
          </div>
        }
        actions={
          <div className="m-stack" style={{ gap: 6, alignItems: 'flex-end', ...wrap }}>
            <Badge tone={statusTone(patch.status)}>{patch.status}</Badge>
            <a href={`#${anchor}`} aria-label={`${copy.anchorAria} ${patch.slot}`} style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {copy.anchorLink}
            </a>
          </div>
        }
      />
      <CardBody>
        <p
          style={{
            ...note,
            display: expanded ? 'block' : '-webkit-box',
            WebkitLineClamp: expanded ? undefined : 3,
            WebkitBoxOrient: expanded ? undefined : 'vertical',
            overflow: expanded ? 'visible' : 'hidden',
          }}
        >
          {patch.description ?? copy.noDescription}
        </p>

        <p style={{ ...note, marginTop: 8, color: 'var(--chalk-dim)' }}>{statusMeaning(patch.status, copy)}</p>

        <div id={bodyId} hidden={!expanded} className="m-stack" style={{ gap: 10 }}>
            <p style={note}>
              <strong>{copy.historicalCitation}: </strong>
              {patch.historicalNotes ?? copy.noHistoricalNote}
            </p>

        </div>

        <div className="m-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
          <span style={note}>
            {copy.updatedLabel}: {patch.updatedAt}
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={expanded}
            aria-controls={bodyId}
            aria-label={`${expanded ? copy.collapseAria : copy.expandAria} ${patch.slot}`}
            onClick={onToggle}
          >
            {expanded ? copy.collapse : copy.expand}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
