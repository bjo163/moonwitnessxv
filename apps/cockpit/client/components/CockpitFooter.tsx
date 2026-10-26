import type { ReactNode } from 'react'
import { CrtBackdrop, Kbd } from '@moonwitness/moonui'

export interface CockpitFooterProps {
  crtShader: boolean
}

export function CockpitFooter({ crtShader }: CockpitFooterProps): ReactNode {
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
          <span><Kbd>Space</Kbd> Play/Pause</span>
          <span><Kbd>M</Kbd> Mute</span>
          <span><Kbd>[</Kbd> / <Kbd>]</Kbd> Channel</span>
          <span><Kbd>P</Kbd> PiP</span>
          <span><Kbd>1</Kbd>–<Kbd>6</Kbd> Tabs</span>
          <span><Kbd>~</Kbd> Toggle Terminal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>MOONDECK SUPERVISOR v15.4</span>
          <span style={{ color: 'var(--cyan)', fontWeight: 800 }}>MS-EDGE WEBVIEW2</span>
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
