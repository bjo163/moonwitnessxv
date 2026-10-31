import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StatStrip } from '../dist/index.js'

const items = [
  { value: '120', label: 'Stations in catalog' },
  { value: '18', label: 'Countries represented' },
]

describe('StatStrip contract', () => {
  it('renders the value/label anatomy inside one strip', () => {
    const html = renderToStaticMarkup(React.createElement(StatStrip, { items }))
    assert.ok(html.startsWith('<div '), 'the default band element is a div')
    assert.ok(html.includes('class="m-stat-strip"'))
    assert.equal((html.match(/class="m-stat-strip-item"/g) ?? []).length, 2)
    assert.ok(html.includes('<b>120</b><span>Stations in catalog</span>'), 'the value leads and the label names it')
  })

  it('defaults to the row orientation and can be asked for the column variant', () => {
    const row = renderToStaticMarkup(React.createElement(StatStrip, { items }))
    assert.ok(row.includes('data-orientation="row"'), 'a band is horizontal unless the caller says otherwise')

    const column = renderToStaticMarkup(React.createElement(StatStrip, { items, orientation: 'column' }))
    assert.ok(column.includes('data-orientation="column"'), 'a narrow card asks the primitive, it does not restyle it')
    assert.ok(!column.includes('style='), 'orientation is a contract, not an inline override')
  })

  it('renders as a section when the page needs a landmark', () => {
    const html = renderToStaticMarkup(React.createElement(StatStrip, { items, as: 'section' }))
    assert.ok(html.startsWith('<section '))
    assert.ok(html.includes('class="m-stat-strip"'))
  })

  it('composes consumer band classes instead of replacing them', () => {
    const html = renderToStaticMarkup(React.createElement(StatStrip, { items, className: 'su-ggs__stats' }))
    assert.ok(html.includes('class="m-stat-strip su-ggs__stats"'), 'the page owns the band, MoonUI owns the anatomy')
  })

  it('renders ReactNode values for localized numbers and no raw hex', () => {
    const html = renderToStaticMarkup(
      React.createElement(StatStrip, { items: [{ value: React.createElement('b', null, '1.234'), label: 'Total' }] }),
    )
    assert.ok(html.includes('<b><b>1.234</b></b>'), 'a pre-formatted node passes straight through')
    assert.ok(!/#[0-9a-fA-F]{3,8}/.test(html))
  })
})
