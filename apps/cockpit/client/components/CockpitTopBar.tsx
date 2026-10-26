import type { ReactNode } from 'react'
import { Badge, BrandLogo, Button, LiveDot, MoonAvatar, Tape } from '@moonwitness/moonui'
import { MtsTelemetryClock, triggerHaptic } from '@moonwitness/moonui/client'
import type { ChannelItem, CockpitTab } from '../types'

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
  stopAll: () => Promise<void>
  freePorts: () => Promise<void>
  isFreeingPorts: boolean
  crtShader: boolean
  setCrtShader: (fn: (prev: boolean) => boolean) => void
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
  stopAll,
  freePorts,
  isFreeingPorts,
  crtShader,
  setCrtShader,
}: CockpitTopBarProps): ReactNode {
  return (
    <header className="cockpit-topbar">
      <div className="cockpit-brand">
        <BrandLogo size="sm" />
        <MoonAvatar seed="cockpit-supervisor" variant="crown" size={32} />
        <div className="cockpit-title">
          <span>MOONDECK</span>
          <Tape tone="accent">DESKTOP COCKPIT</Tape>
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
          STATUS: <LiveDot state="live" /> <strong style={{ color: 'var(--ok)' }}>NOMINAL</strong>
        </div>
      </div>

      {/* Global Media & Station Controller Pill */}
      <div
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
            title="Previous Channel"
          >
            Prev
          </Button>
          <Button
            variant={isPlaying ? 'danger' : 'primary'}
            size="sm"
            style={{ padding: '2px 8px', fontSize: 10, height: 22 }}
            onClick={togglePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            style={{ padding: '2px 5px', fontSize: 10, height: 22 }}
            onClick={nextChannel}
            title="Next Channel"
          >
            Next
          </Button>
          <Button
            variant="ghost"
            size="sm"
            style={{ padding: '2px 5px', fontSize: 10, height: 22 }}
            onClick={() => setIsMuted((prev) => !prev)}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? 'Muted' : 'Vol'}
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
            title="Media Volume"
          />
          <Button
            variant="paper"
            size="sm"
            style={{ padding: '2px 6px', fontSize: 10, height: 22 }}
            onClick={() => setActiveTab('media')}
            title="Open Media & IPTV Station Tab"
          >
            Player
          </Button>
        </div>
      </div>

      {/* Global Dev Actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button variant="primary" size="sm" onClick={() => void startAll()}>
          Start All
        </Button>
        <Button variant="danger" size="sm" onClick={() => void stopAll()}>
          Stop All
        </Button>
        <Button
          variant="accent"
          size="sm"
          disabled={isFreeingPorts}
          onClick={() => void freePorts()}
        >
          {isFreeingPorts ? 'Freeing...' : 'Free Ports'}
        </Button>
        <Button
          variant={crtShader ? 'accent' : 'ghost'}
          size="sm"
          onClick={() => {
            triggerHaptic('toggle')
            setCrtShader((prev) => !prev)
          }}
          title="Toggle Retro CRT Phosphor Scanline Shader"
        >
          {crtShader ? 'CRT: ON' : 'CRT: OFF'}
        </Button>
      </div>
    </header>
  )
}
