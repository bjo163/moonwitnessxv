import { useState, useEffect, useRef } from 'react'
import Hls from 'hls.js'
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Button,
  TextInput,
  LiveDot,
  Tape,
  BrandLogo,
  Tabs,
  Pill,
  PillGroup,
  StationCard,
  TerminalViewer,
  type TabItem,
} from '@moonwitness/moonui'

export type ChannelMediaType = 'bgm' | 'radio' | 'iptv'

export interface ChannelItem {
  id: string
  name: string
  type: ChannelMediaType
  streamUrl: string
  genre: string
  icon: string
  country?: string
  description?: string
}

interface ServiceDef {
  tag: string
  name: string
  pkg: string
  port?: number
  type?: 'service' | 'worker'
  color: string
  icon: string
  description?: string
  url?: string
}

interface ServiceState {
  tag: string
  name: string
  pkg: string
  status: 'STOPPED' | 'STARTING' | 'RUNNING' | 'ERROR'
  pid?: number
  port?: number
  uptimeSeconds: number
  restarts: number
  lastError?: string
}

interface LogEntry {
  id: string
  timestamp: string
  tag: string
  level: 'info' | 'warn' | 'error'
  message: string
}

interface AppConfig {
  title: string
  port: number
  services: ServiceDef[]
}

const DEFAULT_CHANNELS: ChannelItem[] = [
  {
    id: 'bgm-levelup',
    name: 'Level Up // Chiptune Arcade',
    type: 'bgm',
    streamUrl: '/bgm.mp3',
    genre: 'Chiptune / 8-Bit',
    icon: '🎮',
    country: 'MOON',
    description: 'Official Moondeck Mission Cockpit energetic arcade soundtrack',
  },
  {
    id: 'iptv-dw-news',
    name: 'DW News English HD',
    type: 'iptv',
    streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    genre: 'News / Current Affairs',
    icon: '📺',
    country: 'DE',
    description: 'Deutsche Welle international 24/7 news television stream',
  },
  {
    id: 'iptv-redbull',
    name: 'Red Bull TV Live',
    type: 'iptv',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    genre: 'Sports / Gaming / Action',
    icon: '⚡',
    country: 'AT',
    description: 'Extreme sports, gaming, and action culture live television',
  },
  {
    id: 'iptv-mux-animation',
    name: 'Retro Animation 24/7',
    type: 'iptv',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    genre: 'Animation / Visuals',
    icon: '🎬',
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
    icon: '📻',
    country: 'ID',
    description: 'Hit music station Indonesia #1 for youth',
  },
  {
    id: 'radio-genfm',
    name: 'Gen FM 98.7 Jakarta',
    type: 'radio',
    streamUrl: 'https://ic.mari.co.id:8443/genfm',
    genre: 'Indonesian Pop',
    icon: '📻',
    country: 'ID',
    description: 'Suara Musik Indonesia hits & culture',
  },
  {
    id: 'radio-somafm-groove',
    name: 'SomaFM: Groove Salad',
    type: 'radio',
    streamUrl: 'https://ice2.somafm.com/groovesalad-128-mp3',
    genre: 'Ambient / Chillout',
    icon: '🥗',
    country: 'US',
    description: 'A nicely chilled plate of ambient beats and cyber grooves',
  },
  {
    id: 'radio-somafm-secret',
    name: 'SomaFM: Secret Agent',
    type: 'radio',
    streamUrl: 'https://ice2.somafm.com/secretagent-128-mp3',
    genre: 'Spy / Cyberpunk',
    icon: '🕵️',
    country: 'US',
    description: 'The soundtrack for your stylish, mysterious hacking day',
  },
  {
    id: 'radio-kexp',
    name: 'KEXP 90.3 Seattle',
    type: 'radio',
    streamUrl: 'https://kexp.streamguys1.com/kexp160.mp3',
    genre: 'Indie / Eclectic',
    icon: '🎙️',
    country: 'US',
    description: 'Where the music matters — legendary independent live radio',
  },
]

