import type { ReactNode, RefObject } from 'react'
import {
  Badge,
  Button,
  Kbd,
  LiveDot,
  Pill,
  PillGroup,
  StationCard,
  StationSeal,
  Tape,
  TextInput,
} from '@moonwitness/moonui'
import { AudioVisualizer } from '@moonwitness/moonui/client'
import { CockpitTunerSection } from './CockpitTunerSection'
import type { ChannelItem, ChannelMediaType } from '../types'

export interface CockpitMediaViewProps {
  currentChannel: ChannelItem
  channels: ChannelItem[]
  activeChannelIndex: number
  isPlaying: boolean
  togglePlayPause: () => void
  prevChannel: () => void
  nextChannel: () => void
  isMuted: boolean
  setIsMuted: (fn: (prev: boolean) => boolean) => void
  volume: number
  setVolume: (v: number) => void
  videoRef: RefObject<HTMLVideoElement | null>
  audioRef: RefObject<HTMLAudioElement | null>
  togglePip: () => Promise<void>
  nowPlayingTrack: { artist: string | null; title: string } | null
  channelCategory: 'all' | 'bgm' | 'radio' | 'iptv'
  setChannelCategory: (c: 'all' | 'bgm' | 'radio' | 'iptv') => void
  channelSearch: string
  setChannelSearch: (s: string) => void
  filteredChannels: ChannelItem[]
  selectChannel: (index: number) => void
  customName: string
  setCustomName: (s: string) => void
  customUrl: string
  setCustomUrl: (s: string) => void
  customType: ChannelMediaType
  setCustomType: (t: ChannelMediaType) => void
  customGenre: string
  setCustomGenre: (s: string) => void
  addCustomChannel: (e: React.FormEvent) => Promise<void>
}

