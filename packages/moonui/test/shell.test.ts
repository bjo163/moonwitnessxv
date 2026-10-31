import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AppShell } from '../dist/index.js'

describe('AppShell', () => {
  it('renders with all required landmarks', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        AppShell,
        {
          header: React.createElement('div', null, 'Header'),
          footer: React.createElement('div', null, 'Footer'),
        },
        React.createElement('div', null, 'Content')
      )
    )
    
    assert.ok(html.includes('class="m-shell"'))
    assert.ok(html.includes('<header class="m-shell-header">'))
    assert.ok(html.includes('<main class="m-shell-main"'))
    assert.ok(html.includes('<footer class="m-shell-footer">'))
    assert.ok(html.includes('Header'))
    assert.ok(html.includes('Content'))
    assert.ok(html.includes('Footer'))
  })

  it('renders skip link with default label', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        AppShell,
        {
          header: React.createElement('div', null, 'Header'),
          footer: React.createElement('div', null, 'Footer'),
        },
        React.createElement('div', null, 'Content')
      )
    )
    
    assert.ok(html.includes('<a class="m-skip" href="#main">'))
    assert.ok(html.includes('Skip to content'))
  })

  it('renders skip link with custom label', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        AppShell,
        {
          header: React.createElement('div', null, 'Header'),
          footer: React.createElement('div', null, 'Footer'),
          skipToContentLabel: 'Lewati ke konten',
        },
        React.createElement('div', null, 'Content')
      )
    )
    
    assert.ok(html.includes('Lewati ke konten'))
  })

  it('renders optional nav when provided', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        AppShell,
        {
          header: React.createElement('div', null, 'Header'),
          nav: React.createElement('ul', null, React.createElement('li', null, 'Nav Item')),
          footer: React.createElement('div', null, 'Footer'),
        },
        React.createElement('div', null, 'Content')
      )
    )
    
    assert.ok(html.includes('<nav class="m-shell-nav" aria-label="Primary">'))
    assert.ok(html.includes('Nav Item'))
  })

  it('does not render nav when not provided', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        AppShell,
        {
          header: React.createElement('div', null, 'Header'),
          footer: React.createElement('div', null, 'Footer'),
        },
        React.createElement('div', null, 'Content')
      )
    )
    
    assert.ok(!html.includes('<nav'))
  })

  it('injects experience tokens when experience prop is provided', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        AppShell,
        {
          header: React.createElement('div', null, 'Header'),
          footer: React.createElement('div', null, 'Footer'),
          experience: 'reader',
        },
        React.createElement('div', null, 'Content')
      )
    )
    
    assert.ok(html.includes('data-experience="reader"'))
    assert.ok(html.includes('style="--experience-measure:'))
    assert.ok(html.includes('--experience-max-width:'))
    assert.ok(html.includes('--experience-density:'))
  })

  it('does not inject experience tokens when experience prop is not provided', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        AppShell,
        {
          header: React.createElement('div', null, 'Header'),
          footer: React.createElement('div', null, 'Footer'),
        },
        React.createElement('div', null, 'Content')
      )
    )
    
    assert.ok(!html.includes('data-experience='))
    assert.ok(!html.includes('--experience-measure:'))
  })

  it('renders main with id="main" and tabIndex={-1}', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        AppShell,
        {
          header: React.createElement('div', null, 'Header'),
          footer: React.createElement('div', null, 'Footer'),
        },
        React.createElement('div', null, 'Content')
      )
    )
    
    assert.ok(html.includes('id="main"'))
    assert.ok(html.includes('tabindex="-1"'))
  })

  it('applies custom className to shell root', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        AppShell,
        {
          header: React.createElement('div', null, 'Header'),
          footer: React.createElement('div', null, 'Footer'),
          className: 'custom-shell',
        },
        React.createElement('div', null, 'Content')
      )
    )
    
    assert.ok(html.includes('class="m-shell custom-shell"'))
  })

  it('uses custom mainId when provided', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        AppShell,
        {
          header: React.createElement('div', null, 'Header'),
          footer: React.createElement('div', null, 'Footer'),
          mainId: 'su-main',
        },
        React.createElement('div', null, 'Content')
      )
    )
    
    assert.ok(html.includes('id="su-main"'))
    assert.ok(html.includes('href="#su-main"'))
  })
})
