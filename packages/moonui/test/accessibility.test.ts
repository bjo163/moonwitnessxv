import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Tabs, Toggle, Field, TextInput, SelectInput } from '../dist/index.js'
import { Modal, AlertDialog } from '../dist/client/index.js'

/** pulls the first `attr="value"` out of the markup */
function attr(html: string, name: string): string | undefined {
  return new RegExp(`${name}="([^"]*)"`).exec(html)?.[1]
}

/** asserts an id reference resolves to an element that actually carries `text` */
function assertResolves(html: string, attributeName: string, text: string): string {
  const target = attr(html, attributeName)
  assert.ok(target, `expected ${attributeName} to be present`)
  const at = html.indexOf(`id="${target}"`)
  assert.ok(at >= 0, `expected the ${attributeName} target id="${target}" to be rendered`)
  const nearby = html.slice(at, at + 400)
  assert.ok(nearby.includes(text), `expected id="${target}" to carry "${text}"`)
  return target
}

describe('MoonUI Accessibility (WAI-ARIA & Keyboard Navigation)', () => {
  it('renders Tabs with WAI-ARIA tablist pattern and roving tabindexes', () => {
    const tabs = [
      { id: 'telemetry', label: 'Telemetry', count: 12 },
      { id: 'spectrum', label: 'Spectrum' },
      { id: 'logs', label: 'Logs' },
    ]
    const html = renderToStaticMarkup(
      React.createElement(Tabs, {
        items: tabs,
        activeId: 'spectrum',
        onChange: () => {},
      })
    )

    assert.ok(html.includes('role="tablist"'))

    // Inactive tab 1 (telemetry)
    assert.ok(html.includes('tabindex="-1"'))
    assert.ok(html.includes('aria-selected="false"'))

    // Active tab 2 (spectrum)
    assert.ok(html.includes('tabindex="0"'))
    assert.ok(html.includes('aria-selected="true"'))
    assert.ok(html.includes('data-active="true"'))
  })

  it('renders Toggle accessible checkbox', () => {
    const html = renderToStaticMarkup(
      React.createElement(Toggle, {
        label: 'Living Phosphor Backlight',
        defaultChecked: true,
      })
    )
    assert.ok(html.includes('type="checkbox"'))
    assert.ok(html.includes('Living Phosphor Backlight'))
  })

  it('associates Field labels, inputs, hints and errors', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        Field,
        {
          label: 'Station Frequency',
          htmlFor: 'freq-input',
          hint: 'Enter value between 88.0 and 108.0',
        },
        React.createElement(TextInput, { id: 'freq-input', defaultValue: '104.2' })
      )
    )
    assert.ok(html.includes('for="freq-input"'))
    assert.ok(html.includes('Station Frequency'))
    assert.ok(html.includes('m-field-hint'))
    assert.ok(html.includes('Enter value between 88.0 and 108.0'))

    // the hint is not only rendered, it is wired onto the control
    assert.ok(html.includes('aria-describedby="freq-input-hint"'))
    assertResolves(html, 'aria-describedby', 'Enter value between 88.0 and 108.0')
    assert.ok(!html.includes('aria-invalid'), 'a valid field must not be marked invalid')
  })

  it('marks the Field control aria-invalid and describes it with the error only', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        Field,
        {
          label: 'Station Frequency',
          htmlFor: 'freq-input',
          hint: 'ignored while invalid',
          error: 'Frequency must be a number',
        },
        React.createElement(TextInput, { id: 'freq-input' })
      )
    )
    assert.ok(html.includes('aria-invalid="true"'))
    assert.ok(html.includes('aria-describedby="freq-input-error"'))
    assertResolves(html, 'aria-describedby', 'Frequency must be a number')
    assert.ok(!html.includes('ignored while invalid'), 'the hint yields to the error')
    assert.ok(!html.includes('freq-input-error-hint'))
  })

  it('wires SelectInput and Toggle children, skips hidden seeds, and never overrides explicit ARIA', () => {
    const selectHtml = renderToStaticMarkup(
      React.createElement(
        Field,
        { label: 'Tradition', htmlFor: 'tradition', hint: 'pick one' },
        React.createElement(SelectInput, { id: 'tradition', options: [{ value: 'zen', label: 'Zen' }] })
      )
    )
    assert.ok(selectHtml.includes('aria-describedby="tradition-hint"'))

    const groupedHtml = renderToStaticMarkup(
      React.createElement(
        Field,
        { label: 'Login', htmlFor: 'login', hint: 'your handle' },
        React.createElement(TextInput, { id: 'login', icon: 'ID' })
      )
    )
    // the icon/suffix variant renders a wrapper div: the ids must land on the input
    assert.match(groupedHtml, /<input[^>]*aria-describedby="login-hint"/)

    const explicitHtml = renderToStaticMarkup(
      React.createElement(
        Field,
        { label: 'Call sign', htmlFor: 'call', error: 'taken' },
        React.createElement(TextInput, { id: 'call', 'aria-describedby': 'my-own-description', 'aria-invalid': 'grammar' })
      )
    )
    assert.ok(explicitHtml.includes('aria-describedby="my-own-description"'))
    assert.ok(explicitHtml.includes('aria-invalid="grammar"'))
    assert.ok(!/aria-describedby="[^"]*call-error/.test(explicitHtml), 'consumer wiring wins per attribute')

    const boolHtml = renderToStaticMarkup(
      React.createElement(
        Field,
        { label: 'Live relay', htmlFor: 'relay', hint: 'on air' },
        React.createElement('input', { type: 'hidden', name: 'relay', defaultValue: 'false' }),
        React.createElement(Toggle, { id: 'relay', name: 'relay', label: 'enabled' })
      )
    )
    const hiddenTag = /<input type="hidden"[^>]*>/.exec(boolHtml)?.[0] ?? ''
    assert.ok(hiddenTag.includes('name="relay"'))
    assert.ok(!hiddenTag.includes('aria-describedby'), 'the FormData seed input is not a control')
    assert.ok(!hiddenTag.includes('aria-invalid'))
    assert.match(boolHtml, /<input[^>]*id="relay"[^>]*aria-describedby="relay-hint"/)
  })

  it('renders a Field without htmlFor with no dangling ARIA references', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        Field,
        { label: 'Unlabelled', hint: 'no control id' },
        React.createElement('div', { className: 'm-stack' }, React.createElement(TextInput, { name: 'free' }))
      )
    )
    assert.ok(!html.includes('aria-describedby'))
    assert.ok(!html.includes('id="undefined-hint"'))
    assert.ok(html.includes('no control id'))
  })

  it('renders Modal dialog with aria-modal and role="dialog"', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        Modal,
        {
          isOpen: true,
          onClose: () => {},
          title: 'Quantum Diagnostics',
        },
        React.createElement('p', null, 'Sub-system operational')
      )
    )
    assert.ok(html.includes('role="dialog"'))
    assert.ok(html.includes('aria-modal="true"'))
    assert.ok(html.includes('Quantum Diagnostics'))
    assert.ok(html.includes('Sub-system operational'))

    // the dialog is labelled by the title element it actually renders
    assertResolves(html, 'aria-labelledby', 'Quantum Diagnostics')
    assert.ok(!html.includes('--surface2'), 'no undefined custom property may leak into the dialog')
    assert.ok(html.includes('var(--surface-2)'))
  })

  it('omits aria-labelledby when a Modal has no title', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        Modal,
        { isOpen: true, onClose: () => {}, title: '' },
        React.createElement('p', null, 'nameless')
      )
    )
    assert.ok(html.includes('role="dialog"'))
    assert.ok(!html.includes('aria-labelledby'), 'a dangling label reference is worse than none')
  })

  it('renders AlertDialog confirmation with action buttons', () => {
    const html = renderToStaticMarkup(
      React.createElement(AlertDialog, {
        isOpen: true,
        onClose: () => {},
        onConfirm: () => {},
        title: 'Purge Audio Buffer',
        message: 'This will irreversibly clear all captured PCM buffers.',
        confirmLabel: 'Purge Now',
        tone: 'danger',
      })
    )
    assert.ok(html.includes('role="alertdialog"'))
    assert.ok(html.includes('aria-modal="true"'))
    assert.ok(!html.includes('role="dialog"'), 'an alert dialog must not masquerade as a plain dialog')
    assertResolves(html, 'aria-labelledby', 'Purge Audio Buffer')
    assertResolves(html, 'aria-describedby', 'This will irreversibly clear all captured PCM buffers.')
    assert.ok(html.includes('Purge Audio Buffer'))
    assert.ok(html.includes('This will irreversibly clear all captured PCM buffers.'))
    assert.ok(html.includes('Purge Now'))
    assert.ok(html.includes('data-variant="danger"'))
  })
})
