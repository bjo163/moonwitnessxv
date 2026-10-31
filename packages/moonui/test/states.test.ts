import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { OutcomePanel, PanelState } from '../dist/index.js'

const copy = {
  loadingLabel: 'Reading',
  emptyTitle: 'Nothing here',
  emptyHint: 'Publish a record first.',
  errorMessage: 'The hub is unreachable.',
}

describe('PanelState contract', () => {
  it('announces loading politely and never dresses a placeholder up as a result', () => {
    const html = renderToStaticMarkup(
      React.createElement(PanelState, { state: 'loading', ...copy }, 'READY'),
    )
    assert.ok(html.includes('role="status"'))
    assert.ok(html.includes('aria-live="polite"'))
    assert.ok(html.includes('Reading'))
    assert.ok(html.includes('class="m-spinner"'), 'the shared spinner is the loading signal')
    assert.ok(!html.includes('READY'), 'children belong to the ready state only')
  })

  it('renders the empty state as words, not as an empty shell', () => {
    const html = renderToStaticMarkup(React.createElement(PanelState, { state: 'empty', ...copy }, null))
    assert.ok(html.includes('class="m-empty"'))
    assert.ok(html.includes('Nothing here'))
    assert.ok(html.includes('Publish a record first.'))
    assert.ok(!html.includes('role="alert"'), 'an empty result is not an error')
  })

  it('interrupts as an alert on error and prefers the resolved message', () => {
    const html = renderToStaticMarkup(
      React.createElement(PanelState, { state: 'error', ...copy, errorMessage: 'Hub 503' }, null),
    )
    assert.ok(html.includes('role="alert"'))
    assert.ok(html.includes('Hub 503'))
    assert.ok(html.includes('data-tone="hot"'), 'the error tone comes from the shared Alert')
    assert.ok(!html.includes('Nothing here'), 'the empty title may not stand in for a failure')
  })

  it('passes the caller content through untouched when ready', () => {
    const html = renderToStaticMarkup(
      React.createElement(PanelState, { state: 'ready', ...copy }, React.createElement('p', null, 'payload')),
    )
    assert.equal(html, '<p>payload</p>', 'ready adds no wrapper of its own')
  })

  it('renders a MoonUI placeholder under the loading label', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        PanelState,
        { state: 'loading', ...copy, loadingPlaceholder: React.createElement('span', { className: 'm-skeleton' }) },
        null,
      ),
    )
    assert.ok(html.includes('class="m-skeleton"'))
  })
})

describe('OutcomePanel contract', () => {
  it('routes every outcome through the one PanelState contract', () => {
    const loading = renderToStaticMarkup(
      React.createElement(OutcomePanel, { outcome: { state: 'loading' }, copy, children: () => null }),
    )
    assert.ok(loading.includes('role="status"'))

    const empty = renderToStaticMarkup(
      React.createElement(OutcomePanel, { outcome: { state: 'empty' }, copy, children: () => null }),
    )
    assert.ok(empty.includes('class="m-empty"'))

    const error = renderToStaticMarkup(
      React.createElement(OutcomePanel, {
        outcome: { state: 'error', message: 'read failed' },
        copy,
        children: () => null,
      }),
    )
    assert.ok(error.includes('role="alert"'))
    assert.ok(error.includes('read failed'), 'the outcome message wins over the catalogue sentence')

    const ready = renderToStaticMarkup(
      React.createElement(OutcomePanel, {
        outcome: { state: 'ready', value: 7 },
        copy,
        children: (value: number) => React.createElement('b', null, String(value)),
      }),
    )
    assert.equal(ready, '<b>7</b>')
  })
})
