'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { errorMessage } from '@moonwitness/moonql-client'
import { serverClient } from './sdk'
import { isModelName } from './queries/registry'

/**
 * Server actions: the browser never talks to the API. Every input carries its
 * field kind (`name="genre::sel"`), so one generic form serves every model
 * without a hand-written parser per model.
 */

function payloadOf(formData: FormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  for (const [rawKey, rawValue] of formData.entries()) {
    if (typeof rawValue !== 'string') continue
    if (rawKey.startsWith('$')) continue // control fields (e.g. $redirect)
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
  if (!isModelName(model)) redirect('/models')
  const payload = payloadOf(formData)
  try {
    await serverClient().model(model).create(payload)
  } catch (error) {
    redirect(`/models/${model}/new?error=${encodeURIComponent(errorMessage(error))}`)
  }
  revalidatePath(`/models/${model}`)
  redirect(`/models/${model}`)
}

export async function updateRecordAction(model: string, id: string, formData: FormData): Promise<void> {
  if (!isModelName(model)) redirect('/models')
  const payload = payloadOf(formData)
  try {
    await serverClient()
      .model(model)
      .update(id, payload)
  } catch (error) {
    redirect(`/models/${model}/${id}?error=${encodeURIComponent(errorMessage(error))}`)
  }
  revalidatePath(`/models/${model}`)
  redirect(`/models/${model}`)
}

export async function deleteRecordAction(model: string, id: string): Promise<void> {
  if (!isModelName(model)) redirect('/models')
  try {
    await serverClient().model(model).remove(id)
  } catch (error) {
    redirect(`/models/${model}?error=${encodeURIComponent(errorMessage(error))}`)
  }
  revalidatePath(`/models/${model}`)
  redirect(`/models/${model}`)
}
