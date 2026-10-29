'use client'

import { useEffect, useRef, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { Locale } from '@moonwitness/core'
import { Badge, Button, LiveDot, StationSeal } from '@moonwitness/moonui'
import {
  LivingBackdrop,
  AnalogTuner,
  AudioVisualizer,
  triggerHaptic,
  getOrCreateDspRack,
  DSP_PRESETS,
  type EqSettings,
  type TapeSettings,
  type RadioBand,
  type TunedStation,
} from '@moonwitness/moonui/client'
import { TimeShiftPlayer } from './TimeShiftPlayer'
import { clientDockLocale, dockHrefFor } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

/** A session shorter than this is a skip: nobody drifts into it by accident. */
const SKIP_AFTER_SECONDS = 30
const AMBIENT_FAILOVER_URL = 'https://ice2.somafm.com/dronezone-128-mp3'

/** Which transport fault the player is reporting; the wording comes from the locale catalogue. */
type StreamFault = 'statusStreamUnavailable' | 'statusStreamStall' | 'statusAutoplayBlocked'

export interface LiveMetaInfo {
  artist: string | null
  title: string
  stationName: string | null
}

/**
 * Resilient living audio player with ICY metadata sniffing,
 * procedural StationSeal heraldry, real-time frequency visualizer,
 * WebAudio 5-band EQ & Lo-Fi tape saturation rack, and zero-drop failover.
 */
export function Player({
  stationId,
  stationName,
  streamUrl,
  availableStations = [],
  locale,
}: {
  stationId: string
  stationName: string
  streamUrl: string
  availableStations?: Array<{ id: string; name: string; streamUrl: string; genre?: string | null; country?: string | null }>
  locale?: Locale
}): ReactNode {
  const [activeLocale, setActiveLocale] = useState<Locale>(() => locale ?? 'en')

  useEffect(() => {
    setActiveLocale(locale ?? clientDockLocale())
  }, [locale])

  const copy = getStatesCopy(activeLocale)

  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [beacon, setBeacon] = useState<'idle' | 'sent' | 'failed'>('idle')
  const [streamFault, setStreamFault] = useState<StreamFault | null>(null)
  const [isFailover, setIsFailover] = useState(false)
  const [liveMeta, setLiveMeta] = useState<LiveMetaInfo | null>(null)
  const startedAt = useRef<number | null>(null)
  const retryTimer = useRef<NodeJS.Timeout | null>(null)

  // WebAudio DSP Rack state
  const [dspOpen, setDspOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>('flat')
  const [eq, setEq] = useState<EqSettings>({ low: 0, lowMid: 0, mid: 0, highMid: 0, high: 0 })
  const [tape, setTape] = useState<TapeSettings>({ enabled: false, saturation: 0, hiss: 0, crackle: 0 })

  // Analog Shortwave Tuner state
  const [tunerOpen, setTunerOpen] = useState(false)
  const [tunerBand, setTunerBand] = useState<RadioBand>('FM')
  const [tunerFreq, setTunerFreq] = useState<number>(94.7)

  const tunedStations: TunedStation[] = useMemo(() => {
    const list = availableStations.length > 0
      ? availableStations
      : [{ id: stationId, name: stationName, streamUrl }]

    return list.map((st, idx) => {
      let hash = 0
      for (let i = 0; i < st.id.length; i++) {
        hash = (hash * 31 + st.id.charCodeAt(i)) >>> 0
      }
      const ratio = ((hash + idx * 67) % 1000) / 1000
      const bands: RadioBand[] = ['FM', 'SW1', 'SW2']
      const band = bands[idx % 3] ?? 'FM'
      let frequency: number
      if (band === 'FM') {
        frequency = Number((88.0 + ratio * 19.5).toFixed(1))
      } else if (band === 'SW1') {
        frequency = Number((3.5 + ratio * 3.8).toFixed(2))
      } else {
        frequency = Number((7.2 + ratio * 8.0).toFixed(2))
      }
      return {
        id: st.id,
        name: st.name,
        frequency,
        band,
        genre: st.genre ?? undefined,
      }
    })
  }, [availableStations, stationId, stationName, streamUrl])

  const activeSrc = isFailover ? AMBIENT_FAILOVER_URL : streamUrl

  const close = useCallback(async (reportFailure: boolean) => {
    const seconds = startedAt.current === null ? 0 : Math.round((Date.now() - startedAt.current) / 1000)
    startedAt.current = null
    if (seconds <= 0) return
    try {
      const response = await fetch('/api/listen', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          stationRef: stationId,
          event: seconds < SKIP_AFTER_SECONDS ? 'skip' : 'stop',
          seconds,
        }),
        keepalive: true,
      })
      if (!response.ok && reportFailure) setBeacon('failed')
    } catch {
      if (reportFailure) setBeacon('failed')
    }
  }, [stationId])

  const closeRef = useRef(close)
  closeRef.current = close

  useEffect(() => () => {
    if (retryTimer.current) clearTimeout(retryTimer.current)
    void closeRef.current(false)
  }, [])

  // Poll ICY live metadata while playing
  useEffect(() => {
    if (!playing || isFailover) return
    let active = true

    const fetchMeta = async () => {
      try {
        const res = await fetch(`/api/stations/${stationId}/live-meta`)
        if (res.ok && active) {
          const body = (await res.json()) as { ok: boolean; data?: LiveMetaInfo }
          if (body.ok && body.data) {
            setLiveMeta(body.data)
          }
        }
      } catch {
        /* quiet ignore: metadata polling is best-effort */
      }
    }

    void fetchMeta()
    const timer = setInterval(() => void fetchMeta(), 15_000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [playing, stationId, isFailover])

  const triggerFailover = useCallback(() => {
    triggerHaptic('alert')
    if (isFailover) {
      setStreamFault('statusStreamUnavailable')
      return
    }
    setIsFailover(true)
    setStreamFault('statusStreamStall')

    // Attempt recovery back to primary stream in 8 seconds
    if (retryTimer.current) clearTimeout(retryTimer.current)
    retryTimer.current = setTimeout(() => {
      setIsFailover(false)
      setStreamFault(null)
    }, 8_000)
  }, [isFailover])

  const toggle = async () => {
    triggerHaptic('switch')
    const element = audio.current
    if (!element) return
    if (playing) {
      element.pause()
      setPlaying(false)
      setIsFailover(false)
      await close(true)
      return
    }
    try {
      await element.play()
      setPlaying(true)
      setStreamFault(null)
      startedAt.current = Date.now()

      // Ensure DSP rack is attached and running
      const rack = getOrCreateDspRack(element)
      if (rack) {
        rack.setEq(eq)
        rack.setTape(tape)
      }

      const response = await fetch('/api/listen', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ stationRef: stationId, event: 'start' }),
      })
      setBeacon(response.ok ? 'sent' : 'failed')
    } catch (err) {
      startedAt.current = null
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setStreamFault('statusAutoplayBlocked')
      } else {
        triggerFailover()
      }
    }
  }

  const handleApplyPreset = (presetId: string) => {
    const p = DSP_PRESETS.find((x) => x.id === presetId)
    if (!p) return
    triggerHaptic('switch')
    setSelectedPreset(presetId)
    setEq(p.eq)
    setTape(p.tape)
    if (audio.current) {
      const rack = getOrCreateDspRack(audio.current)
      rack?.applyPreset(presetId)
    }
  }

  const handleUpdateEqBand = (band: keyof EqSettings, value: number) => {
    const next = { ...eq, [band]: value }
    setEq(next)
    if (audio.current) {
      const rack = getOrCreateDspRack(audio.current)
      rack?.setEq(next)
    }
  }

  const handleToggleTape = () => {
    triggerHaptic('switch')
    const nextTape = { ...tape, enabled: !tape.enabled }
    setTape(nextTape)
    if (audio.current) {
      const rack = getOrCreateDspRack(audio.current)
      rack?.setTape(nextTape)
    }
  }

  return (
    <LivingBackdrop audioElement={audio.current} active={playing} className="rounded-lg">
      <div className="dk-player" style={{ position: 'relative', overflow: 'hidden' }}>
        <audio
          ref={audio}
          src={activeSrc}
          preload="none"
          crossOrigin="anonymous"
          onEnded={() => void close(true)}
          onPause={() => void close(true)}
          onError={() => triggerFailover()}
        />

        <div className="m-row" style={{ gap: 14, alignItems: 'center', width: '100%' }}>
          {/* Procedural Heraldic Station Seal */}
          <StationSeal stationId={stationId} name={stationName} size={44} />

          <Button
            type="button"
            variant={playing ? 'primary' : 'accent'}
            size="md"
            onClick={() => void toggle()}
            aria-pressed={playing}
          >
            {playing ? copy.playerStop : copy.playerPlay}
          </Button>

          <div className="m-col" style={{ gap: 4, flex: 1, minWidth: 200 }}>
            <div className="m-row" style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <LiveDot on={playing} />
              <strong style={{ letterSpacing: '0.04em' }}>{stationName}</strong>
              {isFailover ? (
                <span role="status" aria-live="polite">
                  <Badge tone="hot">{copy.statusFailoverAmbient}</Badge>
                </span>
              ) : liveMeta?.title && liveMeta.title !== stationName ? (
                <span role="status" aria-live="polite">
                  <Badge tone="cyan">
                    {copy.statusOnAir}: {liveMeta.artist ? `${liveMeta.artist} - ` : ''}{liveMeta.title}
                  </Badge>
                </span>
              ) : (
                <span
                  role={streamFault || beacon === 'failed' ? 'alert' : 'status'}
                  aria-live={streamFault || beacon === 'failed' ? 'assertive' : 'polite'}
                >
                  <Badge tone={streamFault || beacon === 'failed' ? 'hot' : beacon === 'sent' ? 'ok' : 'cyan'}>
                    {streamFault
                      ? `${copy[streamFault]} · ${copy.statusLoggingPaused}`
                      : beacon === 'sent'
                        ? copy.statusBeaconSent
                        : beacon === 'failed'
                          ? copy.statusBeaconFailed
                          : copy.statusStreamLive}
                  </Badge>
                </span>
              )}
            </div>

            {/* Phosphor frequency spectrum */}
            <div style={{ width: '100%', maxWidth: 360, opacity: playing ? 0.9 : 0.35, transition: 'opacity 0.3s ease' }}>
              <AudioVisualizer
                audioElement={audio.current}
                active={playing}
                height={20}
                barCount={24}
                color="#00d4ff"
                accentColor="#ff007a"
              />
            </div>

            {/* 3-Minute Zero-Drop Circular Buffer Timeshift */}
            <div style={{ width: '100%', maxWidth: 360, marginTop: 4 }}>
              <TimeShiftPlayer stationId={stationId} isPlaying={playing} audioRef={audio} />
            </div>
          </div>

          {/* DSP FX Rack & SW Tuner Controls */}
          <div className="m-col" style={{ alignItems: 'flex-end', gap: 6 }}>
            <div className="m-row" style={{ gap: 6 }}>
              <Button
                type="button"
                variant={tunerOpen ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {
                  triggerHaptic('switch')
                  setTunerOpen(!tunerOpen)
                }}
                title={copy.controlTunerHint}
              >
                {copy.controlTuner} {tunerOpen ? '▼' : '▲'}
              </Button>
              <Button
                type="button"
                variant={tape.enabled ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {
                  triggerHaptic('switch')
                  setDspOpen(!dspOpen)
                }}
                title={copy.controlDspHint}
              >
                {copy.controlDsp} {tape.enabled ? '● TAPE' : ''}
              </Button>
            </div>
          </div>
        </div>

        {/* Analog Shortwave & Broadcast Frequency Tuner Drawer */}
        {tunerOpen ? (
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid var(--border)',
            }}
          >
            <AnalogTuner
              band={tunerBand}
              frequency={tunerFreq}
              onBandChange={setTunerBand}
              onFrequencyChange={setTunerFreq}
              stations={tunedStations}
              onSelectStation={(st) => {
                if (st.id !== stationId) {
                  window.location.assign(dockHrefFor(clientDockLocale())(`/stations/${st.id}`))
                }
              }}
              showSMeter={true}
              signalStrength={playing ? 80 : 14}
            />
          </div>
        ) : null}

        {/* DSP Acoustic Conditioner Drawer */}
        {dspOpen ? (
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div className="m-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cyan)', letterSpacing: '0.04em' }}>
                {copy.controlAcousticConditioner}
              </span>
              <div className="m-row" style={{ gap: 6 }}>
                <Button
                  type="button"
                  variant={tape.enabled ? 'primary' : 'paper'}
                  size="sm"
                  onClick={handleToggleTape}
                >
                  {tape.enabled ? copy.controlTapeWarmthOn : copy.controlTapeWarmthOff}
                </Button>
              </div>
            </div>

            {/* Presets */}
            <div className="m-row" style={{ gap: 6, flexWrap: 'wrap' }}>
              {DSP_PRESETS.map((p) => (
                <Button
                  key={p.id}
                  type="button"
                  variant={selectedPreset === p.id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleApplyPreset(p.id)}
                >
                  {p.name}
                </Button>
              ))}
            </div>

            {/* 5-Band Equalizer Sliders */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, textAlign: 'center' }}>
              {(['low', 'lowMid', 'mid', 'highMid', 'high'] as const).map((band) => {
                const labels: Record<string, string> = {
                  low: '60 Hz',
                  lowMid: '250 Hz',
                  mid: '1 kHz',
                  highMid: '4 kHz',
                  high: '12 kHz',
                }
                const val = eq[band]
                return (
                  <div key={band} className="m-col" style={{ gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                      {labels[band]}
                    </span>
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={0.5}
                      value={val}
                      onChange={(e) => handleUpdateEqBand(band, parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--cyan)' }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--fg)', fontFamily: 'monospace' }}>
                      {val > 0 ? `+${val}` : val} dB
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </LivingBackdrop>
  )
}
