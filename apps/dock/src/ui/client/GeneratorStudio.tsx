'use client'

import { useState, useRef, type ReactNode } from 'react'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  TextInput,
  Tabs,
  Pill,
  PillGroup,
  MoonAvatar,
  StationSeal,
  LiveDot,
  Tape,
  type TabItem,
  type MoonAvatarVariant,
  type PillTone,
  IconSparkles,
  IconRefresh,
  IconShare,
  IconShield,
  IconCrown,
  IconRadio,
  IconSliders,
  MOON_COLORS,
} from '@moonwitness/moonui'
import { triggerHaptic } from '@moonwitness/moonui/client'
import {
  IconGlobe,
  IconTerminal,
  IconRadar,
  IconSignal,
  IconFlame,
  IconTape,
  IconCompass,
  IconBookOpen,
  IconCpu,
  IconClock,
  IconLock,
  IconKey,
  IconEye,
  IconMoon,
  IconCheckCircle,
  IconSearch,
} from '@moonwitness/moonui/icons'

const AVATAR_PRESETS = [
  { label: 'Witness Prime', seed: 'hoodie-witness-001', variant: 'hoodie' as const },
  { label: 'Shadow Archivist', seed: 'archivist-hq-77', variant: 'hoodie' as const },
  { label: 'Basquiat Crown', seed: 'crown-basquiat-99', variant: 'crown' as const },
  { label: 'Gold Sovereign', seed: 'gold-monarch-12', variant: 'crown' as const },
  { label: 'Matrix Daemon', seed: 'matrix-core-0x42', variant: 'matrix' as const },
  { label: 'Cipher Node', seed: 'cipher-node-880', variant: 'matrix' as const },
  { label: 'Radio Sentinel', seed: 'sentinel-radar-09', variant: 'emblem' as const },
  { label: 'Antikythera Seal', seed: 'mts-antikythera-14', variant: 'emblem' as const },
]

const SEAL_PRESETS = [
  { id: 'station-01', name: 'Lofi Cyberpunk 24/7', genre: 'CHIPTUNE' },
  { id: 'station-02', name: 'Substation Ambient Pulse', genre: 'AMBIENT' },
  { id: 'station-03', name: 'Al-Bayan Quranic Haqq', genre: 'RECITATION' },
  { id: 'station-04', name: 'Basquiat Underground Tape', genre: 'HIPHOP' },
  { id: 'station-05', name: 'Sentinel OSINT Broadcast', genre: 'NEWS' },
]

const ICON_CATALOG = [
  { name: 'Radio', icon: IconRadio },
  { name: 'Radar', icon: IconRadar },
  { name: 'Signal', icon: IconSignal },
  { name: 'Shield', icon: IconShield },
  { name: 'Terminal', icon: IconTerminal },
  { name: 'Crown', icon: IconCrown },
  { name: 'Globe', icon: IconGlobe },
  { name: 'Flame', icon: IconFlame },
  { name: 'Tape', icon: IconTape },
  { name: 'Compass', icon: IconCompass },
  { name: 'Book', icon: IconBookOpen },
  { name: 'CPU', icon: IconCpu },
  { name: 'Clock', icon: IconClock },
  { name: 'Lock', icon: IconLock },
  { name: 'Key', icon: IconKey },
  { name: 'Eye', icon: IconEye },
  { name: 'Moon', icon: IconMoon },
  { name: 'Check', icon: IconCheckCircle },
  { name: 'Search', icon: IconSearch },
  { name: 'Sparkles', icon: IconSparkles },
]

interface AvatarConfigProps {
  seed: string
  variant: MoonAvatarVariant
  size: number
  onSeedChange: (s: string) => void
  onVariantChange: (v: MoonAvatarVariant) => void
  onSizeChange: (sz: number) => void
  onRandomize: () => void
}

