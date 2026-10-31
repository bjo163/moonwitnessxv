import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ObjectWatchlist } from '../dist/client/index.js'

const copy = {
  title: 'Tracked objects',
  subtitle: 'Consumer references only.',
  refresh: 'Refresh all',
  keyColumn: 'Object key',
  sizeColumn: 'Size',
  typeColumn: 'MIME',
  stateColumn: 'Read state',
  digestLabel: 'SHA-256 digest to track',
  digestPlaceholder: '64-character sha256 digest',
  track: 'Track',
  stopTracking: 'Stop tracking selected',
  stopTrackingHint: 'Removes the local reference only.',
  emptyTitle: 'No tracked objects',
  emptyHint: 'Upload a file or paste a digest to track it.',
}

const rows = [
  {
    key: 'sha256/aaa',
    digest: 'a'.repeat(64),
    label: 'sha256/aaa…aaaaaa',
    size: '2.0 KB',
    contentType: 'image/png',
    stateLine: 'metadata read — operator @ 2026-10-27T10:00:00.000Z',
  },
  {
    key: 'sha256/bbb',
    digest: 'b'.repeat(64),
    label: 'sha256/bbb…bbbbbb',
    size: '—',
    contentType: 'audio/flac',
    stateLine: 'unreadable: 404 not found',
  },
]

const noop = (): void => {}

function render(overrides: Record<string, unknown> = {}): string {
  return renderToStaticMarkup(
    React.createElement(ObjectWatchlist, {
      rows,
      copy,
      selectedKey: null,
      busy: false,
      onSelect: noop,
      onTrack: async () => null,
      onUntrack: noop,
      onRefreshAll: noop,
      ...overrides,
    }),
  )
}

describe('ObjectWatchlist contract', () => {
  it('renders the words the surface passed in, and none of its own', () => {
    const html = render()
    assert.ok(html.includes('Tracked objects'))
    assert.ok(html.includes('Consumer references only.'))
    assert.ok(html.includes('>Refresh all</button>'))
    assert.ok(html.includes('aria-label="SHA-256 digest to track"'))
    assert.ok(html.includes('64-character sha256 digest'))
    for (const label of ['Object key', 'Size', 'MIME', 'Read state']) {
      assert.ok(html.includes(`>${label}</th>`), `column ${label} must come from the copy the surface passed`)
    }
  })

  it('prints finished values and never re-derives a digest or a byte count', () => {
    const html = render()
    assert.ok(html.includes('sha256/aaa…aaaaaa'))
    assert.ok(html.includes('2.0 KB'))
    assert.ok(html.includes('metadata read — operator @ 2026-10-27T10:00:00.000Z'))
    assert.ok(html.includes('unreadable: 404 not found'))
  })

  it('marks the selected row through the shared button variant, not a local class', () => {
    const html = render({ selectedKey: 'sha256/aaa' })
    assert.ok(html.includes('class="m-btn" data-variant="primary"'))
    assert.ok(html.includes('data-variant="ghost"'), 'unselected rows stay quiet')
    assert.doesNotMatch(html, /echolog-/, 'the view carries no app-local class')
  })

  it('states the empty catalog instead of rendering an empty shell', () => {
    const html = render({ rows: [] })
    assert.ok(html.includes('No tracked objects'))
    assert.ok(html.includes('Upload a file or paste a digest to track it.'))
    assert.doesNotMatch(html, /<table/, 'no table may render beside an explicit empty state')
  })

  it('refuses a destructive action that has no target', () => {
    const idle = render({ selectedKey: null })
    assert.match(idle, /disabled=""[^>]*>Stop tracking selected/)

    const selected = render({ selectedKey: 'sha256/aaa' })
    assert.ok(selected.includes('>Stop tracking selected</button>'))
    assert.ok(selected.includes('Removes the local reference only.'))
  })

  it('keeps the refresh action disabled while the surface is busy', () => {
    const html = render({ busy: true })
    assert.match(html, /disabled=""[^>]*>Refresh all/)
  })
})
