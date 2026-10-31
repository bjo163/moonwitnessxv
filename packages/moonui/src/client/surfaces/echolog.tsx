'use client'

import { useState, type ReactNode } from 'react'
import { DataTable, EmptyState, type ColumnDef } from '../../data.js'
import { Alert, Panel } from '../../layout.js'
import { Button, TextInput } from '../../form.js'

/**
 * The operator watchlist (ADR-0017). The surface resolves the references, reads
 * the sidecars and formats every word; this view owns the table, the track field
 * and the destructive action. It knows no transport and no storage key.
 */
export interface WatchlistRow {
  /** stable row key — the object key the surface tracks */
  key: string
  /** digest the select callback receives */
  digest: string
  /** pre-formatted display label; the view never truncates a digest itself */
  label: string
  size: string
  contentType: string
  /** one sentence stating whether the metadata was read, in words */
  stateLine: string
}

export interface WatchlistCopy {
  title: string
  subtitle: string
  refresh: string
  keyColumn: string
  sizeColumn: string
  typeColumn: string
  stateColumn: string
  digestLabel: string
  digestPlaceholder: string
  track: string
  stopTracking: string
  stopTrackingHint: string
  emptyTitle: string
  emptyHint: string
}

export interface ObjectWatchlistProps {
  rows: WatchlistRow[]
  selectedKey: string | null
  busy: boolean
  copy: WatchlistCopy
  onSelect: (digest: string) => void
  /** resolves to an error sentence, or null when the reference was accepted */
  onTrack: (digest: string) => Promise<string | null>
  onUntrack: (objectKey: string) => void
  onRefreshAll: () => void
}

export function ObjectWatchlist({
  rows,
  selectedKey,
  busy,
  copy,
  onSelect,
  onTrack,
  onUntrack,
  onRefreshAll,
}: ObjectWatchlistProps): ReactNode {
  const [digestInput, setDigestInput] = useState('')
  const [trackError, setTrackError] = useState<string | null>(null)

  async function submitTrack(): Promise<void> {
    setTrackError(null)
    const message = await onTrack(digestInput)
    if (message) setTrackError(message)
    else setDigestInput('')
  }

  const columns: ColumnDef<WatchlistRow>[] = [
    {
      key: 'object_key',
      label: copy.keyColumn,
      render: (row) => (
        <Button
          size="sm"
          variant={row.key === selectedKey ? 'primary' : 'ghost'}
          onClick={() => onSelect(row.digest)}
        >
          <code className="m-mono">{row.label}</code>
        </Button>
      ),
    },
    { key: 'size', label: copy.sizeColumn, align: 'right', render: (row) => row.size },
    { key: 'content_type', label: copy.typeColumn, render: (row) => row.contentType },
    { key: 'state', label: copy.stateColumn, render: (row) => <span>{row.stateLine}</span> },
  ]

  return (
    <Panel title={copy.title} subtitle={copy.subtitle} actions={<Button size="sm" onClick={onRefreshAll} disabled={busy}>{copy.refresh}</Button>}>
      <div className="m-row" style={{ gap: 8 }}>
        <TextInput
          aria-label={copy.digestLabel}
          placeholder={copy.digestPlaceholder}
          value={digestInput}
          onChange={(event) => setDigestInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void submitTrack()
          }}
        />
        <Button variant="accent" onClick={() => void submitTrack()} disabled={busy}>
          {copy.track}
        </Button>
      </div>
      {trackError ? <Alert tone="hot">{trackError}</Alert> : null}
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.key}
        empty={<EmptyState title={copy.emptyTitle} hint={copy.emptyHint} />}
      />
      <div className="m-row" style={{ gap: 8 }}>
        <Button variant="ghost" onClick={() => (selectedKey ? onUntrack(selectedKey) : undefined)} disabled={!selectedKey}>
          {copy.stopTracking}
        </Button>
        <span className="m-muted">{copy.stopTrackingHint}</span>
      </div>
    </Panel>
  )
}