function AvatarConfigurator({
  seed,
  variant,
  size,
  onSeedChange,
  onVariantChange,
  onSizeChange,
  onRandomize,
}: AvatarConfigProps): ReactNode {
  return (
    <Card variant="paper">
      <CardHeader
        title={
          <div className="m-row" style={{ gap: 8, alignItems: 'center' }}>
            <IconSparkles size={18} color={MOON_COLORS.cyan} />
            <span className="m-label" style={{ fontWeight: 700 }}>
              AVATAR CONFIGURATOR
            </span>
          </div>
        }
        actions={
          <Button variant="ghost" size="sm" onClick={onRandomize}>
            <IconRefresh size={14} /> RANDOM SEED
          </Button>
        }
      />
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }}>
        <div>
          <label className="m-label" style={{ display: 'block', marginBottom: 6 }}>
            SEED IDENTIFIER (PRNG HASH)
          </label>
          <TextInput
            value={seed}
            onChange={(e) => onSeedChange(e.target.value)}
            placeholder="Enter custom seed phrase..."
          />
        </div>

        <div>
          <label className="m-label" style={{ display: 'block', marginBottom: 6 }}>
            ARCHETYPE VARIANT
          </label>
          <PillGroup>
            {(['hoodie', 'crown', 'matrix', 'emblem'] as MoonAvatarVariant[]).map((v) => (
              <Pill
                key={v}
                label={v.toUpperCase()}
                active={variant === v}
                tone={variant === v ? 'cyan' : 'night'}
                onClick={() => {
                  triggerHaptic('switch')
                  onVariantChange(v)
                }}
              />
            ))}
          </PillGroup>
        </div>

        <div>
          <label className="m-label" style={{ display: 'block', marginBottom: 6 }}>
            CURATED PRESETS
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {AVATAR_PRESETS.map((p) => (
              <Button
                key={p.seed}
                variant="paper"
                size="sm"
                onClick={() => {
                  triggerHaptic('switch')
                  onSeedChange(p.seed)
                  onVariantChange(p.variant)
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="m-row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <label className="m-label">PREVIEW SCALE</label>
            <span className="m-label" style={{ color: MOON_COLORS.cyan }}>
              {size}px
            </span>
          </div>
          <input
            type="range"
            min="64"
            max="280"
            step="8"
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: MOON_COLORS.cyan }}
          />
        </div>
      </CardBody>
    </Card>
  )
}

interface SealConfigProps {
  stationId: string
  name: string
  genre: string
  size: number
  onStationIdChange: (id: string) => void
  onNameChange: (n: string) => void
  onGenreChange: (g: string) => void
  onSizeChange: (sz: number) => void
}

function SealConfigurator({
  stationId,
  name,
  genre,
  size,
  onStationIdChange,
  onNameChange,
  onGenreChange,
  onSizeChange,
}: SealConfigProps): ReactNode {
  return (
    <Card variant="paper">
      <CardHeader
        title={
          <div className="m-row" style={{ gap: 8, alignItems: 'center' }}>
            <IconShield size={18} color={MOON_COLORS.accent} />
            <span className="m-label" style={{ fontWeight: 700 }}>
              HERALDIC STATION SEAL ENGINE
            </span>
          </div>
        }
      />
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="m-label" style={{ display: 'block', marginBottom: 6 }}>
              STATION ID
            </label>
            <TextInput
              value={stationId}
              onChange={(e) => onStationIdChange(e.target.value)}
              placeholder="e.g. station-01"
            />
          </div>
          <div>
            <label className="m-label" style={{ display: 'block', marginBottom: 6 }}>
              GENRE CALLSIGN
            </label>
            <TextInput
              value={genre}
              onChange={(e) => onGenreChange(e.target.value.toUpperCase())}
              placeholder="e.g. CHIPTUNE"
            />
          </div>
        </div>

        <div>
          <label className="m-label" style={{ display: 'block', marginBottom: 6 }}>
            STATION BROADCAST NAME
          </label>
          <TextInput
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter station name..."
          />
        </div>

        <div>
          <label className="m-label" style={{ display: 'block', marginBottom: 6 }}>
            STATION PRESETS
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SEAL_PRESETS.map((p) => (
              <Button
                key={p.id}
                variant="paper"
                size="sm"
                onClick={() => {
                  triggerHaptic('switch')
                  onStationIdChange(p.id)
                  onNameChange(p.name)
                  onGenreChange(p.genre)
                }}
              >
                {p.name}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="m-row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <label className="m-label">SEAL SCALE</label>
            <span className="m-label" style={{ color: MOON_COLORS.accent }}>
              {size}px
            </span>
          </div>
          <input
            type="range"
            min="64"
            max="280"
            step="8"
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: MOON_COLORS.accent }}
          />
        </div>
      </CardBody>
    </Card>
  )
}

interface GlyphConfigProps {
  selectedIconName: string
  iconSize: number
  iconStroke: number
  iconColor: string
  onSelectIcon: (n: string) => void
  onSizeChange: (sz: number) => void
  onStrokeChange: (st: number) => void
  onColorChange: (c: string) => void
}

function GlyphConfigurator({
  selectedIconName,
  iconSize,
  iconStroke,
  iconColor,
  onSelectIcon,
  onSizeChange,
  onStrokeChange,
  onColorChange,
}: GlyphConfigProps): ReactNode {
  return (
    <Card variant="paper">
      <CardHeader
        title={
          <div className="m-row" style={{ gap: 8, alignItems: 'center' }}>
            <IconSliders size={18} color={MOON_COLORS.ok} />
            <span className="m-label" style={{ fontWeight: 700 }}>
              VECTOR GLYPH CUSTOMIZER
            </span>
          </div>
        }
      />
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }}>
        <div>
          <label className="m-label" style={{ display: 'block', marginBottom: 8 }}>
            SELECT GLYPH ({ICON_CATALOG.length} CANONICAL ICONS)
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
              gap: 8,
              maxHeight: 220,
              overflowY: 'auto',
              padding: 4,
            }}
          >
            {ICON_CATALOG.map(({ name, icon: Comp }) => {
              const isSel = selectedIconName === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap')
                    onSelectIcon(name)
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    padding: '8px 4px',
                    background: isSel ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${isSel ? MOON_COLORS.cyan : 'rgba(247, 244, 236, 0.15)'}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    color: isSel ? MOON_COLORS.cyan : MOON_COLORS.fg,
                  }}
                >
                  <Comp size={22} color={isSel ? MOON_COLORS.cyan : 'currentColor'} />
                  <span style={{ fontSize: 10, fontFamily: 'monospace' }}>{name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="m-label" style={{ display: 'block', marginBottom: 6 }}>
              STROKE WIDTH ({iconStroke}px)
            </label>
            <input
              type="range"
              min="1"
              max="4"
              step="0.5"
              value={iconStroke}
              onChange={(e) => onStrokeChange(Number(e.target.value))}
              style={{ width: '100%', accentColor: MOON_COLORS.ok }}
            />
          </div>
          <div>
            <label className="m-label" style={{ display: 'block', marginBottom: 6 }}>
              GLYPH SIZE ({iconSize}px)
            </label>
            <input
              type="range"
              min="32"
              max="160"
              step="8"
              value={iconSize}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              style={{ width: '100%', accentColor: MOON_COLORS.ok }}
            />
          </div>
        </div>

        <div>
          <label className="m-label" style={{ display: 'block', marginBottom: 6 }}>
            COLOR THEME TONE
          </label>
          <PillGroup>
            {[
              { label: 'CYAN', color: MOON_COLORS.cyan, tone: 'cyan' as PillTone },
              { label: 'PINK', color: MOON_COLORS.pink, tone: 'pink' as PillTone },
              { label: 'ACCENT', color: MOON_COLORS.accent, tone: 'accent' as PillTone },
              { label: 'GREEN', color: MOON_COLORS.ok, tone: 'ok' as PillTone },
              { label: 'WHITE', color: MOON_COLORS.fg, tone: 'night' as PillTone },
            ].map((t) => (
              <Pill
                key={t.label}
                label={t.label}
                active={iconColor === t.color}
                tone={t.tone}
                onClick={() => {
                  triggerHaptic('switch')
                  onColorChange(t.color)
                }}
              />
            ))}
          </PillGroup>
        </div>
      </CardBody>
    </Card>
  )
}

