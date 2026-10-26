import { useState, useEffect, useRef, useMemo, type ReactNode } from 'react'
import Hls from 'hls.js'
import { Tabs, type TabItem } from '@moonwitness/moonui'
import { triggerHaptic } from '@moonwitness/moonui/client'
import { CockpitTopBar } from './components/CockpitTopBar'
import { CockpitSidebar } from './components/CockpitSidebar'
import { CockpitLogsView } from './components/CockpitLogsView'
import { CockpitPreviewView } from './components/CockpitPreviewView'
import { CockpitMediaView } from './components/CockpitMediaView'
import { CockpitPortsView } from './components/CockpitPortsView'
import { CockpitLedgerView } from './components/CockpitLedgerView'
import { CockpitProgressView } from './components/CockpitProgressView'
import { CockpitFooter } from './components/CockpitFooter'
import { useCockpitSync } from './hooks/useCockpitSync'
import { useCockpitActions } from './hooks/useCockpitActions'
import { useTodoProgress } from './hooks/useTodoProgress'
import type {
  ChannelItem,
  ChannelMediaType,
  CockpitTab,
} from './types'

export const DEFAULT_CHANNELS: ChannelItem[] = [
  {
    id: 'bgm-levelup',
    name: 'Level Up // Chiptune Arcade',
    type: 'bgm',
    streamUrl: '/bgm.mp3',
    genre: 'Chiptune / 8-Bit',
    icon: 'BG',
    country: 'MOON',
    description: 'Official Moondeck Mission Cockpit energetic arcade soundtrack',
  },
  {
    id: 'iptv-dw-news',
    name: 'DW News English HD',
    type: 'iptv',
    streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    genre: 'News / Current Affairs',
    icon: 'DW',
    country: 'DE',
    description: 'Deutsche Welle international 24/7 news television stream',
  },
  {
    id: 'iptv-redbull',
    name: 'Red Bull TV Live',
    type: 'iptv',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    genre: 'Sports / Gaming / Action',
    icon: 'RB',
    country: 'AT',
    description: 'Extreme sports, gaming, and action culture live television',
  },
  {
    id: 'iptv-mux-animation',
    name: 'Retro Animation 24/7',
    type: 'iptv',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    genre: 'Animation / Visuals',
    icon: 'AN',
    country: 'NL',
    description: 'Continuous Open Source 3D animation visual stream',
  },
  {
    id: 'iptv-tvri-nasional',
    name: 'TVRI Nasional Live',
    type: 'iptv',
    streamUrl: 'https://tvri.b-cdn.net/tvri/nasional/live/playlist.m3u8',
    genre: 'Indonesian Television',
    icon: '🇮🇩',
    country: 'ID',
    description: 'Televisi Republik Indonesia national public broadcasting live stream',
  },
  {
    id: 'radio-prambors',
    name: 'Prambors FM Jakarta',
    type: 'radio',
    streamUrl: 'https://stream.rcs.revma.com/h77wwp48kxcwv',
    genre: 'Pop / Hits',
    icon: 'PR',
    country: 'ID',
    description: 'Hit music station Indonesia #1 for youth',
  },
  {
    id: 'radio-genfm',
    name: 'Gen FM 98.7 Jakarta',
    type: 'radio',
    streamUrl: 'https://ic.mari.co.id:8443/genfm',
    genre: 'Indonesian Pop',
    icon: 'GF',
    country: 'ID',
    description: 'Suara Musik Indonesia hits & culture',
  },
  {
    id: 'radio-somafm-groove',
    name: 'SomaFM: Groove Salad',
    type: 'radio',
    streamUrl: 'https://ice2.somafm.com/groovesalad-128-mp3',
    genre: 'Ambient / Chillout',
    icon: 'SG',
    country: 'US',
    description: 'A nicely chilled plate of ambient beats and cyber grooves',
  },
  {
    id: 'radio-somafm-secret',
    name: 'SomaFM: Secret Agent',
    type: 'radio',
    streamUrl: 'https://ice2.somafm.com/secretagent-128-mp3',
    genre: 'Spy / Cyberpunk',
    icon: 'SA',
    country: 'US',
    description: 'The soundtrack for your stylish, mysterious hacking day',
  },
  {
    id: 'radio-kexp',
    name: 'KEXP 90.3 Seattle',
    type: 'radio',
    streamUrl: 'https://kexp.streamguys1.com/kexp160.mp3',
    genre: 'Indie / Eclectic',
    icon: 'KX',
    country: 'US',
    description: 'Where the music matters — legendary independent live radio',
  },
]

