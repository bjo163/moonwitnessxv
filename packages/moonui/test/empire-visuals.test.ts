import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { EmpireOrbitArtwork, IconEmpireMark, SiteBrand, SiteNotFound } from '../dist/index.js'

describe('Empire visual primitives', () => {
  it('renders the Empire brand mark as a decorative, token-colored SVG', () => {
    const html = renderToStaticMarkup(React.createElement(IconEmpireMark, { size: 30 }))
    assert.match(html, /<svg[^>]*aria-hidden="true"/)
    assert.match(html, /fill="var\(--brand\)"/)
    assert.match(html, /fill="var\(--brand-2\)"/)
    assert.doesNotMatch(html, /#[0-9a-f]{3,8}/i)
  })

  it('selects the Empire mark for Empire brand copy and keeps the moon default', () => {
    const empire = renderToStaticMarkup(
      React.createElement(SiteBrand, { brand: { name: 'EMPIRE', tagline: 'OF THE LIGHT', homeHref: '/id', mark: 'empire' } }),
    )
    const defaultBrand = renderToStaticMarkup(
      React.createElement(SiteBrand, { brand: { name: 'MOONWITNESS', tagline: 'XV', homeHref: '/' } }),
    )
    assert.match(empire, /class="su-brand__mark-wrap" data-mark="empire"/)
    assert.match(empire, /class="su-brand__mark"/)
    assert.match(empire, /fill="var\(--brand-2\)"/)
    assert.match(defaultBrand, /class="su-brand__mark-wrap" data-mark="moon"/)
    assert.doesNotMatch(defaultBrand, /data-mark="empire"/)
  })

  it('renders the Empire orbit illustration as a self-contained decorative vector', () => {
    const html = renderToStaticMarkup(React.createElement(EmpireOrbitArtwork))
    assert.match(html, /class="emp-orbit-svg"[^>]*aria-hidden="true"/)
    assert.match(html, /emp-orbit-svg__portal/)
    assert.match(html, /emp-orbit-svg__light/)
    assert.match(html, /emp-orbit-svg__node--accent/)
    assert.doesNotMatch(html, /(?:href|xlink:href)="(?:https?:)?\/\//i)
    assert.doesNotMatch(html, /#[0-9a-f]{3,8}/i)
  })

  it('renders not-found structure, route links, and language metadata from copy', () => {
    const html = renderToStaticMarkup(React.createElement(SiteNotFound, {
      copy: {
        lang: 'en',
        eyebrow: '404 · NOT FOUND',
        title: 'Nothing here yet.',
        description: 'Halaman ini belum tersedia.',
        descriptionLang: 'id',
        linksLabel: 'Choose a home page',
        links: [
          { href: '/id', label: 'Beranda Indonesia', lang: 'id' },
          { href: '/en', label: 'English home', lang: 'en' },
        ],
      },
    }))
    assert.match(html, /<main class="su-not-found" lang="en" aria-labelledby="su-not-found-title">/)
    assert.match(html, /<h1 id="su-not-found-title">Nothing here yet\.<\/h1>/)
    assert.match(html, /<p class="su-not-found__description" lang="id">Halaman ini belum tersedia\.<\/p>/)
    assert.match(html, /href="\/id" lang="id"/)
    assert.match(html, /aria-label="Choose a home page"/)
  })
})