interface PreviewStageProps {
  activeTab: 'avatar' | 'seal' | 'icons'
  avatarSeed: string
  avatarVariant: MoonAvatarVariant
  avatarSize: number
  sealStationId: string
  sealName: string
  sealGenre: string
  sealSize: number
  selectedIconName: string
  iconSize: number
  iconColor: string
  iconStroke: number
  copyFeedback: string | null
  previewContainerRef: React.RefObject<HTMLDivElement | null>
  onCopySvg: () => void
  onDownloadSvg: () => void
  onDownloadPng: () => void
}

function PreviewStage({
  activeTab,
  avatarSeed,
  avatarVariant,
  avatarSize,
  sealStationId,
  sealName,
  sealGenre,
  sealSize,
  selectedIconName,
  iconSize,
  iconColor,
  iconStroke,
  copyFeedback,
  previewContainerRef,
  onCopySvg,
  onDownloadSvg,
  onDownloadPng,
}: PreviewStageProps): ReactNode {
  return (
    <Card variant="paper">
      <CardHeader
        title={
          <span className="m-label" style={{ fontWeight: 700 }}>
            CANONICAL PREVIEW
          </span>
        }
        actions={<Badge tone="ok">VECTOR PURE</Badge>}
      />
      <CardBody style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: 20 }}>
        <div
          ref={previewContainerRef}
          style={{
            width: '100%',
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 50% 50%, #13101d 0%, #07060b 100%)',
            border: '1px solid rgba(247, 244, 236, 0.2)',
            borderRadius: 8,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(247, 244, 236, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(247, 244, 236, 0.04) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              pointerEvents: 'none',
            }}
          />

          {activeTab === 'avatar' && (
            <MoonAvatar seed={avatarSeed} variant={avatarVariant} size={avatarSize} />
          )}

          {activeTab === 'seal' && (
            <StationSeal
              stationId={sealStationId}
              name={sealName}
              genre={sealGenre}
              size={sealSize}
            />
          )}

          {activeTab === 'icons' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(() => {
                const found = ICON_CATALOG.find((i) => i.name === selectedIconName)
                const IconComp = found?.icon ?? IconRadio
                return <IconComp size={iconSize} color={iconColor} strokeWidth={iconStroke} />
              })()}
            </div>
          )}
        </div>

        {copyFeedback && (
          <div
            style={{
              background: 'rgba(0, 230, 118, 0.15)',
              border: `1px solid ${MOON_COLORS.ok}`,
              color: MOON_COLORS.ok,
              padding: '6px 12px',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              width: '100%',
              textAlign: 'center',
            }}
          >
            {copyFeedback}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <Button variant="primary" onClick={onCopySvg} style={{ width: '100%' }}>
            <IconShare size={16} /> COPY RAW SVG
          </Button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Button variant="paper" onClick={onDownloadSvg}>
              DOWNLOAD SVG
            </Button>
            <Button variant="paper" onClick={onDownloadPng}>
              EXPORT HD PNG
            </Button>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            textAlign: 'left',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(247, 244, 236, 0.1)',
            borderRadius: 6,
            padding: 12,
            fontSize: 11,
            fontFamily: 'monospace',
            color: MOON_COLORS.muted,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div>ENGINE: Mulberry32 PRNG + Vector Math</div>
          <div>PRECISION: Lossless SVG Scalable to Infinite Res</div>
          <div>DEPENDENCIES: 0KB External Asset / SSR Safe</div>
        </div>
      </CardBody>
    </Card>
  )
}