export type CockpitTab = 'logs' | 'preview' | 'media' | 'ledger' | 'ports'

export function App() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [serviceStates, setServiceStates] = useState<Record<string, ServiceState>>({})
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [activeTab, setActiveTab] = useState<CockpitTab>('logs')
  const [filterTag, setFilterTag] = useState<string>('all')
  const [showErrorsOnly, setShowErrorsOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [previewUrl, setPreviewUrl] = useState('http://localhost:3001')
  const [clock, setClock] = useState('')
  const [uptime, setUptime] = useState(0)
  const [errorLines, setErrorLines] = useState<string[]>([])
  const [isFreeingPorts, setIsFreeingPorts] = useState(false)

  // Media Player State
  const [channels, setChannels] = useState<ChannelItem[]>(DEFAULT_CHANNELS)
  const [activeChannelIndex, setActiveChannelIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.4)
  const [channelCategory, setChannelCategory] = useState<'all' | 'bgm' | 'radio' | 'iptv'>('all')
  const [channelSearch, setChannelSearch] = useState('')

  // Custom channel input form
  const [customName, setCustomName] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [customType, setCustomType] = useState<ChannelMediaType>('iptv')
  const [customGenre, setCustomGenre] = useState('')

  const terminalRef = useRef<HTMLDivElement>(null)
  const previewFrameRef = useRef<HTMLIFrameElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)

  const currentChannel = channels[activeChannelIndex] ?? DEFAULT_CHANNELS[0]

  // Clock
  useEffect(() => {
    const update = () => {
      const now = new Date()
      setClock(now.toTimeString().split(' ')[0] ?? '')
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  // Initial config, status & channels
  useEffect(() => {
    void (async () => {
      try {
        const [cfgRes, statRes, chRes] = await Promise.all([
          fetch('/api/config'),
          fetch('/api/status'),
          fetch('/api/channels'),
        ])
        const cfgData = (await cfgRes.json()) as AppConfig
        const statData = (await statRes.json()) as { services: ServiceState[]; system?: { uptime: number } }
        setConfig(cfgData)
        if (statData.system?.uptime) setUptime(Math.floor(statData.system.uptime))
        const map: Record<string, ServiceState> = {}
        for (const s of statData.services) {
          map[s.tag] = s
        }
        setServiceStates(map)

        if (chRes.ok) {
          const chData = (await chRes.json()) as ChannelItem[]
          if (Array.isArray(chData) && chData.length > 0) {
            setChannels(chData)
          }
        }
      } catch (err) {
        console.error('Failed to load initial cockpit data:', err)
      }
    })()
  }, [])

  // SSE Stream
  useEffect(() => {
    const es = new EventSource('/api/logs/stream')

    es.addEventListener('init', (e) => {
      try {
        const initialLogs = JSON.parse(e.data) as LogEntry[]
        setLogs(initialLogs)
      } catch {
        /* ignore */
      }
    })

    es.addEventListener('log', (e) => {
      try {
        const entry = JSON.parse(e.data) as LogEntry
        setLogs((prev) => {
          const next = [...prev, entry]
          return next.length > 1000 ? next.slice(-1000) : next
        })
      } catch {
        /* ignore */
      }
    })

    es.addEventListener('state', (e) => {
      try {
        const state = JSON.parse(e.data) as ServiceState
        setServiceStates((prev) => ({ ...prev, [state.tag]: state }))
      } catch {
        /* ignore */
      }
    })

    return () => {
      es.close()
    }
  }, [])

  // Auto-scroll terminal
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logs, autoScroll, filterTag, showErrorsOnly, searchTerm])

  // Playback Engine: Synchronizes current channel with HTML5 Audio / Video + HLS.js
  useEffect(() => {
    const ch = channels[activeChannelIndex] ?? DEFAULT_CHANNELS[0]
    if (!ch) return

    // Clean up previous HLS instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (ch.type === 'iptv') {
      // Pause audio player
      if (audioRef.current) {
        audioRef.current.pause()
      }

      const video = videoRef.current
      if (video) {
        video.volume = volume
        video.muted = isMuted

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
      // Audio or BGM channel
      if (videoRef.current) {
        videoRef.current.pause()
      }

      if (!audioRef.current) {
        audioRef.current = new Audio()
      }
      const audio = audioRef.current
      audio.src = ch.streamUrl
      audio.loop = ch.type === 'bgm'
      audio.volume = volume
      audio.muted = isMuted

      const startAudio = () => {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay policy fallback: unlock on first interaction
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

  const addCustomChannel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customName || !customUrl) return
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customName,
          streamUrl: customUrl,
          type: customType,
          genre: customGenre || (customType === 'iptv' ? 'IPTV Stream' : 'Radio Stream'),
        }),
      })
      if (res.ok) {
        const added = (await res.json()) as ChannelItem
        setChannels((prev) => [...prev, added])
        setActiveChannelIndex(channels.length)
        setCustomName('')
        setCustomUrl('')
        setCustomGenre('')
        alert(`Station "${added.name}" added to playlist!`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(`Failed to add station: ${msg}`)
    }
  }

  const controlService = async (tag: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const res = await fetch(`/api/services/${tag}/${action}`, { method: 'POST' })
      const data = (await res.json()) as { state?: ServiceState }
      if (data.state) {
        const nextState = data.state
        setServiceStates((prev) => ({ ...prev, [tag]: nextState }))
      }
    } catch (err) {
      console.error(`Failed to ${action} ${tag}:`, err)
    }
  }

  const startAll = async () => {
    await fetch('/api/services/start-all', { method: 'POST' })
  }

  const stopAll = async () => {
    await fetch('/api/services/stop-all', { method: 'POST' })
  }

  const freePorts = async () => {
    setIsFreeingPorts(true)
    try {
      const res = await fetch('/api/ports/free', { method: 'POST' })
      const data = (await res.json()) as { message?: string }
      alert(data.message || 'Ports freed')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(`Failed to free ports: ${msg}`)
    } finally {
      setIsFreeingPorts(false)
    }
  }

  const loadLedger = async () => {
    try {
      const res = await fetch('/api/errors')
      const data = (await res.json()) as { lines?: string[] }
      setErrorLines(data.lines || [])
    } catch (err) {
      console.error('Failed to load error ledger:', err)
    }
  }

  const clearLedger = async () => {
    if (!confirm('Clear all logged errors?')) return
    await fetch('/api/errors', { method: 'DELETE' })
    await loadLedger()
  }

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

  const filteredLogs = logs.filter((l) => {
    if (filterTag !== 'all' && l.tag !== filterTag) return false
    if (showErrorsOnly && l.level !== 'error') return false
    if (searchTerm && !l.message.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const filteredChannels = channels.filter((ch) => {
    if (channelCategory !== 'all' && ch.type !== channelCategory) return false
    if (channelSearch) {
      const q = channelSearch.toLowerCase()
      return ch.name.toLowerCase().includes(q) || ch.genre.toLowerCase().includes(q)
    }
    return true
  })

  const previewShortcuts = [
    { label: '🚢 Dock (:3001)', url: 'http://localhost:3001' },
    { label: '🏛️ Headquarters (:3002)', url: 'http://localhost:3002' },
    { label: '🛰️ World Monitor (:3002/world-monitor)', url: 'http://localhost:3002/world-monitor' },
    { label: '📻 Radio Hub (:3000)', url: 'http://localhost:3000' },
    { label: '📖 Swagger Docs (:3000/docs)', url: 'http://localhost:3000/docs' },
    { label: '🧠 AI Gateway (:3003)', url: 'http://localhost:3003/v1/models' },
  ]

  const portMap = [
    { port: 3000, name: 'Radio Core Hub', tag: 'radio', desc: 'Fastify Hub & OpenAPI' },
    { port: 3001, name: 'Public Radio Dock', tag: 'dock', desc: 'Next.js Station Player & Feed' },
    { port: 3002, name: 'Headquarters', tag: 'hq', desc: 'Mission Control & World Monitor' },
    { port: 3003, name: 'AI Gateway Router', tag: 'ai', desc: 'Cascading AI Gateway Engine' },
    { port: 3004, name: 'Moondeck Cockpit', tag: 'cockpit', desc: 'Desktop Process Supervisor' },
  ]

  const cockpitTabs: TabItem[] = [
    { id: 'logs', label: 'Terminal & Logs', icon: '📟', tone: 'cyan' },
    { id: 'preview', label: 'In-App Web Preview', icon: '🌐', tone: 'accent' },
    { id: 'media', label: 'Media & IPTV Player', count: channels.length, icon: '📺', tone: 'pink' },
    { id: 'ledger', label: 'Error Ledger', count: errorLines.length > 0 ? errorLines.length : undefined, icon: '🚨', tone: 'accent' },
    { id: 'ports', label: 'Network & Ports', icon: '🔌', tone: 'cyan' },
  ]

  return (
    <div className="cockpit-shell">
      {/* Top Cockpit Header */}
      <header className="cockpit-topbar">
        <div className="cockpit-brand">
          <BrandLogo size="sm" />
          <div className="cockpit-title">
            <span>MOONDECK</span>
            <Tape tone="accent">DESKTOP COCKPIT</Tape>
          </div>
        </div>

        <div className="cockpit-telemetry">
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
              ⏮
            </Button>
            <Button
              variant={isPlaying ? 'danger' : 'primary'}
              size="sm"
              style={{ padding: '2px 8px', fontSize: 10, height: 22 }}
              onClick={togglePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              style={{ padding: '2px 5px', fontSize: 10, height: 22 }}
              onClick={nextChannel}
              title="Next Channel"
            >
              ⏭
            </Button>
            <Button
              variant="ghost"
              size="sm"
              style={{ padding: '2px 5px', fontSize: 10, height: 22 }}
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🔊'}
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
              📺 Player
            </Button>
          </div>
        </div>

        {/* Global Dev Actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button variant="primary" size="sm" onClick={() => void startAll()}>
            ▶ Start All
          </Button>
          <Button variant="danger" size="sm" onClick={() => void stopAll()}>
            ⏹ Stop All
          </Button>
          <Button
            variant="accent"
            size="sm"
            disabled={isFreeingPorts}
            onClick={() => void freePorts()}
          >
            {isFreeingPorts ? 'Freeing...' : '⚡ Free Ports'}
          </Button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="cockpit-body">
        {/* Left Service Rail */}
        <aside className="cockpit-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">Microservices</span>
            <Badge tone="cyan">LIVE CONTROL</Badge>
          </div>

          <div className="services-list">
            {config?.services.map((svc) => {
              const state: ServiceState = serviceStates[svc.tag] || {
                tag: svc.tag,
                name: svc.name,
                pkg: svc.pkg,
                status: 'STOPPED',
                uptimeSeconds: 0,
                restarts: 0,
              }
              const isRunning = state.status === 'RUNNING'
              const badgeTone =
                state.status === 'RUNNING'
                  ? 'ok'
                  : state.status === 'STARTING'
                  ? 'accent'
                  : state.status === 'ERROR'
                  ? 'hot'
                  : 'night'

              return (
                <div key={svc.tag} className="service-card-wrapper">
                  <Card
                    style={{
                      borderLeft: `4px solid ${svc.color}`,
                      backgroundColor: 'var(--surface-2)',
                    }}
                  >
                    <CardHeader
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{svc.icon}</span>
                          <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--fg)' }}>
                            {svc.name}
                          </span>
                        </div>
                      }
                      actions={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <LiveDot
                            state={
                              state.status === 'RUNNING'
                                ? 'live'
                                : state.status === 'ERROR'
                                ? 'down'
                                : 'connecting'
                            }
                          />
                          <Badge tone={badgeTone}>{state.status}</Badge>
                        </div>
                      }
                    />
                    <CardBody style={{ paddingTop: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: 12,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          color: 'var(--muted)',
                          marginBottom: 6,
                        }}
                      >
                        {svc.port ? (
                          <span>
                            PORT: <b style={{ color: 'var(--cyan)' }}>{svc.port}</b>
                          </span>
                        ) : (
                          <span>TYPE: WORKER</span>
                        )}
                        {state.pid ? (
                          <span>
                            PID: <b style={{ color: 'var(--fg)' }}>{state.pid}</b>
                          </span>
                        ) : null}
                        {state.uptimeSeconds > 0 ? (
                          <span>
                            UP: <b style={{ color: 'var(--ok)' }}>{formatUptime(state.uptimeSeconds)}</b>
                          </span>
                        ) : null}
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--muted)',
                          marginBottom: 10,
                          lineHeight: 1.35,
                        }}
                      >
                        {svc.description}
                      </div>

                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {isRunning ? (
                          <>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => void controlService(svc.tag, 'stop')}
                            >
                              ⏹ Stop
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void controlService(svc.tag, 'restart')}
                            >
                              ↻ Restart
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => void controlService(svc.tag, 'start')}
                          >
                            ▶ Start
                          </Button>
                        )}
                        {svc.url ? (
                          <Button
                            variant="paper"
                            size="sm"
                            onClick={() => {
                              if (svc.url) openPreview(svc.url)
                            }}
                          >
                            👁 Preview
                          </Button>
                        ) : null}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )
            })}
          </div>
        </aside>

        {/* Right Main Stage */}
        <main className="cockpit-main">
          {/* Tab Navigation (Unified Tabs Primitive) */}
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

          {/* Tab 1: Terminal & Logs */}
          {activeTab === 'logs' ? (
            <div className="tab-content">
              <div className="terminal-bar">
                <PillGroup label="Filter:">
                  <Pill
                    label="ALL"
                    active={filterTag === 'all'}
                    tone="cyan"
                    onClick={() => setFilterTag('all')}
                  />
                  {config?.services.map((s) => (
                    <Pill
                      key={s.tag}
                      label={s.tag.toUpperCase()}
                      active={filterTag === s.tag}
                      tone={filterTag === s.tag ? 'cyan' : 'night'}
                      onClick={() => setFilterTag(s.tag)}
                    />
                  ))}
                </PillGroup>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TextInput
                    style={{ height: 30, fontSize: 12, width: 180 }}
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    variant={showErrorsOnly ? 'danger' : 'ghost'}
                    size="sm"
                    onClick={() => setShowErrorsOnly(!showErrorsOnly)}
                  >
                    Errors Only
                  </Button>
                  <Button
                    variant={autoScroll ? 'cyan' : 'ghost'}
                    size="sm"
                    onClick={() => setAutoScroll(!autoScroll)}
                  >
                    Auto-Scroll
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setLogs([])}>
                    Clear
                  </Button>
                </div>
              </div>

              <TerminalViewer
                lines={filteredLogs}
                autoScroll={autoScroll}
                className="flex-1"
              />
            </div>
          ) : null}

          {/* Tab 2: In-App Web Preview */}
          {activeTab === 'preview' ? (
            <div className="tab-content">
              <div className="preview-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 500 }}>
                  <TextInput
                    style={{ height: 32, fontSize: 12, flex: 1, color: 'var(--cyan)' }}
                    value={previewUrl}
                    onChange={(e) => setPreviewUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && previewFrameRef.current) {
                        previewFrameRef.current.src = previewUrl
                      }
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (previewFrameRef.current) previewFrameRef.current.src = previewUrl
                    }}
                  >
                    Go
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (previewFrameRef.current) previewFrameRef.current.src = previewUrl
                    }}
                  >
                    ↻
                  </Button>
                  <Button
                    variant="paper"
                    size="sm"
                    onClick={() => window.open(previewUrl, '_blank')}
                  >
                    ↗ External
                  </Button>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {previewShortcuts.map((s) => (
                    <Button
                      key={s.label}
                      variant="ghost"
                      size="sm"
                      style={{ fontSize: 11, padding: '3px 8px' }}
                      onClick={() => openPreview(s.url)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              <iframe
                ref={previewFrameRef}
                className="preview-iframe"
                src={previewUrl}
                title="Cockpit Preview"
              />
            </div>
          ) : null}

          {/* Tab 3: Dedicated Media & IPTV Stations Player */}
          {activeTab === 'media' ? (
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
                    overflow: 'hidden',
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
                      <div
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background:
                            currentChannel.type === 'bgm'
                              ? 'radial-gradient(circle, var(--pink) 0%, transparent 70%)'
                              : 'radial-gradient(circle, var(--cyan) 0%, transparent 70%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 54,
                          boxShadow: '0 0 30px rgba(0, 212, 255, 0.2)',
                          animation: isPlaying ? 'pulse 2s infinite' : 'none',
                        }}
                      >
                        {currentChannel.icon}
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
                      ⏮ Previous
                    </Button>
                    <Button
                      variant={isPlaying ? 'danger' : 'primary'}
                      size="sm"
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? '⏸ Pause' : '▶ Play Stream'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={nextChannel}>
                      ⏭ Next
                    </Button>
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
                    <Button variant="ghost" size="sm" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? '🔇' : '🔊'}
                    </Button>
                  </div>
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
                      <option value="iptv">📺 IPTV</option>
                      <option value="radio">📻 Radio</option>
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
          ) : null}

          {/* Tab 4: Error Ledger */}
          {activeTab === 'ledger' ? (
            <div className="tab-content">
              <div className="terminal-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 12,
                      color: 'var(--muted)',
                    }}
                  >
                    SOURCE: dev-errors.log
                  </span>
                  <Badge tone="hot">{errorLines.length} ENTRIES</Badge>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="primary" size="sm" onClick={() => void loadLedger()}>
                    ↻ Refresh
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => void clearLedger()}>
                    Clear Log File
                  </Button>
                </div>
              </div>

              <div className="m-terminal-viewer" style={{ flex: 1, maxHeight: 'none' }}>
                {errorLines.length === 0 ? (
                  <div style={{ color: 'var(--ok)', padding: 16 }}>
                    ✔ No errors recorded in dev-errors.log. All systems nominal.
                  </div>
                ) : (
                  errorLines.map((line, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        background: 'rgba(255, 30, 86, 0.1)',
                        borderLeft: '3px solid var(--hot)',
                        marginBottom: 6,
                        borderRadius: 3,
                        color: 'var(--hot)',
                      }}
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {/* Tab 5: Network & Ports */}
          {activeTab === 'ports' ? (
            <div className="ports-container">
              {portMap.map((p) => {
                const state = serviceStates[p.tag]
                const isRunning = p.tag === 'cockpit' || (state && state.status === 'RUNNING')
                return (
                  <Card key={p.port} style={{ backgroundColor: 'var(--surface-2)' }}>
                    <CardHeader
                      title={
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 24,
                            fontWeight: 900,
                            color: 'var(--cyan)',
                          }}
                        >
                          :{p.port}
                        </span>
                      }
                      actions={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <LiveDot state={isRunning ? 'live' : 'down'} />
                          <Badge tone={isRunning ? 'ok' : 'night'}>
                            {isRunning ? 'BOUND' : 'IDLE'}
                          </Badge>
                        </div>
                      }
                    />
                    <CardBody>
                      <div
                        style={{
                          fontWeight: 800,
                          color: 'var(--fg)',
                          fontSize: 14,
                          marginBottom: 4,
                        }}
                      >
                        {p.name}
                      </div>
                      <div
                        style={{
                          color: 'var(--muted)',
                          fontSize: 12,
                          marginBottom: 14,
                        }}
                      >
                        {p.desc}
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openPreview(`http://localhost:${p.port}`)}
                      >
                        Open In Preview 👁
                      </Button>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
