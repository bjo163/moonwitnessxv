import type { ReactNode } from 'react'
import { Alert } from '../layout.js'
import { Button, LinkButton } from '../form.js'
import { Panel } from '../layout.js'
import { Pill, type PillTone } from '../pills.js'
import { Stat } from '../layout.js'

/**
 * Object detail panel (ADR-0017). The surface resolves the sidecar and formats
 * the words; MoonUI owns the panel, the stats and the destructive affordance.
 */
export interface EchologSidecarStats {
  filename: string
  digest: string
  size: string
  contentType: string
  uploader: string
  createdAt: string
}

export interface EchologBadge {
  label: string
  tone: PillTone
}

export interface EchologGrant {
  url: string
  expiresAt: string
}

export function ObjectDetailPanel({
  stats,
  objectKey,
  scan,
  retention,
  legalHold,
  grant,
  remaining,
  countdown,
  metaError,
  deleteError,
  busy,
  onRefresh,
  onRequestGrant,
  onDelete,
}: {
  stats: EchologSidecarStats | null
  objectKey?: string
  scan?: EchologBadge
  retention?: EchologBadge
  legalHold?: boolean
  grant?: EchologGrant | null
  remaining?: number
  countdown?: string
  metaError?: string | null
  deleteError?: string | null
  busy: boolean
  onRefresh: () => void
  onRequestGrant: () => void
  onDelete: () => void
}): ReactNode {
  if (metaError && !stats) {
    return (
      <Panel title="Object detail">
        <Alert tone="hot">{metaError}</Alert>
        <div className="m-row">
          <Button onClick={onRefresh} disabled={busy}>
            Retry metadata read
          </Button>
        </div>
      </Panel>
    )
  }

  if (!stats) {
    return (
      <Panel title="Object detail">
        <p className="m-muted">Select a tracked object to read its sidecar from ECHOLOG.</p>
      </Panel>
    )
  }

  return (
    <Panel
      title="Object detail"
      subtitle={<code className="m-mono">{objectKey}</code>}
      actions={
        <Button size="sm" onClick={onRefresh} disabled={busy}>
          Refresh
        </Button>
      }
    >
      <div className="m-detail-stats">
        <Stat label="Filename" value={stats.filename} />
        <Stat label="SHA-256 digest" value={<code className="m-mono">{stats.digest}</code>} />
        <Stat label="Size" value={stats.size} />
        <Stat label="MIME type" value={stats.contentType} />
        <Stat label="Uploader" value={stats.uploader} />
        <Stat label="Created" value={stats.createdAt} />
      </div>
      <div className="m-detail-pills">
        {scan ? <Pill label={scan.label} tone={scan.tone} /> : null}
        {retention ? <Pill label={retention.label} tone={retention.tone} /> : null}
        <Pill
          label={legalHold ? 'legal hold: on — deletion refused' : 'legal hold: off'}
          tone={legalHold ? 'hot' : 'night'}
        />
      </div>
      <p className="m-muted">
        Retention and legal hold are set at ingest; this console can neither add nor lift a hold after the
        object exists.
      </p>

      <div className="m-row">
        <Button onClick={onRequestGrant} disabled={busy}>
          Request download grant
        </Button>
        {grant ? (
          (remaining ?? 0) > 0 ? (
            <LinkButton variant="cyan" href={grant.url}>
              Download now
            </LinkButton>
          ) : (
            <span className="m-muted">Grant expired — request a new one.</span>
          )
        ) : null}
      </div>
      {grant ? (
        <Alert tone="accent">
          Short-lived grant valid for {countdown} (until {grant.expiresAt}). The console never embeds a
          long-lived URL.
        </Alert>
      ) : null}

      <div className="m-row">
        <Button variant="danger" onClick={onDelete} disabled={busy}>
          Delete object
        </Button>
      </div>
      {deleteError ? (
        <Alert tone="hot">
          ECHOLOG refused the deletion — reason shown verbatim:
          <br />
          <strong>{deleteError}</strong>
        </Alert>
      ) : null}
    </Panel>
  )
}
