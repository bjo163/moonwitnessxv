import type { ReactNode } from 'react'
import { cn } from './cn.js'
import { Badge, type BadgeTone } from './layout.js'
import { LiveDot } from './data.js'
import { Button } from './form.js'
import { Glyph } from './glyph.js'

const TYPE_CODE = { bgm: 'BG', radio: 'FM', iptv: 'TV' } as const

export interface StationCardProps {
  id: string
  name: string
  type?: 'bgm' | 'radio' | 'iptv'
  streamUrl: string
  genre?: string
  country?: string
  /** 2-3 letter monogram for the <Glyph> tile; defaults from `type` */
  icon?: string
  active?: boolean
  isPlaying?: boolean
  onSelect?: () => void
  onTogglePlay?: () => void
  className?: string
  actions?: ReactNode
}

export function StationCard({
  name,
  type = 'radio',
  genre,
  country,
  icon,
  active = false,
  isPlaying = false,
  onSelect,
  onTogglePlay,
  className,
  actions,
}: StationCardProps): ReactNode {
  const badgeTone: BadgeTone =
    type === 'bgm' ? 'pink' : type === 'iptv' ? 'accent' : 'cyan'

  return (
    <div
      className={cn('m-station-card', className)}
      data-active={active ? 'true' : 'false'}
      data-playing={isPlaying ? 'true' : 'false'}
      data-type={type}
      onClick={onSelect}
    >
      <div className="m-station-card-left">
        <Glyph code={icon || TYPE_CODE[type]} tone={type === 'bgm' ? 'pink' : type === 'iptv' ? 'accent' : 'cyan'} />
        <div className="m-station-info">
          <div className="m-station-head">
            <span className="m-station-name">{name}</span>
            {country ? <span className="m-station-country">[{country}]</span> : null}
          </div>
          {genre ? <span className="m-station-genre">{genre}</span> : null}
        </div>
      </div>

      <div className="m-station-card-right">
        <Badge tone={badgeTone}>{type.toUpperCase()}</Badge>
        {isPlaying ? <LiveDot state="live" /> : null}
        {actions ?? (
          onTogglePlay ? (
            <Button
              variant={isPlaying ? 'danger' : 'ghost'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onTogglePlay()
              }}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          ) : null
        )}
      </div>
    </div>
  )
}
