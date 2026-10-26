import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  Button,
  LinkButton,
  Tooltip,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  GlitchText,
  CyberFrame,
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
})