export function App(): ReactNode {
  const [activeTab, setActiveTab] = useState<CockpitTab>('logs')
  const [filterTag, setFilterTag] = useState<string>('all')
  const [showErrorsOnly, setShowErrorsOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [previewUrl, setPreviewUrl] = useState('http://127.0.0.1:3001')
  const [errorLines, setErrorLines] = useState<string[]>([])
  const [crtShader, setCrtShader] = useState(false)

  // Media Player State
  const [channels, setChannels] = useState<ChannelItem[]>(DEFAULT_CHANNELS)
  const [activeChannelIndex, setActiveChannelIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.4)
  const [channelCategory, setChannelCategory] = useState<'all' | 'bgm' | 'radio' | 'iptv'>('all')
  const [channelSearch, setChannelSearch] = useState('')
  const [nowPlayingTrack, setNowPlayingTrack] = useState<{ artist: string | null; title: string } | null>(null)

  // Custom channel input form
  const [customName, setCustomName] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [customType, setCustomType] = useState<ChannelMediaType>('iptv')
  const [customGenre, setCustomGenre] = useState('')

  const previewFrameRef = useRef<HTMLIFrameElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)

  const volumeRef = useRef(volume)
  volumeRef.current = volume
  const isMutedRef = useRef(isMuted)
  isMutedRef.current = isMuted

  const currentChannel = channels[activeChannelIndex] ?? DEFAULT_CHANNELS[0]

  // Data sync hook
  const { config, serviceStates, setServiceStates, logs, setLogs, clock, uptime } = useCockpitSync(setChannels)
  const progress = useTodoProgress()

  // Actions hook
  const {
    isFreeingPorts,
    addCustomChannel,
    controlService,
    startAll,
    stopAll,
    freePorts,
    loadLedger,
    clearLedger,
  } = useCockpitActions({
    customName,
    customUrl,
    customType,
    customGenre,
    channels,
    setChannels,
    setActiveChannelIndex,
    setCustomName,
    setCustomUrl,
    setCustomGenre,
    setServiceStates,
    setErrorLines,
  })

  // Playback Engine: Synchronizes current channel with HTML5 Audio / Video + HLS.js
  useEffect(() => {
    const ch = channels[activeChannelIndex] ?? DEFAULT_CHANNELS[0]
    if (!ch) return

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (ch.type === 'iptv') {
      if (audioRef.current) {
        audioRef.current.pause()
      }

      const video = videoRef.current
      if (video) {
        video.volume = volumeRef.current
        video.muted = isMutedRef.current

        if (ch.streamUrl.includes('.m3u8')) {
          if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true })
            hls.loadSource(ch.streamUrl)
            hls.attachMedia(video)
            hlsRef.current = hls
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              void video.play().then(() => setIsPlaying(true)).catch(() => {})
            })
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = ch.streamUrl
            void video.play().then(() => setIsPlaying(true)).catch(() => {})
          }
        } else {
          video.src = ch.streamUrl
          void video.play().then(() => setIsPlaying(true)).catch(() => {})
        }
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause()
      }

      if (!audioRef.current) {
        audioRef.current = new Audio()
      }
      const audio = audioRef.current
      audio.src = ch.streamUrl
      audio.loop = ch.type === 'bgm'
      audio.volume = volumeRef.current
      audio.muted = isMutedRef.current

      const startAudio = () => {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            const unlock = () => {
              void audio.play().then(() => setIsPlaying(true)).catch(() => {})
              window.removeEventListener('click', unlock)
              window.removeEventListener('keydown', unlock)
            }
            window.addEventListener('click', unlock, { once: true })
            window.addEventListener('keydown', unlock, { once: true })
          })
      }

      startAudio()
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [activeChannelIndex, channels])

  // Volume & Mute Sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      audioRef.current.muted = isMuted
    }
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = isMuted
    }
  }, [volume, isMuted])

  const togglePlayPause = () => {
    triggerHaptic('switch')
    const ch = currentChannel
    if (ch.type === 'iptv') {
      const v = videoRef.current
      if (!v) return
      if (isPlaying) {
        v.pause()
        setIsPlaying(false)
      } else {
        void v.play().then(() => setIsPlaying(true))
      }
    } else {
      const a = audioRef.current
      if (!a) return
      if (isPlaying) {
        a.pause()
        setIsPlaying(false)
      } else {
        void a.play().then(() => setIsPlaying(true))
      }
    }
  }

  const selectChannel = (index: number) => {
    triggerHaptic('tuning')
    setActiveChannelIndex(index)
    setIsPlaying(true)
  }

  const nextChannel = () => {
    const nextIdx = (activeChannelIndex + 1) % channels.length
    selectChannel(nextIdx)
  }

  const prevChannel = () => {
    const prevIdx = (activeChannelIndex - 1 + channels.length) % channels.length
    selectChannel(prevIdx)
  }

  const togglePip = async () => {
    if (!videoRef.current || !document.pictureInPictureEnabled) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await videoRef.current.requestPictureInPicture()
      }
    } catch {
      /* PiP not permitted */
    }
  }

  // Poll ICY metadata
  useEffect(() => {
    if (!isPlaying || currentChannel.type !== 'radio') {
      setNowPlayingTrack(null)
      return
    }

    let active = true
    const fetchMeta = async () => {
      try {
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(currentChannel.streamUrl)}`)
        if (res.ok && active) {
          const data = (await res.json()) as { artist: string | null; title: string }
          if (data?.title) setNowPlayingTrack(data)
        }
      } catch {
        /* quiet ignore */
      }
    }

    void fetchMeta()
    const timer = setInterval(() => void fetchMeta(), 15_000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [isPlaying, currentChannel.streamUrl, currentChannel.type])

  // Keydown Ref Hook
  const keyActionRef = useRef({
    togglePlayPause,
    prevChannel,
    nextChannel,
    togglePip,
    setIsMuted,
    setActiveTab,
  })
  keyActionRef.current = {
    togglePlayPause,
    prevChannel,
    nextChannel,
    togglePip,
    setIsMuted,
    setActiveTab,
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      const actions = keyActionRef.current
      if (e.code === 'Space') {
        e.preventDefault()
        actions.togglePlayPause()
      } else if (e.key === 'm' || e.key === 'M') {
        actions.setIsMuted((prev) => !prev)
      } else if (e.key === '[') {
        actions.prevChannel()
      } else if (e.key === ']') {
        actions.nextChannel()
      } else if (e.key === 'p' || e.key === 'P') {
        void actions.togglePip()
      } else if (e.key === '1') {
        actions.setActiveTab('logs')
      } else if (e.key === '2') {
        actions.setActiveTab('preview')
      } else if (e.key === '3') {
        actions.setActiveTab('media')
      } else if (e.key === '4') {
        actions.setActiveTab('ledger')
      } else if (e.key === '5') {
        actions.setActiveTab('ports')
      } else if (e.key === '6') {
        actions.setActiveTab('progress')
      } else if (e.key === '`' || e.key === '~') {
        triggerHaptic('toggle')
        actions.setActiveTab((prev) => (prev === 'logs' ? 'media' : 'logs'))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const openPreview = (url: string) => {
    setPreviewUrl(url)
    setActiveTab('preview')
    if (previewFrameRef.current) {
      previewFrameRef.current.src = url
    }
  }

  const formatUptime = (secs: number) => {
    if (secs < 60) return `${secs}s`
    const m = Math.floor(secs / 60)
    const s = secs % 60
    if (m < 60) return `${m}m ${s}s`
    const h = Math.floor(m / 60)
    return `${h}h ${m % 60}m`
  }

  const filteredLogs = useMemo(() => {
    return logs.map((l) => `[${l.timestamp}] [${l.service.toUpperCase()}] ${l.message}`).filter((msg) => {
      if (filterTag !== 'all' && !msg.includes(`[${filterTag.toUpperCase()}]`)) return false
      if (showErrorsOnly && !msg.toLowerCase().includes('error')) return false
      if (searchTerm && !msg.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
  }, [logs, filterTag, showErrorsOnly, searchTerm])

  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      if (channelCategory !== 'all' && ch.type !== channelCategory) return false
      if (channelSearch) {
        const q = channelSearch.toLowerCase()
        return ch.name.toLowerCase().includes(q) || ch.genre.toLowerCase().includes(q)
      }
      return true
    })
  }, [channels, channelCategory, channelSearch])

  const cockpitTabs: TabItem[] = useMemo(() => [
    { id: 'logs', label: 'Terminal & Logs', tone: 'cyan' },
    { id: 'preview', label: 'In-App Web Preview', tone: 'accent' },
    { id: 'media', label: 'Media & IPTV Player', count: channels.length, tone: 'pink' },
    { id: 'ledger', label: 'Error Ledger', count: errorLines.length > 0 ? errorLines.length : undefined, tone: 'accent' },
    { id: 'ports', label: 'Network & Ports', tone: 'cyan' },
    { id: 'progress', label: 'Mission Progress', count: progress.payload?.open, tone: 'ok' },
  ], [channels.length, errorLines.length, progress.payload?.open])

  return (
    <div className="cockpit-shell">
      <CockpitTopBar
        clock={clock}
        uptime={uptime}
        isPlaying={isPlaying}
        currentChannel={currentChannel}
        prevChannel={prevChannel}
        togglePlayPause={togglePlayPause}
        nextChannel={nextChannel}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        volume={volume}
        setVolume={setVolume}
        setActiveTab={setActiveTab}
        startAll={startAll}
        stopAll={stopAll}
        freePorts={freePorts}
        isFreeingPorts={isFreeingPorts}
        crtShader={crtShader}
        setCrtShader={setCrtShader}
        progressPercent={progress.payload?.percent ?? null}
      />

      <div className="cockpit-body">
        <CockpitSidebar
          config={config}
          serviceStates={serviceStates}
          controlService={controlService}
          openPreview={openPreview}
          formatUptime={formatUptime}
        />

        <main className="cockpit-main">
          <div className="cockpit-tabs-bar">
            <Tabs
              items={cockpitTabs}
              activeId={activeTab}
              onChange={(id) => {
                setActiveTab(id as CockpitTab)
                if (id === 'ledger') void loadLedger()
              }}
            />
          </div>

          {activeTab === 'logs' ? (
            <CockpitLogsView
              config={config}
              filterTag={filterTag}
              setFilterTag={setFilterTag}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              showErrorsOnly={showErrorsOnly}
              setShowErrorsOnly={setShowErrorsOnly}
              autoScroll={autoScroll}
              setAutoScroll={setAutoScroll}
              setLogs={setLogs}
              filteredLogs={filteredLogs}
            />
          ) : null}

          {activeTab === 'preview' ? (
            <CockpitPreviewView
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
              openPreview={openPreview}
              previewFrameRef={previewFrameRef}
            />
          ) : null}

          {activeTab === 'media' ? (
            <CockpitMediaView
              currentChannel={currentChannel}
              channels={channels}
              activeChannelIndex={activeChannelIndex}
              isPlaying={isPlaying}
              togglePlayPause={togglePlayPause}
              prevChannel={prevChannel}
              nextChannel={nextChannel}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              volume={volume}
              setVolume={setVolume}
              videoRef={videoRef}
              audioRef={audioRef}
              togglePip={togglePip}
              nowPlayingTrack={nowPlayingTrack}
              channelCategory={channelCategory}
              setChannelCategory={setChannelCategory}
              channelSearch={channelSearch}
              setChannelSearch={setChannelSearch}
              filteredChannels={filteredChannels}
              selectChannel={selectChannel}
              customName={customName}
              setCustomName={setCustomName}
              customUrl={customUrl}
              setCustomUrl={setCustomUrl}
              customType={customType}
              setCustomType={setCustomType}
              customGenre={customGenre}
              setCustomGenre={setCustomGenre}
              addCustomChannel={addCustomChannel}
            />
          ) : null}

          {activeTab === 'ledger' ? (
            <CockpitLedgerView
              errorLines={errorLines}
              loadLedger={loadLedger}
              clearLedger={clearLedger}
            />
          ) : null}

          {activeTab === 'ports' ? (
            <CockpitPortsView
              serviceStates={serviceStates}
              openPreview={openPreview}
            />
          ) : null}

          {activeTab === 'progress' ? (
            <CockpitProgressView
              payload={progress.payload}
              rows={progress.rows}
              rowsMatched={progress.rowsMatched}
              rowsLoading={progress.rowsLoading}
              filters={progress.filters}
              setFilters={progress.setFilters}
              live={progress.live}
              error={progress.error}
              lastReceived={progress.lastReceived}
              netClosedSinceOpen={progress.netClosedSinceOpen}
            />
          ) : null}
        </main>
      </div>

      <CockpitFooter crtShader={crtShader} />
    </div>
  )
}
