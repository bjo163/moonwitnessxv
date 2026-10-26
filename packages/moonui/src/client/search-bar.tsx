'use client'

import React, { useEffect, useRef, useState, type ReactNode } from 'react'
import { triggerHaptic } from './haptics.js'

export interface SearchFilterBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  tags?: string[]
  selectedTag?: string
  onSelectTag?: (tag: string) => void
  resultCount?: number
  className?: string
}

/**
 * High-Density Tactical Search & Filter Bar
 *
 * Automatically listens for the '/' keyboard shortcut to focus search input.
 */
export function SearchFilterBar({
  value,
  onChange,
  placeholder = 'Search stations, tags, frequencies...',
  tags = [],
  selectedTag,
  onSelectTag,
  resultCount,
  className = '',
}: SearchFilterBarProps): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Listen for '/' key globally to focus input
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        triggerHaptic('tap')
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [])

  return (
    <div className={`flex flex-col gap-2 font-mono text-xs ${className}`}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-3 pr-20 py-2 bg-black/60 border border-neutral-700 rounded text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
        />

        <div className="absolute right-2.5 flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap')
                onChange('')
                inputRef.current?.focus()
              }}
              className="text-[10px] text-neutral-400 hover:text-white px-1 rounded bg-neutral-800 transition-colors"
              title="Clear search"
            >
              [CLR]
            </button>
          )}

          {!isFocused && !value && (
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-400 border border-neutral-700">
              /
            </kbd>
          )}

          {typeof resultCount === 'number' && (
            <span className="text-[11px] text-cyan-400">
              {resultCount}
            </span>
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {tags.map((tag) => {
            const isSelected = selectedTag === tag
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  triggerHaptic('tap')
                  onSelectTag?.(isSelected ? '' : tag)
                }}
                className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
