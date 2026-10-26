'use client'

import React, { useEffect, useState, useRef, type ReactNode } from 'react'
import { triggerHaptic } from './haptics.js'
import { Modal, KbdLegend } from './modal.js'

export interface CommandItem {
  id: string
  label: string
  category?: string
  shortcut?: string
  icon?: ReactNode
  onSelect: () => void
}

export interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  commands: CommandItem[]
  placeholder?: string
}

/**
 * Command Palette (Ctrl+K Spotlight Quick-Action Launcher)
 */
export function CommandPalette({
  isOpen,
  onClose,
  commands,
  placeholder = 'Type a command, channel, or jump target...',
}: CommandPaletteProps): ReactNode {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = commands.filter((cmd) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      cmd.label.toLowerCase().includes(q) ||
      (cmd.category && cmd.category.toLowerCase().includes(q))
    )
  })

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      triggerHaptic('tap')
      setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      triggerHaptic('tap')
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, filtered.length - 1)))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = filtered[selectedIndex]
      if (selected) {
        triggerHaptic('switch')
        selected.onSelect()
        onClose()
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SYSTEM COMMAND PALETTE"
      maxWidth="lg"
      footer={
        <KbdLegend
          items={[
            { key: '↑↓', label: 'Navigate' },
            { key: 'Enter', label: 'Execute' },
            { key: 'Esc', label: 'Dismiss' },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-3" onKeyDown={handleKeyDown}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3.5 py-2.5 font-mono text-sm bg-black/60 border border-neutral-700 rounded text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        <div className="max-h-72 overflow-y-auto flex flex-col gap-1 pr-1 font-mono text-sm">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 font-mono text-xs">
              No matching commands or channels found.
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('switch')
                    cmd.onSelect()
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                      : 'text-neutral-300 hover:bg-neutral-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {cmd.icon && <span className="opacity-75">{cmd.icon}</span>}
                    <span className="font-medium">{cmd.label}</span>
                    {cmd.category && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                        {cmd.category}
                      </span>
                    )}
                  </div>
                  {cmd.shortcut && (
                    <kbd className="text-[10px] text-neutral-400 font-mono">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
    </Modal>
  )
}
