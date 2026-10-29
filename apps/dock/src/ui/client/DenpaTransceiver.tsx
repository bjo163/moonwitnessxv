'use client'

import { useState, useTransition, useEffect, type ReactNode } from 'react'
import type { PublicLiveTransmissionsOutput } from '@moonwitness/moonql-client'
import type { Locale } from '@moonwitness/core'
import { clientDockLocale } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'
import { getDenpaCopy } from '@/ui/copy/denpa-copy'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  LiveDot,
  Panel,
  SelectInput,
  Textarea,
  TextInput,
} from '@moonwitness/moonui'
import { playUiSound, triggerHaptic } from '@moonwitness/moonui/client'

export interface StationOption {
  id: string
  name: string
}

export interface DenpaTransceiverProps {
  initialTransmissions: PublicLiveTransmissionsOutput[]
  stations: StationOption[] | null
  locale?: Locale
}

export function DenpaTransceiver({ initialTransmissions, stations, locale }: DenpaTransceiverProps): ReactNode {
  const [activeLocale, setActiveLocale] = useState<Locale>(() => locale ?? clientDockLocale())

  useEffect(() => {
    if (locale) {
      setActiveLocale(locale)
    } else {
      setActiveLocale(clientDockLocale())
    }
  }, [locale])

  const copy = getStatesCopy(activeLocale)
  const dCopy = getDenpaCopy(activeLocale)
  const [transmissions, setTransmissions] = useState<PublicLiveTransmissionsOutput[]>(initialTransmissions)
  const [message, setMessage] = useState('')
  const [pseudonym, setPseudonym] = useState('')
  const [selectedStation, setSelectedStation] = useState('')
  const [statusMsg, setStatusMsg] = useState<{ tone: 'ok' | 'hot'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleTransmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPending) return

    const trimmedMessage = message.trim()
    if (!trimmedMessage) {
      setStatusMsg({ tone: 'hot', text: copy.formDenpaErrorEmpty })
      return
    }
    if (message.length > 500) {
      setStatusMsg({ tone: 'hot', text: copy.formDenpaErrorTooLong })
      return
    }
    if (pseudonym.trim().length > 50) {
      setStatusMsg({ tone: 'hot', text: copy.formDenpaErrorPseudonymTooLong })
      return
    }

    triggerHaptic('switch')
    playUiSound('relay')

    startTransition(async () => {
      const refuse = (text: string) => {
        triggerHaptic('alert')
        playUiSound('alert')
        setStatusMsg({ tone: 'hot', text })
      }

      try {
        const res = await fetch('/api/denpa/transmit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmedMessage,
            pseudonym: pseudonym.trim() || undefined,
            stationRef: selectedStation || undefined,
          }),
        })

        // A proxy or outage page is not JSON. Reading it defensively keeps the deck
        // from presenting an unparseable answer as a recorded transmission.
        const body = (await res.json().catch(() => null)) as {
          ok?: boolean
          data?: PublicLiveTransmissionsOutput
        } | null

        if (res.ok && body?.ok && body.data) {
          playUiSound('toggle')
          triggerHaptic('switch')
          setStatusMsg({ tone: 'ok', text: copy.formDenpaSuccess })
          setMessage('')
          const newRow = body.data
          setTransmissions((prev) => [newRow, ...prev])
          return
        }

        // The hub's own message text is an internal string, so the deck states the
        // outcome by status code instead of echoing it.
        if (res.status === 400) refuse(copy.formDenpaRejected)
        else if (res.status === 401 || res.status === 403) refuse(copy.formDenpaDenied)
        else if (res.status === 429) refuse(copy.formDenpaRateLimited)
        else if (res.status >= 500) refuse(copy.formDenpaServerDown)
        else refuse(copy.formDenpaUnknown)
      } catch {
        refuse(typeof navigator !== 'undefined' && navigator.onLine === false
          ? copy.formDenpaOffline
          : copy.formDenpaServerDown)
      }
    })
  }

  const stationSelectOptions = [
    { value: '', label: copy.formDenpaGlobal },
    ...(stations ?? []).map((st) => ({ value: st.id, label: st.name })),
  ]

  return (
    <div className="m-stack" style={{ gap: 24 }}>
      {statusMsg ? (
        <div
          role={statusMsg.tone === 'hot' ? 'alert' : 'status'}
          aria-live={statusMsg.tone === 'hot' ? 'assertive' : 'polite'}
        >
          <Alert tone={statusMsg.tone}>
            {statusMsg.text}
          </Alert>
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Transmitter Deck */}
        <Panel
          title={dCopy.pageTitle}
          subtitle={dCopy.transmitterSubtitle}
        >
          <form onSubmit={(e) => void handleTransmit(e)} className="m-stack" style={{ gap: 14 }}>
            <Field label={copy.formDenpaContent} htmlFor="denpa-msg">
              <Textarea
                id="denpa-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={copy.formDenpaPlaceholder}
                rows={4}
                maxLength={500}
                required
              />
            </Field>

            <div className="m-row" style={{ justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)' }}>
              <span>{copy.formDenpaPrivacyNotice}</span>
              <span aria-label={copy.formDenpaCharCounterAria}>{message.length} / 500</span>
            </div>

            <div className="m-row" style={{ gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <Field label={copy.formDenpaPseudonym} htmlFor="denpa-pseudo" hint={copy.formDenpaPseudonymHint}>
                  <TextInput
                    id="denpa-pseudo"
                    value={pseudonym}
                    onChange={(e) => setPseudonym(e.target.value)}
                    placeholder={copy.formDenpaPseudonymPlaceholder}
                  />
                </Field>
              </div>

              <div style={{ flex: 1, minWidth: 160 }}>
                <Field
                  label={copy.formDenpaTargetStation}
                  htmlFor="denpa-station"
                  hint={stations ? undefined : dCopy.stationSelectUnknownHint}
                >
                  <SelectInput
                    id="denpa-station"
                    options={stationSelectOptions}
                    value={selectedStation}
                    onChange={(e) => setSelectedStation(e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isPending || !message.trim()}
            >
              {isPending ? copy.formDenpaTransmitting : copy.formDenpaTransmit}
            </Button>
          </form>
        </Panel>

        {/* Live On-Air Monitor */}
        <Panel
          title={dCopy.feedTitle}
          subtitle={dCopy.feedSubtitle}
        >
          <div className="m-stack" style={{ gap: 12, maxHeight: 460, overflowY: 'auto' }}>
            {transmissions.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
                {copy.emptyDenpaTransmissions}
              </div>
            ) : (
              transmissions.map((t) => (
                <Card key={t.id} variant="paper">
                  <CardHeader
                    title={
                      <div className="m-row" style={{ gap: 8, alignItems: 'center' }}>
                        <LiveDot on={true} />
                        <strong style={{ fontSize: '0.9rem', color: 'var(--cyan)' }}>
                          {t.pseudonym}
                        </strong>
                      </div>
                    }
                    actions={
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                        {t.broadcastAt ? new Date(t.broadcastAt).toLocaleTimeString() : dCopy.feedRecent}
                      </span>
                    }
                  />
                  <CardBody>
                    <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.4, color: 'var(--fg)' }}>
                      {t.message}
                    </p>
                    <div className="m-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <Badge tone="cyan">{dCopy.feedOnAir}</Badge>
                      {t.stationRef ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          {dCopy.feedStation}: {t.stationRef}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{dCopy.feedGlobalNetwork}</span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}
