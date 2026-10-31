import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AlertDialog, Modal } from '../dist/client/index.js'

const base = {
  isOpen: true,
  onClose: () => {},
  onConfirm: () => {},
  title: 'Delete object',
  message: 'Delete this record?',
}

const describedBy = (html: string): string | null => /aria-describedby="([^"]+)"/.exec(html)?.[1] ?? null

describe('AlertDialog contract', () => {
  it('renders nothing while closed, so no trap is installed prematurely', () => {
    const html = renderToStaticMarkup(React.createElement(AlertDialog, { ...base, isOpen: false }))
    assert.equal(html, '')
  })

  it('asserts the alertdialog role and is labelled by its own title', () => {
    const html = renderToStaticMarkup(React.createElement(AlertDialog, base))
    assert.ok(html.includes('role="alertdialog"'))
    assert.ok(html.includes('aria-modal="true"'))
    assert.match(html, /aria-labelledby="([^"]+)"/, 'the title is the accessible name')
    assert.ok(html.includes('Delete object'))
  })

  it('announces the consequence through aria-describedby, not as an afterthought', () => {
    const html = renderToStaticMarkup(React.createElement(AlertDialog, { ...base, note: 'echolog/key/abc' }))
    const id = describedBy(html)
    assert.ok(id, 'the dialog declares the element that describes it')
    const target = new RegExp(`<div id="${id}"[\\s\\S]*?echolog/key/abc[\\s\\S]*?</div>`).exec(html)?.[0] ?? ''
    assert.ok(target.includes('Delete this record?'), 'message and note live in the same described-by target')
    assert.ok(target.includes('m-alert-dialog-note'), 'the note keeps its shared class, so the caller cannot restyle it')
  })

  it('disables confirmation and marks the surface busy while the caller is writing', () => {
    const html = renderToStaticMarkup(React.createElement(AlertDialog, { ...base, busy: true, confirmLabel: 'Delete' }))
    const confirm = /<button[^>]*data-variant="danger"[^>]*>Delete<\/button>/.exec(html)?.[0] ?? ''
    assert.ok(confirm.includes('disabled=""'), 'a second confirm cannot race the first')
    assert.ok(confirm.includes('aria-busy="true"'))
  })

  it('is not busy by default and keeps the tone variant on the confirm button', () => {
    const html = renderToStaticMarkup(React.createElement(AlertDialog, { ...base, tone: 'accent' }))
    assert.doesNotMatch(html, /aria-busy/, 'a resting dialog does not claim work in flight')
    assert.ok(html.includes('data-variant="accent"'))
    assert.ok(!/data-variant="danger"/.test(html))
  })

  it('renders both actions from the shared button contract', () => {
    const html = renderToStaticMarkup(
      React.createElement(AlertDialog, { ...base, confirmLabel: 'Delete', cancelLabel: 'Keep' }),
    )
    assert.ok(html.includes('>Keep</button>'))
    assert.ok(html.includes('>Delete</button>'))
    assert.ok(html.includes('data-variant="ghost"'), 'cancel is the quiet action')
    assert.ok(!/class="[^"]*\bdk-/.test(html), 'no app-local class survives the migration')
  })
})

describe('Modal contract that AlertDialog inherits', () => {
  it('renders a dialog with the Escape affordance and a description hook', () => {
    const html = renderToStaticMarkup(
      React.createElement(Modal, { isOpen: true, onClose: () => {}, title: 'Shortcuts', describedBy: 'help-body' },
        React.createElement('p', { id: 'help-body' }, 'Press ? to reopen.'),
      ),
    )
    assert.ok(html.includes('role="dialog"'))
    assert.ok(html.includes('aria-describedby="help-body"'))
    assert.ok(html.includes('[ESC]'), 'the modal shows how to dismiss it')
    assert.ok(html.includes('Press ? to reopen.'))
  })

  it('closes nothing and mounts nothing while closed', () => {
    const html = renderToStaticMarkup(React.createElement(Modal, { isOpen: false, onClose: () => {} }, 'body'))
    assert.equal(html, '')
  })
})
