import { useState, type ReactNode } from 'react'
import { Button, DataTable, EmptyState, Panel, TextInput, type ColumnDef } from '@moonwitness/moonui'
import type { ObjectRef, ObjectSidecar } from '../types.js'
import { formatBytes } from '../lib/format.js'

export interface WatchRow {
  ref: ObjectRef
  sidecar: ObjectSidecar | null
  error: string | null
}

export function EchologObjectList({
  rows,
  selectedKey,
  busy,
  onSelect,
  onTrack,
  onUntrack,
  onRefreshAll,
}: {
  rows: WatchRow[]
  selectedKey: string | null
  busy: boolean
  onSelect: (digest: string) => void
  onTrack: (digest: string) => Promise<string | null>
  onUntrack: (objectKey: string) => void
  onRefreshAll: () => void
}): ReactNode {
  const [digestInput, setDigestInput] = useState('')
  const [trackError, setTrackError] = useState<string | null>(null)

  async function submitTrack(): Promise<void> {
    setTrackError(null)
    const message = await onTrack(digestInput)
    if (message) setTrackError(message)
    else setDigestInput('')
  }

  const columns: ColumnDef<WatchRow>[] = [
    {
      key: 'object_key',
      label: 'Object key',
      render: (row) => (
        <Button
          size="sm"
          variant={row.ref.object_key === selectedKey ? 'primary' : 'ghost'}
          onClick={() => onSelect(row.ref.digest)}
        >
          <code className="m-mono">{row.ref.object_key.slice(0, 17)}…{row.ref.digest.slice(-6)}</code>
        </Button>
      ),
    },
    { key: 'size', label: 'Size', align: 'right', render: (row) => formatBytes(row.ref.size) },
    { key: 'content_type', label: 'MIME', render: (row) => row.ref.content_type },
    {
      key: 'state',
      label: 'Read state',
      render: (row) => {
        if (row.sidecar) return <span>metadata read — {row.sidecar.uploader} @ {row.sidecar.created_at}</span>
        if (row.error) return <span>unreadable: {row.error}</span>
        return <span>metadata not read yet</span>
      },
    },
  ]

  return (
    <Panel
      title="Tracked objects"
      subtitle="Consumer references only: {object_key, digest, size, content_type}. Enumeration stays with the service."
      actions={
        <Button size="sm" onClick={onRefreshAll} disabled={busy}>
          Refresh all
        </Button>
      }
    >
      <div className="echolog-row echolog-track">
        <TextInput
          aria-label="SHA-256 digest to track"
          placeholder="64-character sha256 digest"
          value={digestInput}
          onChange={(event) => setDigestInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void submitTrack()
          }}
        />
        <Button variant="accent" onClick={() => void submitTrack()} disabled={busy}>
          Track
        </Button>
      </div>
      {trackError ? <p className="echolog-track-error">{trackError}</p> : null}
      <DataTable columns={columns} rows={rows} rowKey={(row) => row.ref.object_key} empty={<EmptyState title="No tracked objects" hint="Upload a file or paste a digest to track it." />} />
      <div className="echolog-row">
        <Button variant="ghost" onClick={() => selectedKey ? onUntrack(selectedKey) : undefined} disabled={!selectedKey}>
          Stop tracking selected
        </Button>
        <span className="m-muted">
          Stopping tracking removes the local reference only; it never deletes the stored object.
        </span>
      </div>
    </Panel>
  )
}
