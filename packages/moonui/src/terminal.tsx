import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from './cn.js'

export interface TerminalLine {
  id: string
  timestamp: string
  tag: string
  level: 'info' | 'warn' | 'error'
  message: string
}

export function TerminalViewer({
  lines,
  autoScroll = true,
  maxHeight,
  className,
}: {
  lines: TerminalLine[]
  autoScroll?: boolean
  maxHeight?: number | string
  className?: string
}): ReactNode {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines, autoScroll])

  return (
    <div
      ref={scrollRef}
      className={cn('m-terminal-viewer', className)}
      style={maxHeight ? { maxHeight } : undefined}
    >
      {lines.map((line) => {
        const time = line.timestamp.includes(' ')
          ? line.timestamp.split(' ')[1]
          : line.timestamp

        return (
          <div key={line.id} className={cn('m-terminal-line', `m-terminal-${line.level}`)}>
            <span className="m-terminal-time">{time}</span>
            <span className="m-terminal-tag">{line.tag.toUpperCase()}</span>
            <span className="m-terminal-msg">{line.message}</span>
          </div>
        )
      })}
    </div>
  )
}
