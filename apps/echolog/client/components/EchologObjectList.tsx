import { type ReactNode } from 'react'
import { ObjectWatchlist, type WatchlistCopy, type WatchlistRow } from '@moonwitness/moonui/client'
import type { ObjectRef, ObjectSidecar } from '../types.js'
import { formatBytes } from '../lib/format.js'

export interface WatchRow {
  ref: ObjectRef
  sidecar: ObjectSidecar | null
  error: string | null
}

/**
 * Every sentence the shared watchlist may print. The words belong to ECHOLOG;
 * the table, the track field and the destructive action belong to MoonUI.
 */
const copy: WatchlistCopy = {
  title: 'Tracked objects',
  subtitle: 'Consumer references only: {object_key, digest, size, content_type}. Enumeration stays with the service.',
  refresh: 'Refresh all',
  keyColumn: 'Object key',
  sizeColumn: 'Size',
  typeColumn: 'MIME',
  stateColumn: 'Read state',
  digestLabel: 'SHA-256 digest to track',
  digestPlaceholder: '64-character sha256 digest',
  track: 'Track',
  stopTracking: 'Stop tracking selected',
  stopTrackingHint: 'Stopping tracking removes the local reference only; it never deletes the stored object.',
  emptyTitle: 'No tracked objects',
  emptyHint: 'Upload a file or paste a digest to track it.',
}

/**
 * Markup-free container (ADR-0017 R2): it turns the local references into the
 * finished words the shared view renders and forwards the callbacks. It declares
 * no component anatomy and no intrinsic element of its own.
 */
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
  const watchRows: WatchlistRow[] = rows.map((row) => {
    const stateLine = row.sidecar
      ? `metadata read — ${row.sidecar.uploader} @ ${row.sidecar.created_at}`
      : row.error
        ? `unreadable: ${row.error}`
        : 'metadata not read yet'
    return {
      key: row.ref.object_key,
      digest: row.ref.digest,
      label: `${row.ref.object_key.slice(0, 17)}…${row.ref.digest.slice(-6)}`,
      size: formatBytes(row.ref.size),
      contentType: row.ref.content_type,
      stateLine,
    }
  })

  return (
    <ObjectWatchlist
      rows={watchRows}
      copy={copy}
      selectedKey={selectedKey}
      busy={busy}
      onSelect={onSelect}
      onTrack={onTrack}
      onUntrack={onUntrack}
      onRefreshAll={onRefreshAll}
    />
  )
}
