import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ModelMeta } from '@moonwitness/moonql-client'
import { formFields } from '@moonwitness/moonql-client'
import { ModelTable, RecordForm } from '@moonwitness/moonui'
import { schemaFields } from '../src/data/form-fields.js'
import { editorFailureMessage, editorStatusMessage, modelViewCopy } from '../src/app/(admin)/models/locale-copy.js'

const metadata = {
  label: 'Sample record',
  addon: 'sample-addon',
  route: '/sample',
  operations: { list: true, get: true, create: true, update: true, remove: false },
  delete: 'soft',
  unique: [],
  maxLimit: 25,
  dataTier: 'demo',
  acl: { list: 'auth', get: 'auth', create: 'admin', update: 'admin', remove: 'none' },
  fields: { title: { kind: 'text', required: true } },
  createSchema: { properties: { title: { type: 'string' } }, required: ['title'] },
  updateSchema: { properties: { title: { type: 'string' } }, required: ['title'] },
  readSchema: { properties: { title: { type: 'string' } } },
} as unknown as ModelMeta

void test('model and view chrome has complete Indonesian and English catalogs', () => {
  const english = modelViewCopy('en')
  const indonesian = modelViewCopy('id')

  assert.deepEqual(Object.keys(indonesian).sort(), Object.keys(english).sort())
  assert.equal(english.search, 'Search')
  assert.equal(indonesian.search, 'Cari')
  assert.equal(english.run, 'Run')
  assert.equal(indonesian.run, 'Jalankan')
  assert.equal(editorFailureMessage('en', 'invalid'), 'The request was not accepted. Check the values and try again.')
  assert.equal(editorFailureMessage('id', 'invalid'), 'Permintaan tidak diterima. Periksa isian lalu coba lagi.')
  assert.equal(editorFailureMessage('id', 'not_found'), 'Data atau model ini tidak ditemukan.')
  assert.equal(editorFailureMessage('en', 'unconfirmed'), 'Confirm the destructive action before submitting it.')
  assert.equal(editorFailureMessage('en', 'password=private'), 'The request could not be completed. Please try again or contact an administrator.')
  assert.equal(editorFailureMessage('id', '__proto__'), 'Permintaan tidak dapat diselesaikan. Coba lagi atau hubungi administrator.')
  assert.equal(editorFailureMessage('id', ''), null)
  assert.equal(editorFailureMessage('en', 'expired'), 'Your session has expired. Sign in again to continue.')
  assert.equal(editorStatusMessage('id', 'updated'), 'Data berhasil disimpan.')
  assert.equal(editorStatusMessage('en', 'unauthorized'), null)
})

void test('both locale forms render localized controls while schema field IDs remain stable', () => {
  const render = (locale: 'en' | 'id') => {
    const copy = modelViewCopy(locale)
    return renderToStaticMarkup(
      React.createElement(RecordForm, {
        title: `${copy.create} ${metadata.label.toLowerCase()}`,
        subtitle: copy.fieldsFromSchema.replace('{count}', '1'),
        fields: schemaFields(formFields(metadata, 'create', {}), {}),
        action: () => undefined,
        submitLabel: copy.create,
        cancelLabel: copy.cancel,
        cancelHref: '/models/SampleRecord',
      }),
    )
  }
  const english = render('en')
  const indonesian = render('id')

  assert.match(english, />Create</)
  assert.match(indonesian, />Buat</)
  assert.match(english, />Cancel</)
  assert.match(indonesian, />Batal</)
  assert.match(english, /name="title::text"/)
  assert.match(indonesian, /name="title::text"/)
  assert.match(english, /for="f-title">title \*</)
  assert.match(indonesian, /for="f-title">title \*</)
})

void test('model table localizes chrome but preserves schema column identifiers and permission supplied actions', () => {
  const render = (locale: 'en' | 'id') => {
    const copy = modelViewCopy(locale)
    return renderToStaticMarkup(
      React.createElement(ModelTable, {
        fields: metadata.fields,
        labels: { id: 'id', createdAt: copy.createdAt, actions: copy.actions },
        empty: copy.noRows.replace('{model}', 'SampleRecord'),
        rows: [{ id: 'safe-id', title: 'synthetic' }],
        rowHref: (row: Record<string, unknown>) => `/models/SampleRecord/${String(row.id)}`,
      }),
    )
  }
  const english = render('en')
  const indonesian = render('id')

  assert.match(english, />Created</)
  assert.match(indonesian, />Dibuat</)
  assert.match(english, /href="\/models\/SampleRecord\/safe-id"/)
  assert.match(indonesian, /href="\/models\/SampleRecord\/safe-id"/)
  assert.match(english, />title</)
  assert.match(indonesian, />title</)
})

void test('guarded model and view reads still authorize before querying and do not translate identifiers', async () => {
  const modelPage = await readFile(new URL('../src/app/(admin)/models/[model]/page.tsx', import.meta.url), 'utf8')
  const modelsIndex = await readFile(new URL('../src/app/(admin)/models/page.tsx', import.meta.url), 'utf8')
  const newPage = await readFile(new URL('../src/app/(admin)/models/[model]/new/page.tsx', import.meta.url), 'utf8')
  const editPage = await readFile(new URL('../src/app/(admin)/models/[model]/[id]/page.tsx', import.meta.url), 'utf8')
  const viewsIndex = await readFile(new URL('../src/app/(admin)/views/page.tsx', import.meta.url), 'utf8')
  const viewPage = await readFile(new URL('../src/app/(admin)/views/[view]/page.tsx', import.meta.url), 'utf8')

  for (const page of [modelPage, modelsIndex, newPage, editPage, viewsIndex, viewPage]) {
    assert.match(page, /await requestLocale\(\)/)
    assert.match(page, /modelViewCopy\(locale\)/)
  }
  assert.ok(modelPage.indexOf("guardModel(meta, 'list')") < modelPage.indexOf('listRecords(model'))
  assert.ok(newPage.indexOf("guardModel(meta, 'create')") < newPage.indexOf('optionsFor('))
  assert.ok(viewPage.indexOf('guardView(meta)') < viewPage.indexOf('const page = await serverClient()'))
  assert.match(modelPage, /can\(meta, user, 'create'\)/)
  assert.match(modelPage, /can\(meta, user, 'update'\)/)
  assert.match(modelPage, /can\(meta, user, 'remove'\)/)
  assert.match(viewPage, /\.view\(view as ViewName\)/)
})
