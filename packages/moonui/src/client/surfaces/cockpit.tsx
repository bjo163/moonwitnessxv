'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Badge, type BadgeTone } from '../../layout.js'
import { LiveDot } from '../../data.js'
import { Button, LocaleToggleGroup } from '../../form.js'
import { BrandLogo, Tape } from '../../zine.js'
import { MoonAvatar } from '../../avatar/index.js'
import { AnalogTuner, type RadioBand, type TunedStation } from '../analog-tuner.js'
import { MtsTelemetryClock } from '../mts-clock.js'
import { triggerHaptic } from '../haptics.js'

/** Strings arrive resolved; MoonUI never imports an application catalog. */
type SurfaceCopy = Readonly<Record<string, string>>

/** Every word the bar can show, named so a missing label is a type error. */
export interface CockpitTopBarCopy extends SurfaceCopy {
  brandTitle: string
  brandSubtitle: string
  telemetrySysClock: string
  telemetryUptime: string
  telemetryStatus: string
  telemetryTodo: string
  supervised: string
  quickPlayerPlay: string
  quickPlayerPause: string
  quickPlayerMute: string
  quickPlayerUnmute: string
  quickPlayerVolume: string
  muteButton: string
  volumeButton: string
  rackButton: string
  tabMedia: string
  startAllRefused: string
  startAll: string
  stopAll: string
  freePorts: string
  crtFilter: string
  crtFilterActive: string
  selectLanguage: string
  shortcutChannel: string
  shortcutHelp: string
}

/**
 * Cockpit tuner (ADR-0017). The frequency/band derivation stays with the
 * surface; MoonUI owns the tuner state and the analog dial.
 */
export function CockpitTunerSection({
  stations,
  activeIndex,
  isPlaying,
  onSelectStation,
}: {
  stations: TunedStation[]
  activeIndex: number
  isPlaying: boolean
  onSelectStation: (station: TunedStation) => void
}): ReactNode {
  const tunedStations = useMemo(() => stations, [stations])
  const activeTuned = tunedStations[activeIndex]
  const [band, setBand] = useState<RadioBand>(activeTuned?.band ?? 'FM')
  const [frequency, setFrequency] = useState<number>(activeTuned?.frequency ?? 94.7)

  // Keep tuner aligned when the active channel changes externally
  useEffect(() => {
    if (activeTuned) {
      setBand(activeTuned.band)
      setFrequency(activeTuned.frequency)
    }
  }, [activeTuned])

  return (
    <div style={{ width: '100%', maxWidth: 520, margin: '8px auto 0 auto' }}>
      <AnalogTuner
        band={band}
        frequency={frequency}
        onBandChange={setBand}
        onFrequencyChange={setFrequency}
        stations={tunedStations}
        onSelectStation={onSelectStation}
        showSMeter={true}
        signalStrength={isPlaying ? 84 : 12}
      />
    </div>
  )
}

export interface CockpitRackChannel {
  /** `bgm | radio | iptv`; the tone below is the only place it is read. */
  type: string
  name: string
  genre: string
  icon: string
}

export interface CockpitTopBarProps {
  clock: string
  uptime: number
  isPlaying: boolean
  currentChannel: CockpitRackChannel
  prevChannel: () => void
  togglePlayPause: () => void
  nextChannel: () => void
  isMuted: boolean
  toggleMuted: () => void
  volume: number
  setVolume: (volume: number) => void
  /** The bar offers a way to the media tab; which tab that is stays the app's call. */
  openMediaTab: () => void
  /** The view never awaits a control action; the caller may still return one. */
  startAll: () => void | Promise<void>
  isStartingAll: boolean
  startAllSummary: { refused: number } | null
  stopAll: () => void | Promise<void>
  freePorts: () => void | Promise<void>
  isFreeingPorts: boolean
  crtShader: boolean
  toggleCrtShader: () => void
  progressPercent: number | null
  locale: string
  localeOptions: Array<{ value: string; label: string }>
  setLocale: (locale: string) => void
  copy: CockpitTopBarCopy
  onOpenHelp: () => void
}

/**
 * Cockpit's supervisory bar (ADR-0017): brand, telemetry, the station rack and
 * the dev actions. It was `apps/cockpit/client/components/CockpitTopBar.tsx`,
 * where the language pair was two raw `<button>`s and every other value was an
 * inline style — the rack, the volume slider and the telemetry roles now live in
 * `moon.css`, and the language pair is the shared `LocaleToggleGroup`.
 *
 * No word is decided here: `copy` carries the labels, and the app decides which
 * tab "RACK" opens.
 */