export function CockpitMediaView({
  currentChannel,
  channels,
  activeChannelIndex,
  isPlaying,
  togglePlayPause,
  prevChannel,
  nextChannel,
  isMuted,
  setIsMuted,
  volume,
  setVolume,
  videoRef,
  audioRef,
  togglePip,
  nowPlayingTrack,
  channelCategory,
  setChannelCategory,
  channelSearch,
  setChannelSearch,
  filteredChannels,
  selectChannel,
  customName,
  setCustomName,
  customUrl,
  setCustomUrl,
  customType,
  setCustomType,
  customGenre,
  setCustomGenre,
  addCustomChannel,
}: CockpitMediaViewProps): ReactNode {
  return (
    <div className="tab-content" style={{ display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
      {/* Left Screen Area: IPTV Video or Audio Visualizer */}
      <div
        style={{
          flex: 1.2,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--ink)',
          borderRight: '2px solid var(--chalk-dim)',
          overflow: 'hidden',
        }}
      >
        {/* Station Screen Header */}
        <div
          style={{
            height: 48,
            background: 'var(--surface)',
            borderBottom: '1px solid var(--chalk-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>{currentChannel.icon}</span>
            <strong style={{ fontSize: 14, color: 'var(--fg)' }}>{currentChannel.name}</strong>
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
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              GENRE: {currentChannel.genre}
            </span>
            <LiveDot state={isPlaying ? 'live' : 'down'} />
          </div>
        </div>

        {/* Main Screen: Video for IPTV, Oscilloscope Graphic for Audio/BGM */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--night)',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {/* IPTV Video Player */}
          <video
            ref={videoRef}
            playsInline
            controls
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: currentChannel.type === 'iptv' ? 'block' : 'none',
            }}
          />

          {/* Audio / BGM Visualizer Display */}
          {currentChannel.type !== 'iptv' ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: 24,
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                <StationSeal stationId={currentChannel.id} name={currentChannel.name} genre={currentChannel.genre} size={96} />
              </div>

              <div style={{ maxWidth: 450 }}>
                <h2 style={{ margin: '0 0 6px 0', color: 'var(--fg)', fontSize: 20 }}>
                  {currentChannel.name}
                </h2>
                <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>
                  {currentChannel.description || currentChannel.genre}
                </div>
                <Tape tone={currentChannel.type === 'bgm' ? 'pink' : 'cyan'}>
                  {isPlaying ? 'ON-AIR AUDIO STREAMING' : 'STREAM PAUSED'}
                </Tape>
                <div style={{ width: '100%', maxWidth: 380, margin: '12px auto 0 auto' }}>
                  <AudioVisualizer audioElement={audioRef.current} active={isPlaying} height={32} barCount={28} />
                </div>
                {nowPlayingTrack?.title ? (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      color: 'var(--cyan)',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(0, 212, 255, 0.08)',
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: '1px solid rgba(0, 212, 255, 0.2)',
                    }}
                  >
                    NOW PLAYING: {nowPlayingTrack.artist ? `${nowPlayingTrack.artist} - ` : ''}{nowPlayingTrack.title}
                  </div>
                ) : null}

                <CockpitTunerSection
                  channels={channels}
                  activeChannelIndex={activeChannelIndex}
                  isPlaying={isPlaying}
                  selectChannel={selectChannel}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Bottom Screen Bar */}
        <div
          style={{
            height: 52,
            background: 'var(--surface)',
            borderTop: '1px solid var(--chalk-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button variant="ghost" size="sm" onClick={prevChannel}>
              Previous
            </Button>
            <Button
              variant={isPlaying ? 'danger' : 'primary'}
              size="sm"
              onClick={togglePlayPause}
            >
              {isPlaying ? 'Pause' : 'Play Stream'}
            </Button>
            <Button variant="ghost" size="sm" onClick={nextChannel}>
              Next
            </Button>
            {currentChannel.type === 'iptv' ? (
              <Button variant="ghost" size="sm" onClick={() => void togglePip()}>
                PiP
              </Button>
            ) : null}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              VOL: {Math.round(volume * 100)}%
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: 80, accentColor: 'var(--cyan)' }}
            />
            <Button variant="ghost" size="sm" onClick={() => setIsMuted((prev) => !prev)}>
              {isMuted ? 'Muted' : 'Vol'}
            </Button>
          </div>
        </div>

        {/* Hotkey Indicator Strip */}
        <div
          style={{
            padding: '4px 16px',
            background: 'var(--panel)',
            borderTop: '1px solid var(--chalk-dim)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 10,
            color: 'var(--muted)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Kbd>Space</Kbd> Play/Pause</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Kbd>M</Kbd> Mute</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Kbd>[</Kbd><Kbd>]</Kbd> Prev/Next</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Kbd>P</Kbd> PiP</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Kbd>1-5</Kbd> Tabs</span>
        </div>
      </div>

      {/* Right Playlist & Station Catalog */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface)',
          overflow: 'hidden',
        }}
      >
        {/* Playlist Toolbar */}
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--chalk-dim)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, textTransform: 'uppercase' }}>
                Channel Directory
              </span>
              <Badge tone="cyan">{channels.length} TOTAL</Badge>
            </div>

            <PillGroup label="Type:">
              <Pill
                label="ALL"
                active={channelCategory === 'all'}
                tone="cyan"
                onClick={() => setChannelCategory('all')}
              />
              <Pill
                label="BGM"
                active={channelCategory === 'bgm'}
                tone="pink"
                onClick={() => setChannelCategory('bgm')}
              />
              <Pill
                label="RADIO"
                active={channelCategory === 'radio'}
                tone="cyan"
                onClick={() => setChannelCategory('radio')}
              />
              <Pill
                label="IPTV"
                active={channelCategory === 'iptv'}
                tone="accent"
                onClick={() => setChannelCategory('iptv')}
              />
            </PillGroup>
          </div>

          <TextInput
            placeholder="Search radio or IPTV channels..."
            value={channelSearch}
            onChange={(e) => setChannelSearch(e.target.value)}
            style={{ height: 32, fontSize: 12 }}
          />
        </div>

        {/* Stations List (Unified StationCard Primitive) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filteredChannels.map((ch) => {
            const originalIdx = channels.findIndex((c) => c.id === ch.id)
            const isCurrent = originalIdx === activeChannelIndex

            return (
              <StationCard
                key={ch.id}
                useSeal={true}
                id={ch.id}
                name={ch.name}
                type={ch.type}
                streamUrl={ch.streamUrl}
                genre={ch.genre}
                country={ch.country}
                icon={ch.icon}
                active={isCurrent}
                isPlaying={isCurrent && isPlaying}
                onSelect={() => selectChannel(originalIdx)}
                onTogglePlay={() => {
                  if (isCurrent) togglePlayPause()
                  else selectChannel(originalIdx)
                }}
              />
            )
          })}
        </div>

        {/* Add Custom Station / IPTV Stream Drawer */}
        <form
          onSubmit={(e) => void addCustomChannel(e)}
          style={{
            padding: 12,
            borderTop: '2px solid var(--chalk-dim)',
            background: 'var(--night)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)' }}>
            + Register Custom Radio / IPTV Stream
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <TextInput
              placeholder="Station/Channel Name..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              style={{ height: 30, fontSize: 12, flex: 1 }}
              required
            />
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value as ChannelMediaType)}
              style={{
                height: 30,
                background: 'var(--surface-2)',
                color: 'var(--fg)',
                border: '1px solid var(--chalk-dim)',
                borderRadius: 4,
                fontSize: 11,
                padding: '0 6px',
              }}
            >
              <option value="iptv">IPTV</option>
              <option value="radio">Radio</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <TextInput
              placeholder="Stream URL (m3u8, mp3, aac, mp4)..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              style={{ height: 30, fontSize: 12, flex: 2 }}
              required
            />
            <TextInput
              placeholder="Genre..."
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              style={{ height: 30, fontSize: 12, flex: 1 }}
            />
            <Button variant="primary" size="sm" type="submit" style={{ height: 30 }}>
              + Add
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
