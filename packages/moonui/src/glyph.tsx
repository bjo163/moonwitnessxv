import type { ReactNode } from 'react'
import { cn } from './cn.js'

export type GlyphTone = 'pink' | 'cyan' | 'accent' | 'ok' | 'hot' | 'moon' | 'ink'

/**
 * Text monogram tile. The design system's replacement for emoji and icon fonts:
 * a 2-3 letter code set in mono caps on a flat colour block with a hard offset
 * shadow. It reads as a zine label, scans fast in dense lists, and never
 * depends on a platform emoji font.
 */
export function Glyph({
  code,
  tone = 'pink',
  size = 'md',
  className,
}: {
  code: string
  tone?: GlyphTone
  size?: 'sm' | 'md' | 'lg'
  className?: string
}): ReactNode {
  return (
    <span className={cn('m-glyph', className)} data-tone={tone} data-size={size} aria-hidden="true">
      {code.slice(0, 3)}
    </span>
  )
}

/** Keyboard shortcut cap, e.g. <Kbd>Ctrl</Kbd><Kbd>K</Kbd> */
export function Kbd({ children }: { children: ReactNode }): ReactNode {
  return <kbd className="m-kbd">{children}</kbd>
}

/** Pure-CSS chevron. Replaces text arrows so direction never depends on a font. */
export function Chevron({
  dir = 'right',
  className,
}: {
  dir?: 'left' | 'right' | 'up' | 'down'
  className?: string
}): ReactNode {
  return <span className={cn('m-chev', className)} data-dir={dir} aria-hidden="true" />
}