export function CockpitTopBar({
  clock,
  uptime,
  isPlaying,
  currentChannel,
  prevChannel,
  togglePlayPause,
  nextChannel,
  isMuted,
  toggleMuted,
  volume,
  setVolume,
  openMediaTab,
  startAll,
  isStartingAll,
  startAllSummary,
  stopAll,
  freePorts,
  isFreeingPorts,
  crtShader,
  toggleCrtShader,
  progressPercent,
  locale,
  localeOptions,
  setLocale,
  copy,
  onOpenHelp,
}: CockpitTopBarProps): ReactNode {
  const channelTone: BadgeTone =
    currentChannel.type === 'bgm' ? 'pink' : currentChannel.type === 'iptv' ? 'accent' : 'cyan'

  return (
    <header className="cockpit-topbar">
      <div className="cockpit-brand">
        <BrandLogo size="sm" />
        <MoonAvatar seed="cockpit-supervisor" variant="crown" size={32} />
        <div className="cockpit-title">
          <span>{copy.brandTitle}</span>
          <Tape tone="accent">{copy.brandSubtitle}</Tape>
        </div>
      </div>

      <div className="cockpit-telemetry">
        <MtsTelemetryClock compact />
        <div>
          {copy.telemetrySysClock}: <strong className="cockpit-telemetry-value">{clock}</strong>
        </div>
        <div>
          {copy.telemetryUptime}: <strong className="cockpit-telemetry-value">{uptime}s</strong>
        </div>
        <div>
          {copy.telemetryStatus}: <LiveDot state="live" />{' '}
          <strong className="cockpit-telemetry-value" data-tone="ok">
            {copy.supervised}
          </strong>
        </div>
        <div>
          {copy.telemetryTodo}:{' '}
          <strong className="cockpit-telemetry-value" data-tone={progressPercent == null ? 'muted' : 'cyan'}>
            {progressPercent == null ? '—' : `${String(progressPercent)}%`}
          </strong>
        </div>
      </div>

      {/* Global media and station controller */}
      <div className="cockpit-rack">
        <LiveDot state={isPlaying ? 'live' : 'connecting'} />
        <Badge tone={channelTone}>{currentChannel.type.toUpperCase()}</Badge>
        <span className="cockpit-rack-channel" title={`${currentChannel.name} (${currentChannel.genre})`}>
          {currentChannel.icon} {currentChannel.name}
        </span>
        <div className="cockpit-rack-controls">
          <Button className="cockpit-rack-btn" variant="ghost" size="sm" onClick={prevChannel} title={copy.shortcutChannel}>
            ‹
          </Button>
          <Button
            className="cockpit-rack-btn cockpit-rack-btn-wide"
            variant={isPlaying ? 'danger' : 'primary'}
            size="sm"
            onClick={togglePlayPause}
            title={isPlaying ? copy.quickPlayerPause : copy.quickPlayerPlay}
          >
            {isPlaying ? '■' : '▶'}
          </Button>
          <Button className="cockpit-rack-btn" variant="ghost" size="sm" onClick={nextChannel} title={copy.shortcutChannel}>
            ›
          </Button>
          <Button
            className="cockpit-rack-btn"
            variant="ghost"
            size="sm"
            onClick={toggleMuted}
            title={isMuted ? copy.quickPlayerUnmute : copy.quickPlayerMute}
          >
            {isMuted ? copy.muteButton : copy.volumeButton}
          </Button>
          <input
            className="cockpit-rack-volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(event) => setVolume(parseFloat(event.target.value))}
            title={copy.quickPlayerVolume}
            aria-label={copy.quickPlayerVolume}
          />
          <Button
            className="cockpit-rack-btn cockpit-rack-btn-wide"
            variant="paper"
            size="sm"
            onClick={openMediaTab}
            title={copy.tabMedia}
          >
            {copy.rackButton}
          </Button>
        </div>
      </div>

      {/* Dev actions and the language choice */}
      <div className="cockpit-actions">
        {startAllSummary && startAllSummary.refused > 0 ? (
          <Badge tone="hot" title={copy.startAllRefused.replace('{count}', String(startAllSummary.refused))}>
            {copy.startAllRefused.replace('{count}', String(startAllSummary.refused))}
          </Badge>
        ) : null}
        <Button variant="primary" size="sm" disabled={isStartingAll} onClick={startAll}>
          {isStartingAll ? '…' : copy.startAll}
        </Button>
        <Button variant="danger" size="sm" onClick={stopAll}>
          {copy.stopAll}
        </Button>
        <Button variant="accent" size="sm" disabled={isFreeingPorts} onClick={freePorts}>
          {isFreeingPorts ? '...' : copy.freePorts}
        </Button>
        <Button
          variant={crtShader ? 'accent' : 'ghost'}
          size="sm"
          onClick={() => {
            triggerHaptic('switch')
            toggleCrtShader()
          }}
          title={copy.crtFilter}
        >
          {crtShader ? copy.crtFilterActive : copy.crtFilter}
        </Button>

        <LocaleToggleGroup
          label={copy.selectLanguage}
          value={locale}
          options={localeOptions}
          onChange={setLocale}
        />

        <Button className="cockpit-help-btn" variant="ghost" size="sm" onClick={onOpenHelp} title={copy.shortcutHelp}>
          ?
        </Button>
      </div>
    </header>
  )
}
