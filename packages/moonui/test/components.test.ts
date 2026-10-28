import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MtsTelemetryClock } from '../dist/client/index.js'
import {
  Button,
  LinkButton,
  Tooltip,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  GlitchText,
  CyberFrame,
  Crown,
  BrandLogo,
  DistressedBorder,
} from '../dist/index.js'

describe('MoonUI Core Primitives SSR Rendering', () => {
  it('renders standard and cyber variant Button', () => {
    const normalHtml = renderToStaticMarkup(
      React.createElement(Button, { variant: 'primary', size: 'md' }, 'Press')
    )
    assert.ok(normalHtml.includes('class="m-btn"'))
    assert.ok(normalHtml.includes('data-variant="primary"'))
    assert.ok(normalHtml.includes('Press'))

    const cyberHtml = renderToStaticMarkup(
      React.createElement(Button, { variant: 'cyber', size: 'lg' }, 'Engage')
    )
    assert.ok(cyberHtml.includes('data-variant="cyber"'))
    assert.ok(cyberHtml.includes('data-size="lg"'))
  })

  it('renders Button with loading state and disabled attribute', () => {
    const loadingHtml = renderToStaticMarkup(
      React.createElement(Button, { loading: true }, 'Transmitting')
    )
    assert.ok(loadingHtml.includes('disabled=""'))
    assert.ok(loadingHtml.includes('aria-busy="true"'))
    assert.ok(loadingHtml.includes('class="m-btn-loader"'))
    assert.ok(loadingHtml.includes('Transmitting'))
  })

  it('renders LinkButton with href and attributes', () => {
    const linkHtml = renderToStaticMarkup(
      React.createElement(LinkButton, { href: '/denpa', variant: 'accent' }, 'Denpa')
    )
    assert.ok(linkHtml.includes('href="/denpa"'))
    assert.ok(linkHtml.includes('data-variant="accent"'))
    assert.ok(linkHtml.includes('Denpa'))
  })

  it('renders Tooltip with role="tooltip" and positioning', () => {
    const tooltipHtml = renderToStaticMarkup(
      React.createElement(
        Tooltip,
        { content: 'Radio Frequency', position: 'bottom' },
        React.createElement('span', null, '1420 MHz')
      )
    )
    assert.ok(tooltipHtml.includes('class="m-tooltip-wrapper"'))
    assert.ok(tooltipHtml.includes('role="tooltip"'))
    assert.ok(tooltipHtml.includes('data-pos="bottom"'))
    assert.ok(tooltipHtml.includes('Radio Frequency'))
    assert.ok(tooltipHtml.includes('1420 MHz'))
  })

  it('renders Skeleton loaders with dimensions and shimmering classes', () => {
    const skelHtml = renderToStaticMarkup(
      React.createElement(Skeleton, { width: 120, height: 20, rounded: true })
    )
    assert.ok(skelHtml.includes('class="m-skeleton rounded-full"'))
    assert.ok(skelHtml.includes('width:120px'))
    assert.ok(skelHtml.includes('height:20px'))
    assert.ok(skelHtml.includes('aria-hidden="true"'))
  })

  it('renders CardSkeleton and TableSkeleton structure', () => {
    const cardSkel = renderToStaticMarkup(React.createElement(CardSkeleton, null))
    assert.ok(cardSkel.includes('class="m-card"'))
    assert.ok(cardSkel.includes('class="m-skeleton"'))

    const tableSkel = renderToStaticMarkup(
      React.createElement(TableSkeleton, { rows: 3, cols: 2 })
    )
    assert.ok(tableSkel.includes('class="m-table-wrap"'))
    assert.ok(tableSkel.includes('class="m-skeleton"'))
  })

  it('renders GlitchText with data-text attribute for CSS pseudo-element replication', () => {
    const glitchHtml = renderToStaticMarkup(
      React.createElement(GlitchText, { text: 'NEOMURAMASA', as: 'h2' })
    )
    assert.ok(glitchHtml.startsWith('<h2'))
    assert.ok(glitchHtml.includes('class="m-glitch"'))
    assert.ok(glitchHtml.includes('data-text="NEOMURAMASA"'))
    assert.ok(glitchHtml.includes('NEOMURAMASA</h2>'))
  })

  it('renders CyberFrame container with tone styling', () => {
    const frameHtml = renderToStaticMarkup(
      React.createElement(CyberFrame, { tone: 'pink' }, 'Tactical HUD')
    )
    assert.ok(frameHtml.includes('class="m-cyber-frame"'))
    assert.ok(frameHtml.includes('data-tone="pink"'))
    assert.ok(frameHtml.includes('Tactical HUD'))
  })

  it('renders DistressedBorder with the shared torn-edge class contract', () => {
    const html = renderToStaticMarkup(
      React.createElement(DistressedBorder, { tone: 'pink', edge: 'cut', className: 'hq-panel' }, 'Transmission 001')
    )
    assert.ok(html.includes('class="m-distressed hq-panel"'), 'composes with consumer classes, no second renderer')
    assert.ok(html.includes('data-tone="pink"'))
    assert.ok(html.includes('data-edge="cut"'))
    assert.ok(html.includes('Transmission 001'))

    const defaults = renderToStaticMarkup(React.createElement(DistressedBorder, null, 'plain'))
    assert.ok(defaults.includes('class="m-distressed"'))
    assert.ok(defaults.includes('data-tone="chalk"'))
    assert.ok(defaults.includes('data-edge="torn"'))
  })

  it('keeps the distressed edge purely decorative and token-coloured', () => {
    const html = renderToStaticMarkup(React.createElement(DistressedBorder, { tone: 'cyan' }, 'Signal'))
    assert.ok(
      html.includes('class="m-distressed-edge" aria-hidden="true"'),
      'the torn outline is a graphic, never read out'
    )
    assert.ok(!/#[0-9a-fA-F]{3,8}/.test(html), 'the frame exposes no raw hex literal')
    assert.ok(!html.includes('style='), 'colour comes from moon.css classes and semantic tokens, not inline styles')
  })

  it('renders Crown and BrandLogo through currentColor so the palette stays in tokens', () => {
    const crownHtml = renderToStaticMarkup(React.createElement(Crown, { tone: 'cyan', size: 'lg' }))
    assert.ok(crownHtml.includes('stroke="currentColor"'))
    assert.ok(crownHtml.includes('data-tone="cyan"'))
    assert.ok(crownHtml.includes('data-size="lg"'))
    assert.ok(crownHtml.includes('aria-hidden="true"'))
    assert.ok(!/#[0-9a-fA-F]{3,8}/.test(crownHtml), 'the crown carries no hex of its own')

    const brandHtml = renderToStaticMarkup(
      React.createElement(BrandLogo, { href: '/denpa', subtitle: 'Empire of static', size: 'lg' })
    )
    assert.ok(brandHtml.includes('class="m-brand-wrap"'))
    assert.ok(brandHtml.includes('data-size="lg"'))
    assert.ok(brandHtml.includes('href="/denpa"'), 'BrandLogo reuses the one Crown primitive')
    assert.ok(brandHtml.includes('<svg'))
  })
})

describe('MtsTelemetryClock hydration contract', () => {
  it('renders a stable placeholder before client telemetry starts', () => {
    const html = renderToStaticMarkup(React.createElement(MtsTelemetryClock))
    assert.ok(html.includes('--:--:-- UTC'))
    assert.doesNotMatch(html, /\b\d{2}:\d{2}:\d{2} UTC\b/)
    assert.ok(!html.includes('MTS '), 'phase data waits until the client has a stable clock')
  })
})

describe('Server-safe button contract', () => {
  // A Server Component may render Button and LinkButton, and React refuses to
  // serialise a function prop onto a host element — so the handler has to be
  // genuinely absent, not merely inert.
  it('carries no handler when the caller asked for no interaction', () => {
    const plain = Button({ type: 'submit' }, 'Search') as React.ReactElement<{ onClick?: unknown }>
    assert.equal(plain.props.onClick, undefined, 'a server-rendered Button must not expose onClick')

    const link = LinkButton({ href: '/reader/compare' }, 'Compare') as React.ReactElement<{ onClick?: unknown }>
    assert.equal(link.props.onClick, undefined, 'a server-rendered LinkButton must not expose onClick')
  })

  it('keeps the handler when a caller or a haptic pattern needs one', () => {
    const onClick = (): void => {}
    const interactive = Button({ onClick }, 'Copy') as React.ReactElement<{ onClick?: unknown }>
    assert.equal(typeof interactive.props.onClick, 'function')

    const hapticOnly = LinkButton({ href: '/id', haptic: true }, 'Open') as React.ReactElement<{ onClick?: unknown }>
    assert.equal(typeof hapticOnly.props.onClick, 'function', 'haptic alone still earns its handler')
  })
})