export function GeneratorStudio(): ReactNode {
  const [activeTab, setActiveTab] = useState<'avatar' | 'seal' | 'icons'>('avatar')

  const [avatarSeed, setAvatarSeed] = useState<string>('hoodie-witness-001')
  const [avatarVariant, setAvatarVariant] = useState<MoonAvatarVariant>('hoodie')
  const [avatarSize, setAvatarSize] = useState<number>(180)

  const [sealStationId, setSealStationId] = useState<string>('station-01')
  const [sealName, setSealName] = useState<string>('Lofi Cyberpunk 24/7')
  const [sealGenre, setSealGenre] = useState<string>('CHIPTUNE')
  const [sealSize, setSealSize] = useState<number>(180)

  const [selectedIconName, setSelectedIconName] = useState<string>('Radio')
  const [iconSize, setIconSize] = useState<number>(64)
  const [iconStroke, setIconStroke] = useState<number>(2)
  const [iconColor, setIconColor] = useState<string>(MOON_COLORS.cyan)

  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  const handleRandomizeAvatar = () => {
    triggerHaptic('switch')
    const randomHex = Math.random().toString(36).substring(2, 10)
    setAvatarSeed(`witness-${randomHex}`)
  }

  const handleCopySvg = () => {
    triggerHaptic('tap')
    if (!previewContainerRef.current) return
    const svgEl = previewContainerRef.current.querySelector('svg')
    if (svgEl) {
      const serializer = new XMLSerializer()
      const svgStr = serializer.serializeToString(svgEl)
      void navigator.clipboard.writeText(svgStr)
      setCopyFeedback('SVG markup copied to clipboard!')
      setTimeout(() => setCopyFeedback(null), 2500)
    }
  }

  const handleDownloadSvg = () => {
    triggerHaptic('tap')
    if (!previewContainerRef.current) return
    const svgEl = previewContainerRef.current.querySelector('svg')
    if (svgEl) {
      const filename =
        activeTab === 'avatar'
          ? `avatar-${avatarSeed}`
          : activeTab === 'seal'
            ? `seal-${sealStationId}`
            : `icon-${selectedIconName.toLowerCase()}`
      const serializer = new XMLSerializer()
      const svgStr = serializer.serializeToString(svgEl)
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleDownloadPng = (exportDimension = 1024) => {
    triggerHaptic('tap')
    if (!previewContainerRef.current) return
    const svgEl = previewContainerRef.current.querySelector('svg')
    if (!svgEl) return

    const filename =
      activeTab === 'avatar'
        ? `avatar-${avatarSeed}`
        : activeTab === 'seal'
          ? `seal-${sealStationId}`
          : `icon-${selectedIconName.toLowerCase()}`
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svgEl)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = exportDimension
      canvas.height = exportDimension
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, exportDimension, exportDimension)
        const pngUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = pngUrl
        link.download = `${filename}-hd.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const tabItems: TabItem[] = [
    { id: 'avatar', label: 'AVATAR FORGE' },
    { id: 'seal', label: 'HERALDIC SEAL FORGE' },
    { id: 'icons', label: 'VECTOR GLYPH FORGE' },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="m-row" style={{ gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <LiveDot state="live" />
          <Badge tone="cyan">GENERATIVE LIVING ENGINE</Badge>
          <Tape tone="accent">100% PURE SVG · ZERO DEPENDENCY</Tape>
        </div>
        <h1 className="m-heading" style={{ fontSize: '2rem', margin: '4px 0' }}>
          MOONWITNESS VECTOR STUDIO
        </h1>
        <p className="m-body" style={{ color: MOON_COLORS.muted, maxWidth: 800 }}>
          Deterministic algorithmic SVG generator for cyber-monastic avatars, heraldic radio substation
          seals, and crisp 2px line-weight vector icons. Rendered mathematical purity with zero external asset bloat.
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Tabs
          items={tabItems}
          activeId={activeTab}
          onChange={(id: string) => {
            triggerHaptic('switch')
            setActiveTab(id as 'avatar' | 'seal' | 'icons')
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        <div>
          {activeTab === 'avatar' && (
            <AvatarConfigurator
              seed={avatarSeed}
              variant={avatarVariant}
              size={avatarSize}
              onSeedChange={setAvatarSeed}
              onVariantChange={setAvatarVariant}
              onSizeChange={setAvatarSize}
              onRandomize={handleRandomizeAvatar}
            />
          )}

          {activeTab === 'seal' && (
            <SealConfigurator
              stationId={sealStationId}
              name={sealName}
              genre={sealGenre}
              size={sealSize}
              onStationIdChange={setSealStationId}
              onNameChange={setSealName}
              onGenreChange={setSealGenre}
              onSizeChange={setSealSize}
            />
          )}

          {activeTab === 'icons' && (
            <GlyphConfigurator
              selectedIconName={selectedIconName}
              iconSize={iconSize}
              iconStroke={iconStroke}
              iconColor={iconColor}
              onSelectIcon={setSelectedIconName}
              onSizeChange={setIconSize}
              onStrokeChange={setIconStroke}
              onColorChange={setIconColor}
            />
          )}
        </div>

        <div>
          <PreviewStage
            activeTab={activeTab}
            avatarSeed={avatarSeed}
            avatarVariant={avatarVariant}
            avatarSize={avatarSize}
            sealStationId={sealStationId}
            sealName={sealName}
            sealGenre={sealGenre}
            sealSize={sealSize}
            selectedIconName={selectedIconName}
            iconSize={iconSize}
            iconColor={iconColor}
            iconStroke={iconStroke}
            copyFeedback={copyFeedback}
            previewContainerRef={previewContainerRef}
            onCopySvg={handleCopySvg}
            onDownloadSvg={handleDownloadSvg}
            onDownloadPng={() => handleDownloadPng(1024)}
          />
        </div>
      </div>
    </div>
  )
}
