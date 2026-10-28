import type { ReactNode } from 'react'
import { Badge, BrandLogo, Button, LiveDot, MoonAvatar, Tape } from '@moonwitness/moonui'
import { MtsTelemetryClock, triggerHaptic } from '@moonwitness/moonui/client'
import type { ChannelItem, CockpitTab, StartAllResult } from '../types'
import type { CockpitLocale, CockpitCopyCatalog } from '../lib/cockpit-copy'

export interface CockpitTopBarProps {
  clock: string
  uptime: number
  isPlaying: boolean
  currentChannel: ChannelItem
  prevChannel: () => void
  togglePlayPause: () => void
  nextChannel: () => void
  isMuted: boolean
  setIsMuted: (fn: (prev: boolean) => boolean) => void
  volume: number
  setVolume: (v: number) => void
  setActiveTab: (t: CockpitTab) => void
  startAll: () => Promise<void>
  isStartingAll: boolean
  startAllSummary: StartAllResult | null
  stopAll: () => Promise<void>
  freePorts: () => Promise<void>
  isFreeingPorts: boolean
  crtShader: boolean
  setCrtShader: (fn: (prev: boolean) => boolean) => void
  progressPercent?: number | null
  locale: CockpitLocale
  setLocale: (loc: CockpitLocale) => void
  copy: CockpitCopyCatalog
  onOpenHelp: () => void
}

export function CockpitTopBar({
  clock,
  uptime,
  isPlaying,
  currentChannel,
  prevChannel,
  togglePlayPause,
  nextChannel,
  isMuted,
  setIsMuted,
  volume,
  setVolume,
  setActiveTab,
  startAll,
  isStartingAll,
  startAllSummary,
  stopAll,
  freePorts,
  isFreeingPorts,
  crtShader,
  setCrtShader,
  progressPercent,
  locale,
  setLocale,
  copy,
  onOpenHelp,
}: CockpitTopBarProps): ReactNode {
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
          SYS CLOCK: <strong style={{ color: 'var(--fg)' }}>{clock}</strong>
        </div>
        <div>
          UPTIME: <strong style={{ color: 'var(--fg)' }}>{uptime}s</strong>
        </div>
        <div>
          STATUS: <LiveDot state="live" /> <strong style={{ color: 'var(--ok)' }}>SUPERVISED</strong>
        </div>
        <div>
          TODO:{' '}
          <strong style={{ color: progressPercent == null ? 'var(--muted)' : 'var(--cyan)' }}>
            {progressPercent == null ? '—' : `${String(progressPercent)}%`}
          </strong>
        </div>
      </div>

      {/* Global Media & Station Controller Pill */}
      <div
        className="cockpit-rack"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--surface-2)',
          padding: '4px 10px',
          borderRadius: 6,
          border: '1px solid var(--chalk-dim)',
          maxWidth: 440,
        }}
      >
        <LiveDot state={isPlaying ? 'live' : 'connecting'} />
        <Badge
          tone={
            currentChannel.type === 'bgm'
              ? 'pink'
              : currentChannel.type === 'iptv'
              ? 'accent'
              : 'cyan'
          }
        >
          {currentChannel.type.toUpperCase()}
        </Badge>

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 130,
          }}
          title={`${currentChannel.name} (${currentChannel.genre})`}
        >
          {currentChannel.icon} {currentChannel.name}
        </span>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Button
            variant="ghost"
            size="sm"
            style={{ padding: '2px 5px', fontSize: 10, height: 22 }}
            onClick={prevChannel}
            title={copy.shortcutChannel}
          >
            ‹
          </Button>
          <Button
            variant={isPlaying ? 'danger' : 'primary'}
            size="sm"
            style={{ padding: '2px 8px', fontSize: 10, height: 22 }}
            onClick={togglePlayPause}
            title={isPlaying ? copy.quickPlayerPause : copy.quickPlayerPlay}
          >
            {isPlaying ? '■' : '▶'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            style={{ padding: '2px 5px', fontSize: 10, height: 22 }}
            onClick={nextChannel}
            title={copy.shortcutChannel}
          >
            ›
          </Button>
          <Button
            variant="ghost"
            size="sm"
            style={{ padding: '2px 5px', fontSize: 10, height: 22 }}
            onClick={() => setIsMuted((prev) => !prev)}
            title={isMuted ? copy.quickPlayerUnmute : copy.quickPlayerMute}
          >
            {isMuted ? 'MUTE' : 'VOL'}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{
              width: 45,
              height: 4,
              cursor: 'pointer',
              accentColor: 'var(--cyan)',
            }}
            title={copy.quickPlayerVolume}
          />
          <Button
            variant="paper"
            size="sm"
            style={{ padding: '2px 6px', fontSize: 10, height: 22 }}
            onClick={() => setActiveTab('media')}
            title={copy.tabMedia}
          >
            RACK
          </Button>
        </div>
      </div>

      {/* Global Dev Actions & Locale Switcher */}
      <div className="cockpit-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {startAllSummary && startAllSummary.refused > 0 ? (
          <Badge tone="hot" title={copy.startAllRefused.replace('{count}', String(startAllSummary.refused))}>
            {copy.startAllRefused.replace('{count}', String(startAllSummary.refused))}
          </Badge>
        ) : null}
        <Button variant="primary" size="sm" disabled={isStartingAll} onClick={() => void startAll()}>
          {isStartingAll ? '…' : copy.startAll}
        </Button>
        <Button variant="danger" size="sm" onClick={() => void stopAll()}>
          {copy.stopAll}
        </Button>
        <Button
          variant="accent"
          size="sm"
          disabled={isFreeingPorts}
          onClick={() => void freePorts()}
        >
          {isFreeingPorts ? '...' : copy.freePorts}
        </Button>
        <Button
          variant={crtShader ? 'accent' : 'ghost'}
          size="sm"
          onClick={() => {
            triggerHaptic('toggle')
            setCrtShader((prev) => !prev)
          }}
          title={copy.crtFilter}
        >
          {crtShader ? copy.crtFilterActive : copy.crtFilter}
        </Button>

        {/* Accessible Language Switcher (M19-29) */}
        <div
          role="group"
          aria-label={copy.selectLanguage}
          onKeyDown={(event) => {
            // Preserve the native Space activation of buttons from the App-level media shortcut.
            if (event.code === 'Space') event.stopPropagation()
          }}
          style={{
            display: 'inline-flex',
            borderRadius: 4,
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            aria-pressed={locale === 'id'}
            onClick={() => {
              triggerHaptic('tap')
              setLocale('id')
            }}
            style={{
              padding: '3px 8px',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              background: locale === 'id' ? 'var(--cyan)' : 'var(--surface-2)',
              color: locale === 'id' ? 'var(--ink)' : 'var(--muted)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ID
          </button>
          <button
            type="button"
            aria-pressed={locale === 'en'}
            onClick={() => {
              triggerHaptic('tap')
              setLocale('en')
            }}
            style={{
              padding: '3px 8px',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              background: locale === 'en' ? 'var(--cyan)' : 'var(--surface-2)',
              color: locale === 'en' ? 'var(--ink)' : 'var(--muted)',
              border: 'none',
              borderLeft: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            EN
          </button>
        </div>

        {/* Help Operator Modal Button (M19-28) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenHelp}
          title={copy.shortcutHelp}
          style={{ minWidth: 26, padding: '0 6px', fontWeight: 900 }}
        >
          ?
        </Button>
      </div>
    </header>
  )
}
