import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Tabs, Toggle, Field, TextInput } from '../dist/index.js'
import { Modal, AlertDialog } from '../dist/client/index.js'

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
    assert.ok(html.includes('role="dialog"'))
    assert.ok(html.includes('Purge Audio Buffer'))
    assert.ok(html.includes('This will irreversibly clear all captured PCM buffers.'))
    assert.ok(html.includes('Purge Now'))
    assert.ok(html.includes('data-variant="danger"'))
  })
})
