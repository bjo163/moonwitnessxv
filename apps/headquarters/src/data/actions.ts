'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ModelMeta, ModelName } from '@moonwitness/moonql-client'
import { serverClient } from './sdk'
import { isModelName } from './queries/registry'
import { getSchema } from './schema'
import { guardModel, type Guard } from '@/lib/authz'
import { editorErrorCode, isDeleteConfirmed, type EditorErrorCode, type EditorSavedCode } from '@/lib/editor-copy'

/**
 * Server actions for the schema-driven record editor (UI2-P21c).
 *
 * Three properties, and they are the whole point of this file:
 *
 *  1. THE ROLE IS CHECKED WHERE THE WRITE HAPPENS. Every action re-reads the
 *     hub's published `_schema`, re-reads the request's session, and re-runs the
 *     shared `can()` matcher before a single byte is sent to the API. Hiding a
 *     button in the page is a courtesy; a POST to this action is not trusted
 *     because a page said it was allowed.
 *  2. DESTRUCTIVE MUTATIONS NEED AN EXPLICIT CONFIRMATION. A delete is refused
 *     server-side unless the form carries the confirmation value the delete
 *     form renders. A crafted, scripted or replayed request without it writes
 *     nothing.
 *  3. NOTHING RETURNS TO THE BROWSER BUT A STABLE CODE. Failures become one of
 *     six enum members chosen from the HTTP status number alone; the hub's
 *     message is never read into a URL. No token, credential, private witness
 *     value or rejected input can surface in the address bar or the page.
 *
 * Redirect targets are built only from an `isModelName()`-validated model and a
 * shape-validated id, and never from a form-supplied return address, so these
 * actions cannot be turned into open redirects.
 */

/** control fields are `$`-prefixed and are never part of the payload */
const CONTROL_PREFIX = '$'

/** ids the hub mints are uuids; anything shaped like a path fragment stays out of a URL */
const ID_SHAPE = /^[A-Za-z0-9_-]{1,64}$/

function safeModel(model: string): ModelName | null {
  return isModelName(model) ? model : null
}

function safeId(id: string): string | null {
  return ID_SHAPE.test(id) ? id : null
}

/**
 * The one error exit in this file: validated model, optional validated id, and
 * a stable code as the only query parameter.
 */
function fail(model: string, id: string | null, code: EditorErrorCode): never {
  const segment = safeModel(model)
  if (!segment) redirect('/models')
  const row = id ? safeId(id) : null
  redirect(row ? `/models/${segment}/${row}?error=${code}` : `/models/${segment}?error=${code}`)
}

function failNew(model: string, code: EditorErrorCode): never {
  const segment = safeModel(model)
  if (!segment) redirect('/models')
  redirect(`/models/${segment}/new?error=${code}`)
}

function succeed(model: string, code: EditorSavedCode): never {
  const segment = safeModel(model)
  if (!segment) redirect('/models')
  redirect(`/models/${segment}?saved=${code}`)
}

/**
 * The server-side permission gate for one mutation.
 *
 * A page may render or hide a button; that is not an authorization — this is.
 * `guardModel` is the same matcher the pages already use, so the page and the
 * action cannot drift into disagreeing about who may write. An anonymous caller
 * is redirected to the login route by the guard itself; a caller whose session
 * is valid but whose role does not hold the published rule gets `unauthorized`.
 */
async function authorizeWrite(model: string, op: 'create' | 'update' | 'remove'): Promise<ModelName> {
  const segment = safeModel(model)
  if (!segment) fail(model, null, 'not_found')
  let doc: Awaited<ReturnType<typeof getSchema>>
  try {
    doc = await getSchema()
  } catch {
    // with no schema document there is no published rule to match, so there is no write
    fail(model, null, 'unavailable')
  }
  const meta: ModelMeta | undefined = doc.models[segment]
  if (!meta) fail(model, null, 'not_found')
  const guard: Guard = await guardModel(meta, op)
  if (!guard.allowed) fail(model, null, guard.code === 'unavailable' ? 'unavailable' : 'unauthorized')
  return segment
}

function payloadOf(formData: FormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  for (const [rawKey, rawValue] of formData.entries()) {
    if (typeof rawValue !== 'string') continue
    if (rawKey.startsWith(CONTROL_PREFIX)) continue // control fields (e.g. $confirm)
    const separator = rawKey.indexOf('::')
    const key = separator === -1 ? rawKey : rawKey.slice(0, separator)
    const kind = separator === -1 ? 'str' : rawKey.slice(separator + 2)

    if (kind === 'bool') {
      payload[key] = rawValue === 'on' || rawValue === 'true' // hidden "false" first, checkbox last wins
      continue
    }
    if (rawValue === '') continue // empty input = "leave unset" (PATCH keeps the old value)
    if (kind === 'int') {
      const parsed = Number(rawValue)
      if (!Number.isNaN(parsed)) payload[key] = parsed
      continue
    }
    if (kind === 'ts') {
      const date = new Date(rawValue)
      payload[key] = Number.isNaN(date.getTime()) ? rawValue : date.toISOString()
      continue
    }
    payload[key] = rawValue
  }
  return payload
}

export async function createRecordAction(model: string, formData: FormData): Promise<void> {
  const segment = await authorizeWrite(model, 'create')
  const payload = payloadOf(formData)
  try {
    await serverClient().model(segment).create(payload)
  } catch (error) {
    failNew(segment, editorErrorCode(error))
  }
  revalidatePath(`/models/${segment}`)
  succeed(segment, 'created')
}

export async function updateRecordAction(model: string, id: string, formData: FormData): Promise<void> {
  const segment = await authorizeWrite(model, 'update')
  const row = safeId(id)
  if (!row) fail(segment, null, 'not_found')
  const payload = payloadOf(formData)
  try {
    await serverClient().model(segment).update(row, payload)
  } catch (error) {
    // a 401 here is an expired session and a 403 means the published rule moved
    // since the page rendered; both answer with a code, never with the hub's sentence
    fail(segment, row, editorErrorCode(error))
  }
  revalidatePath(`/models/${segment}`)
  redirect(`/models/${segment}/${row}?saved=updated`)
}

/**
 * Destructive mutation, gated twice: first on the role the hub publishes for
 * `remove`, then on the explicit confirmation the delete form renders.
 *
 * The role goes first so an unauthorized caller learns nothing at all about the
 * model, and the confirmation is checked before the API is contacted so a
 * request that merely forgot the checkbox cannot reach the hub either.
 */
export async function deleteRecordAction(model: string, id: string, formData: FormData): Promise<void> {
  const segment = await authorizeWrite(model, 'remove')
  const row = safeId(id)
  if (!row) fail(segment, null, 'not_found')
  if (!isDeleteConfirmed(formData.getAll(`${CONTROL_PREFIX}confirm`))) fail(segment, row, 'unconfirmed')
  try {
    await serverClient().model(segment).remove(row)
  } catch (error) {
    fail(segment, null, editorErrorCode(error))
  }
  revalidatePath(`/models/${segment}`)
  succeed(segment, 'deleted')
}
