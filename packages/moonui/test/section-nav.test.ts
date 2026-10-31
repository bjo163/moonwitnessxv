import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { SectionNav } from '../dist/index.js'

const items = [
  { key: 'queue', label: 'Queue', href: '/orbit' },
  { key: 'inspectors', label: 'Inspectors', href: '/orbit/inspectors' },
  { key: 'spatial', label: 'Spatial', href: '/orbit/spatial' },
]

describe('SectionNav contract', () => {
  it('renders one nav landmark with an accessible name', () => {
    const html = renderToStaticMarkup(React.createElement(SectionNav, { items, activeKey: 'queue', label: 'Orbit sections' }))
    assert.ok(html.startsWith('<nav '), 'a section nav is the landmark')
    assert.ok(html.includes('class="m-section-nav"'))
    assert.ok(html.includes('aria-label="Orbit sections"'))
    assert.ok(html.includes('class="m-section-nav-list"'))
    assert.equal(html.match(/<nav\b/g)?.length, 1, 'the section nav never nests a second landmark')
  })

  it('marks exactly the active item with aria-current="page"', () => {
    const html = renderToStaticMarkup(React.createElement(SectionNav, { items, activeKey: 'inspectors' }))
    const links = [...html.matchAll(/<a\b([^>]*)>/g)].map((match) => match[1] ?? '')
    assert.equal(links.length, items.length, 'every section keeps a link')
    const current = links.filter((attrs) => attrs.includes('aria-current="page"'))
    assert.equal(current.length, 1, 'one current page, never zero and never two')
    assert.ok(current[0]?.includes('href="/orbit/inspectors"'), 'the current marker lands on the active key')
    assert.equal((html.match(/data-active="true"/g) ?? []).length, 1)
  })

  it('omits aria-current entirely when no key is active', () => {
    const html = renderToStaticMarkup(React.createElement(SectionNav, { items }))
    assert.doesNotMatch(html, /aria-current/, 'an inactive nav promises no current page')
    assert.equal((html.match(/data-active="false"/g) ?? []).length, items.length)
  })

  it('falls back to a neutral accessible name and composes consumer classes', () => {
    const html = renderToStaticMarkup(React.createElement(SectionNav, { items, className: 'orbit-section-nav' }))
    assert.ok(html.includes('aria-label="Section"'))
    assert.ok(html.includes('class="m-section-nav orbit-section-nav"'))
  })

  it('carries no app-local class and stays server-safe', () => {
    const html = renderToStaticMarkup(React.createElement(SectionNav, { items, activeKey: 'queue' }))
    assert.doesNotMatch(html, /orbit-nav/, 'Orbit no longer owns a nav anatomy')
    assert.equal(typeof SectionNav, 'function')
  })
})
