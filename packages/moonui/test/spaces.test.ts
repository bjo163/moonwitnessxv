import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { SpaceCard, SpaceGrid } from '../dist/index.js'

const card = {
  tone: 'accent' as const,
  icon: 'read' as const,
  title: 'Read',
  description: 'Published records, editions and sources.',
  status: 'REAL' as const,
  statusText: 'NYATA',
  openLabel: 'Open',
  href: '/id/reader',
}

describe('SpaceCard contract', () => {
  it('renders one native anchor carrying the shared space anatomy', () => {
    const html = renderToStaticMarkup(React.createElement(SpaceCard, card))
    assert.ok(html.startsWith('<a '), 'the card is the anchor itself, so focus and Enter stay native')
    assert.ok(html.includes('class="m-space-card"'))
    assert.ok(html.includes('href="/id/reader"'))
    assert.ok(html.includes('data-tone="accent"'))
    assert.ok(html.includes('class="m-space-title">Read</h3>'))
    assert.ok(html.includes('class="m-space-body">Published records, editions and sources.</p>'))
    assert.ok(html.includes('class="m-space-open">Open'))
  })

  it('states the status as a word, never as a colour or a counter', () => {
    const html = renderToStaticMarkup(React.createElement(SpaceCard, card))
    assert.ok(html.includes('NYATA'), 'the localized status word is rendered by the card')
    assert.ok(!/m-space-card[^>]*data-status/.test(html), 'status is expressed through the Tape, not a second attribute')
  })

  it('keeps the glyph decorative and accepts an optional note', () => {
    const html = renderToStaticMarkup(React.createElement(SpaceCard, { ...card, note: 'Section 4 of ADR-0009' }))
    assert.ok(html.includes('class="m-space-icon" aria-hidden="true"'), 'the icon is artwork, not content')
    assert.ok(html.includes('class="m-space-note">Section 4 of ADR-0009</p>'))
  })

  it('renders no app-local class and no raw hex literal', () => {
    const html = renderToStaticMarkup(React.createElement(SpaceCard, card))
    assert.doesNotMatch(html, /\bdk-space/, 'Dock no longer owns a space-card anatomy')
    assert.ok(!/#[0-9a-fA-F]{3,8}/.test(html), 'colour comes from tokens in moon.css')
  })
})

describe('SpaceGrid contract', () => {
  it('renders the four-space grid behind one labelled section', () => {
    const html = renderToStaticMarkup(
      React.createElement(SpaceGrid, {
        heading: 'Four spaces',
        headingId: 'spaces-title',
        spaces: [card, { ...card, tone: 'cyan', icon: 'explore', title: 'Explore', href: '/id/terms' }],
      }),
    )
    assert.ok(html.includes('aria-labelledby="spaces-title"'))
    assert.ok(html.includes('<h2 id="spaces-title" class="m-space-heading"'))
    assert.ok(html.includes('class="m-space-grid"'))
    assert.equal((html.match(/class="m-space-card"/g) ?? []).length, 2)
    assert.ok(html.includes('href="/id/terms"'))
  })

  it('omits the heading landmark when the surface already owns the title', () => {
    const html = renderToStaticMarkup(React.createElement(SpaceGrid, { spaces: [card] }))
    assert.ok(!html.includes('aria-labelledby'), 'no heading means no labelling contract to promise')
    assert.ok(!html.includes('<h2'), 'the grid never invents a heading of its own')
    assert.ok(html.includes('class="m-space-card"'))
  })

  it('composes consumer layout classes instead of replacing them', () => {
    const html = renderToStaticMarkup(React.createElement(SpaceGrid, { spaces: [card], className: 'dk-stack' }))
    assert.ok(html.includes('class="m-stack dk-stack"'))
  })
})
