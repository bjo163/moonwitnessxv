import { useState, useEffect, useRef, useMemo, useCallback, type ReactNode } from 'react'
import Hls from 'hls.js'
import {
  Button,
  CockpitFooter,
  CockpitLedgerView,
  CockpitLogsView,
  CockpitPortsView,
  CockpitPreviewView,
  CockpitSidebar,
  Tabs,
  type TabItem,
  type TerminalLine,
} from '@moonwitness/moonui'
import { AlertDialog, CockpitTopBar, KbdLegend, Modal, triggerHaptic } from '@moonwitness/moonui/client'
import { CockpitMediaView } from './components/CockpitMediaView'
import { CockpitProgressView } from './components/CockpitProgressView'
import { buildPortRows, previewShortcuts } from './lib/ports'
import { COCKPIT_LOCALE_OPTIONS, asCockpitLocale } from './lib/cockpit-copy'
import { useCockpitLocale } from './hooks/useCockpitLocale'
import { useCockpitSync } from './hooks/useCockpitSync'
import { useCockpitActions } from './hooks/useCockpitActions'
import { useTodoProgress } from './hooks/useTodoProgress'
import { useReducedMotion } from './hooks/useReducedMotion'
import {
  classifyPlayRejection,
  cycleChannelIndex,
  hlsErrorToken,
  isActiveStatus,
  mediaElementErrorToken,
  pipAvailability,
  planChannelPlayback,
  statusFromElementEvent,
  type MediaStatusCode,
} from './hooks/useMediaTransport'
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
  const { locale, setLocale, copy } = useCockpitLocale()
  const [activeTab, setActiveTab] = useState<CockpitTab>('logs')
  const [filterTag, setFilterTag] = useState<string>('all')
  const [showErrorsOnly, setShowErrorsOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [previewUrl, setPreviewUrl] = useState('')
  const [errorLines, setErrorLines] = useState<string[]>([])
  const [crtShader, setCrtShader] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
    isDestructive?: boolean
  } | null>(null)

  // Media Player State
  const [channels, setChannels] = useState<ChannelItem[]>(DEFAULT_CHANNELS)
  const [activeChannelIndex, setActiveChannelIndex] = useState(0)
  // The transport is a state machine, not a boolean: 'blocked', 'unsupported-hls'
  // and 'error' are all "not playing" but mean very different things, and a
  // monitoring surface must not collapse them into one word.
  const [transport, setTransport] = useState<{ code: MediaStatusCode; detail: string | null }>({
    code: 'stopped',
    detail: null,
  })
  const isPlaying = isActiveStatus(transport.code)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.4)
  const [channelCategory, setChannelCategory] = useState<'all' | 'bgm' | 'radio' | 'iptv'>('all')
  const [channelSearch, setChannelSearch] = useState('')
  const [nowPlayingTrack, setNowPlayingTrack] = useState<{ artist: string | null; title: string } | null>(null)
  // The <video> surface only exists while the media tab is mounted; IPTV must
  // (re)plan once it appears instead of silently doing nothing.
  const [videoSurface, setVideoSurface] = useState(false)

  // Custom channel input form
  const [customName, setCustomName] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [customType, setCustomType] = useState<ChannelMediaType>('iptv')
  const [customGenre, setCustomGenre] = useState('')

  const previewFrameRef = useRef<HTMLIFrameElement>(null)
  // One owner per surface. The audio element is created imperatively and never
  // rendered, so unmounting the media tab cannot orphan a playing stream.
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)

  const volumeRef = useRef(volume)
  volumeRef.current = volume
  const isMutedRef = useRef(isMuted)
  isMutedRef.current = isMuted
  // Copy must not restart playback when the operator switches locale.
  const copyRef = useRef(copy)
  copyRef.current = copy

  const currentChannel = channels[activeChannelIndex] ?? DEFAULT_CHANNELS[0]

  // The media tab mounts and unmounts the only <video>. Attaching through a
  // callback ref keeps one owner and re-plans playback the moment it appears.
  const _attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el
    setVideoSurface(Boolean(el))
  }, [])

  // Data sync hook
  const { config, serviceStates, setServiceStates, logs, setLogs, clock, uptime, portStatus, rackSource: _rackSource, progressPayload, progressLive } =
    useCockpitSync(setChannels)
  const progress = useTodoProgress({ progressPayload, progressLive })
  const _reducedMotion = useReducedMotion()

  // Actions hook
  const {
    isFreeingPorts,
    isStartingAll,
    startAllSummary,
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

  const requestStopAll = () => {
    setConfirmModal({
      isOpen: true,
      title: copy.stopAllTitle,
      description: copy.stopAllDesc,
      isDestructive: true,
      onConfirm: () => {
        setConfirmModal(null)
        void stopAll()
      },
    })
  }

  const requestFreePorts = () => {
    setConfirmModal({
      isOpen: true,
      title: copy.freePortsTitle,
      description: copy.freePortsDesc,
      isDestructive: true,
      onConfirm: () => {
        setConfirmModal(null)
        void freePorts()
      },
    })
  }

  // Playback Engine: maps the active channel onto exactly one media surface and
  // records the honest reason when it cannot. Every early exit sets a code —
  // the previous engine's missing branches left the UI showing "playing"
  // over a stream that was never started.
  useEffect(() => {
    const ch = channels[activeChannelIndex] ?? DEFAULT_CHANNELS[0]
    if (!ch) return

    let disposed = false
    let detachElement: (() => void) | null = null
    let unlock: (() => void) | null = null
    let hls: Hls | null = null

    const setStatus = (code: MediaStatusCode, detail: string | null = null) => {
      if (!disposed) setTransport({ code, detail })
    }

    // Releasing a surface stops it and drops its source; pausing alone leaves a
    // live stream buffering forever and the next channel racing it for output.
    const release = (el: HTMLMediaElement | null) => {
      if (!el) return
      el.pause()
      el.removeAttribute('src')
      el.load()
    }

    const cleanup = () => {
      disposed = true
      if (hls) {
        hls.destroy()
        hls = null
      }
      hlsRef.current = null
      if (detachElement) {
        detachElement()
        detachElement = null
      }
      if (unlock) {
        window.removeEventListener('click', unlock)
        window.removeEventListener('keydown', unlock)
        unlock = null
      }
    }

    const video = videoRef.current
    const isVideo = ch.type === 'iptv'

    if (isVideo) {
      release(audioRef.current)
    } else {
      release(video)
    }

    if (isVideo && !video) {
      // The media tab owns the only <video>; the top-bar rack still shows the
      // channel, so this has to be labelled instead of silently skipped.
      setStatus('no-video-surface', 'PLAN:AWAITING_VIDEO_SURFACE')
      return cleanup
    }

    const plan = planChannelPlayback(ch, {
      hlsSupported: Hls.isSupported(),
      nativeHls: Boolean(video?.canPlayType('application/vnd.apple.mpegurl')),
    })

    if (plan === 'unsupported-hls') {
      setStatus('unsupported-hls', 'PLAN:BOTH_HLS_PATHS_UNAVAILABLE')
      return cleanup
    }

    let el: HTMLMediaElement
    if (isVideo && video) {
      el = video
    } else {
      if (!audioRef.current) audioRef.current = new Audio()
      el = audioRef.current
    }

    el.loop = ch.type === 'bgm'
    el.volume = volumeRef.current
    el.muted = isMutedRef.current

    const onPlaying = () => setStatus(statusFromElementEvent('playing'))
    const onPause = () => setStatus(statusFromElementEvent('pause'))
    const onWaiting = () => setStatus(statusFromElementEvent('waiting'))
    const onEnded = () => setStatus(statusFromElementEvent('ended'))
    const onError = () => {
      const token = mediaElementErrorToken(el.error?.code)
      setStatus('error', token ? `MEDIA_ERROR:${token}` : 'MEDIA_ERROR:UNREPORTED')
    }

    el.addEventListener('playing', onPlaying)
    el.addEventListener('pause', onPause)
    el.addEventListener('waiting', onWaiting)
    el.addEventListener('ended', onEnded)
    el.addEventListener('error', onError)
    detachElement = () => {
      el.removeEventListener('playing', onPlaying)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('waiting', onWaiting)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('error', onError)
    }

    const requestPlay = () => {
      setStatus('loading')
      void el
        .play()
        .then(() => setStatus('playing'))
        .catch((err: unknown) => {
          const kind = classifyPlayRejection(err)
          if (kind === 'aborted') {
            // Superseded by a newer play/pause/src change: not a failure.
            setStatus('paused', 'PLAY_SUPERSEDED')
            return
          }
          if (kind !== 'blocked') {
            setStatus('error', 'PLAY_REJECTED')
            return
          }
          // Autoplay policy: say so, and arm exactly one gesture-driven retry.
          setStatus('blocked', 'PLAY_NOT_ALLOWED')
          unlock = () => {
            void el
              .play()
              .then(() => setStatus('playing'))
              .catch((retryErr: unknown) => {
                setStatus(classifyPlayRejection(retryErr) === 'blocked' ? 'blocked' : 'error', 'RETRY_REJECTED')
              })
            window.removeEventListener('click', unlock)
            window.removeEventListener('keydown', unlock)
            unlock = null
          }
          window.addEventListener('click', unlock, { once: true })
          window.addEventListener('keydown', unlock, { once: true })
        })
    }

    if (plan === 'iptv-hls') {
      const instance = new Hls({ enableWorker: true, lowLatencyMode: true })
      hls = instance
      hlsRef.current = instance
      instance.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('loading')
        void el
          .play()
          .then(() => setStatus('playing'))
          .catch((err: unknown) => {
            setStatus(classifyPlayRejection(err) === 'blocked' ? 'blocked' : 'error', 'PLAY_NOT_ALLOWED')
          })
      })
      instance.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return
        setStatus('error', `HLS_ERROR:${hlsErrorToken(data.details, true)}`)
      })
      instance.loadSource(ch.streamUrl)
      instance.attachMedia(el as HTMLVideoElement)
      setStatus('loading')
    } else {
      el.src = ch.streamUrl
      requestPlay()
    }

    return cleanup
  }, [activeChannelIndex, channels, videoSurface])

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
    // The element is the truth; the code is only its description.
    const el: HTMLMediaElement | null =
      currentChannel.type === 'iptv' ? videoRef.current : audioRef.current
    if (!el) {
      setTransport({
        code: currentChannel.type === 'iptv' ? 'no-video-surface' : 'stopped',
        detail: 'NO_SURFACE_MOUNTED',
      })
      return
    }
    if (!el.paused) {
      el.pause()
      setTransport({ code: 'paused', detail: null })
      return
    }
    setTransport({ code: 'loading', detail: null })
    void el
      .play()
      .then(() => setTransport({ code: 'playing', detail: null }))
      .catch((err: unknown) => {
        const kind = classifyPlayRejection(err)
        setTransport({
          code: kind === 'blocked' ? 'blocked' : kind === 'aborted' ? 'paused' : 'error',
          detail: kind === 'blocked' ? 'PLAY_NOT_ALLOWED' : kind === 'aborted' ? 'PLAY_SUPERSEDED' : 'PLAY_REJECTED',
        })
      })
  }

  const selectChannel = (index: number) => {
    if (index < 0 || index >= channels.length) return
    triggerHaptic('tuning')
    // Optimistically claiming PLAYING here used to hide the fact that a
    // rejected autoplay or an unsupported HLS URL had not started anything.
    setTransport({ code: 'loading', detail: null })
    setActiveChannelIndex(index)
  }

  const nextChannel = () => {
    selectChannel(cycleChannelIndex(activeChannelIndex, channels.length, 1))
  }

  const prevChannel = () => {
    selectChannel(cycleChannelIndex(activeChannelIndex, channels.length, -1))
  }

  const togglePip = async (): Promise<'ok' | 'unsupported' | 'no-surface' | 'failed'> => {
    const { enabled } = pipAvailability(typeof document === 'undefined' ? undefined : document)
    if (!enabled) return 'unsupported'
    const video = videoRef.current
    if (!video) return 'no-surface'
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        return 'ok'
      }
      await video.requestPictureInPicture()
      return 'ok'
    } catch {
      return 'failed'
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
      } else if (e.key === '?') {
        e.preventDefault()
        setIsHelpOpen(true)
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

  // Default the preview to the first service that exposes a URL, so the tab is
  // never left pointing at a hard-coded port that may not match /api/config.
  useEffect(() => {
    if (previewUrl || !config) return
    const first = config.services.find((s) => s.url)
    if (first?.url) setPreviewUrl(first.url)
  }, [config, previewUrl])

  const formatUptime = (secs: number) => {
    if (secs < 60) return `${secs}s`
    const m = Math.floor(secs / 60)
    const s = secs % 60
    if (m < 60) return `${m}m ${s}s`
    const h = Math.floor(m / 60)
    return `${h}h ${m % 60}m`
  }

  const logLines = useMemo<TerminalLine[]>(() => {
    return logs
      .filter((l) => {
        if (filterTag !== 'all' && l.tag !== filterTag) return false
        if (showErrorsOnly && l.level !== 'error') return false
        if (searchTerm && !l.message.toLowerCase().includes(searchTerm.toLowerCase())) return false
        return true
      })
      // TerminalViewer needs TerminalLine objects, not pre-formatted strings;
      // passing strings crashed the whole tree on the first streamed log line.
      .map((l) => ({
        id: l.id,
        timestamp: l.timestamp,
        tag: l.tag,
        level: l.level === 'warn' || l.level === 'error' ? l.level : 'info',
        message: l.message,
      }))
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
    { id: 'logs', label: copy.tabLogs, tone: 'cyan' },
    { id: 'preview', label: copy.tabPreview, tone: 'accent' },
    { id: 'media', label: copy.tabMedia, count: channels.length, tone: 'pink' },
    { id: 'ledger', label: copy.tabLedger, count: errorLines.length > 0 ? errorLines.length : undefined, tone: 'accent' },
    { id: 'ports', label: copy.tabPorts, tone: 'cyan' },
    { id: 'progress', label: copy.tabProgress, count: progress.payload?.open, tone: 'ok' },
  ], [
    copy.tabLogs,
    copy.tabPreview,
    copy.tabMedia,
    copy.tabLedger,
    copy.tabPorts,
    copy.tabProgress,
    channels.length,
    errorLines.length,
    progress.payload?.open,
  ])

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
        toggleMuted={() => setIsMuted((prev) => !prev)}
        volume={volume}
        setVolume={setVolume}
        openMediaTab={() => setActiveTab('media')}
        startAll={startAll}
        isStartingAll={isStartingAll}
        startAllSummary={startAllSummary}
        stopAll={async () => {
          requestStopAll()
        }}
        freePorts={async () => {
          requestFreePorts()
        }}
        isFreeingPorts={isFreeingPorts}
        crtShader={crtShader}
        toggleCrtShader={() => setCrtShader((prev) => !prev)}
        progressPercent={progress.payload?.percent ?? null}
        locale={locale}
        localeOptions={COCKPIT_LOCALE_OPTIONS}
        setLocale={(next) => setLocale(asCockpitLocale(next))}
        copy={copy}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <div className="cockpit-body">
        <CockpitSidebar
          services={config?.services ?? []}
          serviceStates={serviceStates}
          controlService={controlService}
          openPreview={openPreview}
          formatUptime={formatUptime}
          copy={copy}
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
              services={config?.services ?? []}
              filterTag={filterTag}
              setFilterTag={setFilterTag}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              showErrorsOnly={showErrorsOnly}
              setShowErrorsOnly={setShowErrorsOnly}
              autoScroll={autoScroll}
              setAutoScroll={setAutoScroll}
              onClearLogs={() => setLogs([])}
              logLines={logLines}
              copy={copy}
            />
          ) : null}

          {activeTab === 'preview' ? (
            <CockpitPreviewView
              shortcuts={previewShortcuts(config)}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
              openPreview={openPreview}
              frameRef={previewFrameRef}
              copy={copy}
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
              copy={copy}
            />
          ) : null}

          {activeTab === 'ledger' ? (
            <CockpitLedgerView
              errorLines={errorLines}
              loadLedger={loadLedger}
              clearLedger={clearLedger}
              copy={copy}
            />
          ) : null}

          {activeTab === 'ports' ? (
            <CockpitPortsView
              rows={buildPortRows(config, serviceStates, portStatus)}
              openPreview={openPreview}
              copy={copy}
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
              copy={copy}
            />
          ) : null}
        </main>
      </div>

      <CockpitFooter
        crtShader={crtShader}
        copy={copy}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title={copy.helpTitle}
        maxWidth="md"
        footer={
          <div className="flex justify-end w-full">
            <Button variant="accent" size="sm" onClick={() => setIsHelpOpen(false)}>
              {copy.closeHelp}
            </Button>
          </div>
        }
      >
        <p className="m-muted" style={{ marginTop: 0 }}>
          {copy.helpSubtitle}
        </p>
        <KbdLegend
          items={[
            { key: 'Space', label: copy.shortcutPlayPause },
            { key: 'M', label: copy.shortcutMute },
            { key: '[ / ]', label: copy.shortcutChannel },
            { key: '1 - 6', label: copy.shortcutTabs },
            { key: 'P', label: copy.shortcutPorts },
            { key: '?', label: copy.shortcutHelp },
            { key: 'Esc', label: copy.closeHelp },
          ]}
        />
      </Modal>

      <AlertDialog
        isOpen={Boolean(confirmModal?.isOpen)}
        tone={confirmModal?.isDestructive ? 'danger' : 'accent'}
        title={confirmModal?.title ?? ''}
        message={confirmModal?.description ?? ''}
        note={confirmModal?.isDestructive ? copy.confirmIrreversible : undefined}
        confirmLabel={copy.confirmBtn}
        cancelLabel={copy.cancelBtn}
        onConfirm={() => {
          confirmModal?.onConfirm()
        }}
        onClose={() => setConfirmModal(null)}
      />
    </div>
  )
}
