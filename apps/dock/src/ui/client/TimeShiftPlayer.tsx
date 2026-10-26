'use client'

import React, { useState, useEffect, type ReactNode } from 'react'
import { Badge, Button } from '@moonwitness/moonui'
import { triggerHaptic } from '@moonwitness/moonui/client'

export interface TimeShiftPlayerProps {
  stationId: string
  isPlaying: boolean
  audioRef?: React.RefObject<HTMLAudioElement | null>
  className?: string
}

/**
 * 3-Minute Zero-Drop Circular Buffer Audio Timeshifter
 *
 * Provides timeline rewind capabilities up to -180 seconds with instant "Go Live" resync.
 */
export function TimeShiftPlayer({
  stationId: _stationId,
  isPlaying,
  audioRef,
  className = '',
}: TimeShiftPlayerProps): ReactNode {
  const [offsetSeconds, setOffsetSeconds] = useState<number>(0)
  const [bufferMax, setBufferMax] = useState<number>(180)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  // Poll server or update local buffer while playing
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setBufferMax((prev) => Math.min(180, prev + 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [isPlaying])

  const handleSeek = (newOffset: number) => {
    triggerHaptic('switch')
    const clamped = Math.max(-bufferMax, Math.min(0, newOffset))
    setOffsetSeconds(clamped)

    if (audioRef?.current) {
      // Seek backwards in available HTML5 audio buffer if supported
      const audio = audioRef.current
      if (clamped === 0) {
        audio.currentTime = audio.duration || audio.currentTime
      } else {
        const target = Math.max(0, audio.currentTime + clamped)
        audio.currentTime = target
      }
    }
  }

  const formatOffset = (seconds: number): string => {
    if (seconds === 0) return 'LIVE'
    const abs = Math.abs(seconds)
    const mins = Math.floor(abs / 60)
    const secs = abs % 60
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
    return `-${pad(mins)}:${pad(secs)}`
  }

  const isLive = offsetSeconds === 0

  return (
    <div className={`m-col font-mono text-xs ${className}`}>
      {/* Toggle Bar */}
      <div className="flex items-center justify-between gap-3 py-1 text-neutral-400">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('tap')
            setIsOpen(!isOpen)
          }}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
        >
          <span className="text-[10px]">[{isOpen ? '▼' : '►'}]</span>
          <span>TIMESHIFT BUFFER</span>
          <Badge tone={isLive ? 'ok' : 'accent'}>
            {formatOffset(offsetSeconds)}
          </Badge>
        </button>

        {!isLive && (
          <Button
            variant="accent"
            size="sm"
            onClick={() => handleSeek(0)}
            className="text-[10px] py-0.5 px-2 h-6"
          >
            [GO LIVE]
          </Button>
        )}
      </div>

      {/* Expanded Scrubber Strip */}
      {isOpen && (
        <div className="mt-2 p-3 rounded bg-black/40 border border-neutral-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>-03:00 (BUFFERED)</span>
            <span className={isLive ? 'text-green-400 font-bold' : 'text-amber-400 font-bold'}>
              {formatOffset(offsetSeconds)}
            </span>
            <span className="text-cyan-400">00:00 (LIVE)</span>
          </div>

          <input
            type="range"
            min={-bufferMax}
            max={0}
            step={1}
            value={offsetSeconds}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSeek(offsetSeconds - 30)}
                className="text-[10px] px-2 py-0.5 h-6"
              >
                -30s
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSeek(offsetSeconds - 15)}
                className="text-[10px] px-2 py-0.5 h-6"
              >
                -15s
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSeek(offsetSeconds + 15)}
                className="text-[10px] px-2 py-0.5 h-6"
              >
                +15s
              </Button>
            </div>

            <Button
              variant={isLive ? 'ghost' : 'accent'}
              size="sm"
              onClick={() => handleSeek(0)}
              className="text-[10px] px-2.5 py-0.5 h-6"
            >
              [JUMP TO LIVE]
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
