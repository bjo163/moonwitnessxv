import { useState, type ReactNode } from 'react'
import { Alert, Button, Field, Panel, SelectInput, TextInput, Toggle } from '@moonwitness/moonui'
import { uploadObject, sha256Hex, ApiError } from '../lib/api.js'
import type { ObjectRef, UploadPhase } from '../types.js'

/** MIME allow-list documented in docs/architecture/ECHOLOG.md; the server re-enforces it. */
export const DEFAULT_CONTENT_TYPES = [
  'application/pdf',
  'application/zip',
  'audio/flac',
  'audio/mpeg',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
]

export interface ConfirmRequest {
  title: string
  objectKey: string
  detail: ReactNode
  confirmLabel: string
}

const PHASE_WORDS: Record<UploadPhase, string> = {
  idle: 'no upload started',
  queued: 'queued — waiting to verify',
  verifying: 'verifying — hashing and streaming to ECHOLOG',
  committed: 'committed — object is final and immutable',
  failed: 'failed — nothing was stored from that attempt',
}

export function EchologUploadPanel({
  token,
  onCommitted,
  askConfirm,
}: {
  token: string
  onCommitted: (ref: ObjectRef) => void
  askConfirm: (request: ConfirmRequest) => Promise<boolean>
}): ReactNode {
  const [file, setFile] = useState<File | null>(null)
  const [contentType, setContentType] = useState<string>(DEFAULT_CONTENT_TYPES[0] ?? 'application/pdf')
  const [retentionUntil, setRetentionUntil] = useState('')
  const [legalHold, setLegalHold] = useState(false)
  const [phase, setPhase] = useState<UploadPhase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [committedKey, setCommittedKey] = useState<string | null>(null)

  const pendingObjectKey = file ? `sha256/<digest of ${file.name}>` : 'sha256/<digest of the chosen file>'

  async function toggleLegalHold(checked: boolean): Promise<void> {
    if (!checked) {
      setLegalHold(false)
      return
    }
    const confirmed = await askConfirm({
      title: 'Confirm legal hold on upload',
      objectKey: pendingObjectKey,
      detail: 'Legal hold makes this object undeletable for every consumer until an administrator lifts it. Deletion attempts will be refused with 409.',
      confirmLabel: 'Apply legal hold',
    })
    setLegalHold(confirmed)
  }

  async function startUpload(): Promise<void> {
    if (!file) return
    setError(null)
    setCommittedKey(null)
    setPhase('queued')
    try {
      setPhase('verifying')
      const bytes = await file.arrayBuffer()
      const digest = await sha256Hex(bytes)
      const sidecar = await uploadObject(
        {
          bytes,
          contentType,
          filename: file.name,
          retentionUntil: retentionUntil ? new Date(retentionUntil).toISOString() : null,
          legalHold,
        },
        token,
      )
      if (sidecar.digest !== digest) {
        setPhase('failed')
        setError(`ECHOLOG stored a different digest than computed locally (${sidecar.digest} vs ${digest}). Treat this upload as unverified.`)
        return
      }
      setPhase('committed')
      setCommittedKey(sidecar.object_key)
      onCommitted({ object_key: sidecar.object_key, digest: sidecar.digest, size: sidecar.size, content_type: sidecar.content_type })
    } catch (cause) {
      setPhase('failed')
      setError(cause instanceof ApiError ? cause.message : 'Upload failed: the transport dropped the request.')
    }
  }

  return (
    <Panel title="Upload object" subtitle="A partially written upload is never an object until ECHOLOG verifies it.">
      <div className="echolog-upload-state" aria-live="polite">
        State: <strong>{PHASE_WORDS[phase]}</strong>
      </div>
      <Field label="File" htmlFor="echolog-file">
        <input
          id="echolog-file"
          type="file"
          className="m-input"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </Field>
      <Field label="Content type" htmlFor="echolog-content-type" hint="The server enforces its allow-list and answers 415 for anything else.">
        <SelectInput
          id="echolog-content-type"
          value={contentType}
          options={DEFAULT_CONTENT_TYPES.map((value) => ({ value, label: value }))}
          onChange={(event) => setContentType(event.target.value)}
        />
      </Field>
      <Field label="Retention deadline (optional)" htmlFor="echolog-retention">
        <TextInput
          id="echolog-retention"
          type="datetime-local"
          value={retentionUntil}
          onChange={(event) => setRetentionUntil(event.target.value)}
        />
      </Field>
      <Toggle
        label="Apply legal hold at ingest (requires confirmation)"
        checked={legalHold}
        onChange={(event) => void toggleLegalHold(event.target.checked)}
      />
      <div className="m-row">
        <Button variant="primary" onClick={() => void startUpload()} disabled={!file || !token || phase === 'queued' || phase === 'verifying'}>
          Upload
        </Button>
        {!token ? <span className="m-muted">An ARSY session token is required before uploading.</span> : null}
      </div>
      {committedKey ? (
        <Alert tone="ok">
          Committed as <code className="m-mono">{committedKey}</code>. The bytes are immutable.
        </Alert>
      ) : null}
      {error ? <Alert tone="hot">{error}</Alert> : null}
    </Panel>
  )
}
