import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { MoonApiError } from '@moonwitness/moonql-client'
import { DELETE_CONFIRM_VALUE, editorErrorCode, editorErrorMessage, isDeleteConfirmed } from '../src/lib/editor-copy.js'

void test('destructive confirmation accepts exactly one expected form value', () => {
  assert.equal(DELETE_CONFIRM_VALUE, 'confirm-permanent-delete')
  assert.equal(isDeleteConfirmed([DELETE_CONFIRM_VALUE]), true)
  assert.equal(isDeleteConfirmed([]), false)
  assert.equal(isDeleteConfirmed(['wrong']), false)
  assert.equal(isDeleteConfirmed([DELETE_CONFIRM_VALUE, DELETE_CONFIRM_VALUE]), false)
  assert.equal(isDeleteConfirmed([DELETE_CONFIRM_VALUE, 'forged']), false)
})

void test('editor failures map only status codes to stable localized copy', () => {
  assert.equal(editorErrorCode(new MoonApiError(401, 'token=secret')), 'expired')
  assert.equal(editorErrorCode(new MoonApiError(403, 'private witness')), 'unauthorized')
  assert.equal(editorErrorCode(new MoonApiError(404, 'missing')), 'not_found')
  assert.equal(editorErrorCode(new MoonApiError(422, 'private rejected input')), 'invalid')
  assert.equal(editorErrorCode(new MoonApiError(503, 'provider secret')), 'unavailable')
  assert.equal(editorErrorCode(new Error('password=secret')), 'unavailable')
  assert.equal(editorErrorMessage('en', 'password=secret'), null)
  assert.equal(editorErrorMessage('id', '__proto__'), null)
})

void test('the server action validates authorization and confirmation before mutation', async () => {
  const actions = await readFile(new URL('../src/data/actions.ts', import.meta.url), 'utf8')
  const editPage = await readFile(new URL('../src/app/(admin)/models/[model]/[id]/page.tsx', import.meta.url), 'utf8')
  const listPage = await readFile(new URL('../src/app/(admin)/models/[model]/page.tsx', import.meta.url), 'utf8')

  assert.doesNotMatch(actions, /export\s+(?:const|let|var|class)\b/, 'Next server-action modules export only async actions')
  assert.match(actions, /export\s+async\s+function\s+deleteRecordAction\([^)]*formData:\s*FormData/)
  assert.match(actions, /await\s+authorizeWrite\(model,\s*'remove'\)/)
  assert.match(actions, /isDeleteConfirmed\(formData\.getAll\(`\$\{CONTROL_PREFIX\}confirm`\)\)/)
  assert.ok(actions.indexOf('isDeleteConfirmed(') < actions.indexOf('serverClient().model(segment).remove(row)'))
  assert.match(actions, /editorErrorCode\(error\)/)
  assert.match(actions, /function failNew\(model: string, code: EditorErrorCode\)/)
  assert.match(actions, /failNew\(segment, editorErrorCode\(error\)\)/)
  assert.match(actions, /\/models\/\$\{segment\}\/new\?error=\$\{code\}/)
  assert.doesNotMatch(actions, /error\.message|errorMessage\(/)
  assert.match(actions, /catch\s*\(error\)\s*\{\s*failNew\(segment,\s*editorErrorCode\(error\)\)/)
  assert.match(actions, /catch\s*\(error\)\s*\{\s*fail\(segment,\s*row,\s*editorErrorCode\(error\)\)/)

  for (const page of [editPage, listPage]) {
    assert.match(page, /DELETE_CONFIRM_VALUE/)
    assert.match(page, /type="checkbox" name="\$confirm" value=\{DELETE_CONFIRM_VALUE\} required/)
    assert.match(page, /deleteRecordAction\.bind\(null/)
  }
})
