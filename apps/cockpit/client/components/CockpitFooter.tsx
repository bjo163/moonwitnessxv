import type { ReactNode } from 'react'
import { CrtBackdrop, Kbd } from '@moonwitness/moonui'
import type { CockpitCopyCatalog } from '../lib/cockpit-copy'

export interface CockpitFooterProps {
  crtShader: boolean
  copy: CockpitCopyCatalog
  onOpenHelp: () => void
}

export function CockpitFooter({
  crtShader,
  copy,
  onOpenHelp,
}: CockpitFooterProps): ReactNode {
  return (
    <>
      <footer
        style={{
          height: 28,
          background: 'var(--ink)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--muted)',
          zIndex: 20,
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span><Kbd>Space</Kbd> {copy.shortcutPlayPause}</span>
          <span><Kbd>M</Kbd> {copy.shortcutMute}</span>
          <span><Kbd>[</Kbd> / <Kbd>]</Kbd> {copy.shortcutChannel}</span>
          <span><Kbd>1</Kbd>–<Kbd>6</Kbd> {copy.shortcutTabs}</span>
          <span><Kbd>P</Kbd> {copy.shortcutPorts}</span>
          <button
            type="button"
            onClick={onOpenHelp}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              color: 'var(--cyan)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            title={copy.shortcutHelp}
          >
            <Kbd>?</Kbd> {copy.shortcutHelp}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>{copy.runtimeInfo}</span>
          <span style={{ color: 'var(--cyan)', fontWeight: 800 }}>MS-EDGE / VITE</span>
        </div>
      </footer>

      {/* CRT Phosphor Scanline Shader Layer */}
      {crtShader ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 99999,
          }}
        >
          <CrtBackdrop scanlines vignette tint="cyan" />
        </div>
      ) : null}
    </>
  )
}
