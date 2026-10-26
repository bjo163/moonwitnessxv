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
import type { CockpitCopyCatalog } from '../lib/cockpit-copy'

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
  copy: CockpitCopyCatalog
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
  copy,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StationSeal
              name={currentChannel.name}
              type={currentChannel.type}
              genre={currentChannel.genre}
              size={28}
            />
            <div>
              <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--fg)', display: 'block' }}>
                {currentChannel.name}
              </span>
              <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                {currentChannel.genre} {currentChannel.country ? `// ${currentChannel.country}` : ''}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {nowPlayingTrack ? (
              <Badge tone="cyan">
                ♪ {nowPlayingTrack.artist ? `${nowPlayingTrack.artist} - ` : ''}
                {nowPlayingTrack.title}
              </Badge>
            ) : null}
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
        </div>

        {/* Video / Visualizer Display Screen */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {currentChannel.type === 'iptv' ? (
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              playsInline
              controls={false}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, #181424 0%, #08060d 100%)',
                position: 'relative',
              }}
            >
              <StationSeal
                name={currentChannel.name}
                type={currentChannel.type}
                genre={currentChannel.genre}
                size={140}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 20,
                  width: '80%',
                  height: 60,
                }}
              >
                <AudioVisualizer
                  analyser={null}
                  isPlaying={isPlaying}
                  bars={32}
                  height={60}
                  color="cyan"
                />
              </div>
            </div>
          )}

          {/* Hidden Audio Tag for BGM/Radio Audio Streams */}
          <audio ref={audioRef} playsInline style={{ display: 'none' }} />
        </div>

        {/* Shortwave Analog Dial Tuner Section */}
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--surface-2)',
            borderTop: '1px solid var(--chalk-dim)',
          }}
        >
          <CockpitTunerSection
            channels={channels}
            activeChannelIndex={activeChannelIndex}
            isPlaying={isPlaying}
            selectChannel={selectChannel}
          />
        </div>

        {/* Hardware Action & Control Deck */}
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
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Button variant="ghost" size="sm" onClick={prevChannel} title="Previous Channel ([)">
              Prev
            </Button>
            <Button
              variant={isPlaying ? 'danger' : 'primary'}
              size="sm"
              onClick={togglePlayPause}
              style={{ minWidth: 80, fontWeight: 800 }}
              title="Play/Pause (Space)"
            >
              {isPlaying ? '■ STOP' : '▶ PLAY'}
            </Button>
            <Button variant="ghost" size="sm" onClick={nextChannel} title="Next Channel (])">
              Next
            </Button>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted((prev) => !prev)}
              title="Toggle Audio Mute (M)"
            >
              {isMuted ? 'Muted' : 'Volume'}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{
                width: 90,
                height: 6,
                accentColor: 'var(--cyan)',
                cursor: 'pointer',
              }}
            />
            {currentChannel.type === 'iptv' ? (
              <Button variant="paper" size="sm" onClick={() => void togglePip()} title="Picture-in-Picture (P)">
                PiP
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Right Column: Station/Channel Selector List & Custom Stream Input */}
      <div
        style={{
          flex: 0.9,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface-2)',
          overflow: 'hidden',
        }}
      >
        {/* Filter Pills & Channel Search */}
        <div
          style={{
            padding: '12px 14px 8px 14px',
            borderBottom: '1px solid var(--chalk-dim)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tape tone="accent">{copy.sectionTitle}</Tape>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {filteredChannels.length} / {channels.length}
            </span>
          </div>

          <PillGroup label="Kind:">
            <Pill
              label={copy.categoryAll}
              active={channelCategory === 'all'}
              tone="cyan"
              onClick={() => setChannelCategory('all')}
            />
            <Pill
              label={copy.categoryBgm}
              active={channelCategory === 'bgm'}
              tone="pink"
              onClick={() => setChannelCategory('bgm')}
            />
            <Pill
              label={copy.categoryRadio}
              active={channelCategory === 'radio'}
              tone="cyan"
              onClick={() => setChannelCategory('radio')}
            />
            <Pill
              label={copy.categoryIptv}
              active={channelCategory === 'iptv'}
              tone="accent"
              onClick={() => setChannelCategory('iptv')}
            />
          </PillGroup>

          <TextInput
            placeholder="Search stations, genre, or country..."
            value={channelSearch}
            onChange={(e) => setChannelSearch(e.target.value)}
            style={{ height: 28, fontSize: 11 }}
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
            + {copy.addCustomChannel}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <TextInput
              placeholder={copy.channelNamePlaceholder}
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
              placeholder={copy.channelUrlPlaceholder}
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              style={{ height: 30, fontSize: 12, flex: 2 }}
              required
            />
            <TextInput
              placeholder={copy.channelGenrePlaceholder}
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              style={{ height: 30, fontSize: 12, flex: 1 }}
            />
            <Button variant="primary" size="sm" type="submit" style={{ height: 30 }}>
              {copy.btnAddChannel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
