'use client'

import { useState, useTransition, useEffect, type ReactNode } from 'react'
import type { PublicLiveTransmissionsOutput } from '@moonwitness/moonql-client'
import type { Locale } from '@moonwitness/core'
import { clientDockLocale } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'
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
  stations: StationOption[]
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
  const [transmissions, setTransmissions] = useState<PublicLiveTransmissionsOutput[]>(initialTransmissions)
  const [message, setMessage] = useState('')
  const [pseudonym, setPseudonym] = useState('')
  const [selectedStation, setSelectedStation] = useState('')
  const [statusMsg, setStatusMsg] = useState<{ tone: 'ok' | 'hot'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleTransmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    triggerHaptic('switch')
    playUiSound('relay')

    startTransition(async () => {
      try {
        const res = await fetch('/api/denpa/transmit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message.trim(),
            pseudonym: pseudonym.trim() || undefined,
            stationRef: selectedStation || undefined,
          }),
        })

        const body = (await res.json()) as { ok: boolean; data?: PublicLiveTransmissionsOutput; error?: string }

        if (res.ok && body.ok) {
          playUiSound('toggle')
          triggerHaptic('switch')
          setStatusMsg({ tone: 'ok', text: copy.formDenpaSuccess })
          setMessage('')
          if (body.data) {
            const newRow = body.data
            setTransmissions((prev) => [newRow, ...prev])
          }
        } else {
          triggerHaptic('alert')
          playUiSound('alert')
          setStatusMsg({ tone: 'hot', text: body.error || copy.formDenpaError })
        }
      } catch (err) {
        triggerHaptic('alert')
        playUiSound('alert')
        setStatusMsg({ tone: 'hot', text: err instanceof Error ? err.message : copy.formDenpaFailure })
      }
    })
  }

  const stationSelectOptions = [
    { value: '', label: copy.formDenpaGlobal },
    ...stations.map((st) => ({ value: st.id, label: st.name })),
  ]

  return (
    <div className="m-stack" style={{ gap: 24 }}>
      {statusMsg ? (
        <Alert tone={statusMsg.tone}>
          {statusMsg.text}
        </Alert>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Transmitter Deck */}
        <Panel
          title="DENPA Transceiver (電波)"
          subtitle="Inbound shortwave message broadcast deck · Broadcast directly into live DJ queues"
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
              <span>{copy.formDenpaEncrypted}</span>
              <span>{message.length} / 500</span>
            </div>

            <div className="m-row" style={{ gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <Field label={copy.formDenpaPseudonym} htmlFor="denpa-pseudo">
                  <TextInput
                    id="denpa-pseudo"
                    value={pseudonym}
                    onChange={(e) => setPseudonym(e.target.value)}
                    placeholder={copy.formDenpaPseudonymPlaceholder}
                  />
                </Field>
              </div>

              <div style={{ flex: 1, minWidth: 160 }}>
                <Field label={copy.formDenpaTargetStation} htmlFor="denpa-station">
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
          title="On-Air Frequency Feed"
          subtitle="Real-time public shortwave telemetry captured across the network"
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
                        {t.broadcastAt ? new Date(t.broadcastAt).toLocaleTimeString() : 'RECENT'}
                      </span>
                    }
                  />
                  <CardBody>
                    <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.4, color: 'var(--fg)' }}>
                      {t.message}
                    </p>
                    <div className="m-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <Badge tone="cyan">ON-AIR</Badge>
                      {t.stationRef ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          Station: {t.stationRef}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Global</span>
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
