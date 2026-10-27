import type { ReactNode } from 'react'
import { Alert, Button, LinkButton, Panel, Pill, Stat } from '@moonwitness/moonui'
import type { DownloadGrant, ObjectSidecar } from '../types.js'
import { formatBytes, formatCountdown, grantRemainingSeconds, retentionWords, scanWords } from '../lib/format.js'

export function EchologDetailPanel({
  sidecar,
  metaError,
  grant,
  nowMs,
  deleteError,
  busy,
  onRefresh,
  onRequestGrant,
  onDelete,
}: {
  sidecar: ObjectSidecar | null
  metaError: string | null
  grant: DownloadGrant | null
  nowMs: number
  deleteError: string | null
  busy: boolean
  onRefresh: () => void
  onRequestGrant: () => void
  onDelete: () => void
}): ReactNode {
  if (metaError && !sidecar) {
    return (
      <Panel title="Object detail">
        <Alert tone="hot">{metaError}</Alert>
        <div className="echolog-row">
          <Button onClick={onRefresh} disabled={busy}>
            Retry metadata read
          </Button>
        </div>
      </Panel>
    )
  }
  if (!sidecar) {
    return (
      <Panel title="Object detail">
        <p className="m-muted">Select a tracked object to read its sidecar from ECHOLOG.</p>
      </Panel>
    )
  }

  const scan = scanWords(sidecar.scan)
  const retention = retentionWords(sidecar, nowMs)
  const remaining = grant ? grantRemainingSeconds(grant.expires_at, nowMs) : 0

  return (
    <Panel
      title="Object detail"
      subtitle={<code className="m-mono">{sidecar.object_key}</code>}
      actions={
        <Button size="sm" onClick={onRefresh} disabled={busy}>
          Refresh
        </Button>
      }
    >
      <div className="echolog-stats">
        <Stat label="Filename" value={sidecar.filename} />
        <Stat label="SHA-256 digest" value={<code className="m-mono">{sidecar.digest}</code>} />
        <Stat label="Size" value={formatBytes(sidecar.size)} />
        <Stat label="MIME type" value={sidecar.content_type} />
        <Stat label="Uploader" value={sidecar.uploader} />
        <Stat label="Created" value={sidecar.created_at} />
      </div>
      <div className="echolog-pills">
        <Pill label={scan.label} tone={scan.tone} />
        <Pill label={retention.label} tone={retention.tone} />
        <Pill label={sidecar.legal_hold ? 'legal hold: on — deletion refused' : 'legal hold: off'} tone={sidecar.legal_hold ? 'hot' : 'night'} />
      </div>
      <p className="m-muted">
        Retention and legal hold are set at ingest; this console can neither add nor lift a hold after the object exists.
      </p>

      <div className="echolog-row">
        <Button onClick={onRequestGrant} disabled={busy}>
          Request download grant
        </Button>
        {grant ? (
          remaining > 0 ? (
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
          Short-lived grant valid for {formatCountdown(remaining)} (until {grant.expires_at}). The console never embeds a long-lived URL.
        </Alert>
      ) : null}

      <div className="echolog-row">
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
