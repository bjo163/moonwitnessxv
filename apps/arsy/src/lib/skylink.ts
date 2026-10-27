import { httpError, notFound, serviceUnavailable } from '@moonwitness/core'
import type { FastifyInstance } from 'fastify'
import type { Channel, ChannelStatus, SendResult } from './channels.js'

// ---- M38-12: the SKYLINK client ----
// ARSY consumes SKYLINK's channel registry; it never invents one. Two calls carry
// the whole integration, and both stay inside the shipped contract
// (docs/audit/M38-11-skylink-rest-ws.md):
//
//   POST /api/v1/channels/register  x-skylink-key  -> the registry SKYLINK owns
//   POST /api/v1/send               x-skylink-key  -> provider delivery + D18
//
// Machine calls use the scoped service credential only. Channel control
// (start/logout) is an operator action and SKYLINK accepts only an ARSY
// administrator session, so that one call forwards the caller's own bearer and
// SKYLINK re-validates it upstream. No cookie is ever sent, and no second
// identity system exists on either side.

/** SKYLINK answers with `{ ok, data, timestamp }` / `{ ok, error, timestamp }`. */
interface SkylinkEnvelope {
  ok?: unknown
  data?: unknown
  error?: { statusCode?: unknown; message?: unknown }
}

export interface SkylinkChannelSummary {
  id: string
  label: string
  state: string
}

export interface SkylinkSendAck {
  channel: string
  to: string
  status: string
  providerMessageId?: string
  messageId?: string
}

export interface SkylinkControlResult {
  id: string
  state: string
}

/** Never a thrown error: callers decide what an unreachable SKYLINK means. */
export type SkylinkOutcome<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number }

export interface SkylinkClientOptions {
  baseUrl: string
  serviceKey: string
  timeoutMs?: number
  inventoryTtlMs?: number
  /** Injectable for tests; production always uses the real fetch. */
  fetcher?: typeof fetch
}

const DEFAULT_TIMEOUT_MS = 3_000
// Status is rendered on every /channels read; a live probe per request would turn
// one operator page into a burst on SKYLINK.
const DEFAULT_INVENTORY_TTL_MS = 5_000

export class SkylinkClient {
  private readonly baseUrl: string
  private readonly serviceKey: string
  private readonly timeoutMs: number
  private readonly inventoryTtlMs: number
  private readonly fetcher: typeof fetch
  private inventory?: { at: number; outcome: SkylinkOutcome<SkylinkChannelSummary[]> }

  constructor(options: SkylinkClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '')
    this.serviceKey = options.serviceKey
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    this.inventoryTtlMs = options.inventoryTtlMs ?? DEFAULT_INVENTORY_TTL_MS
    this.fetcher = options.fetcher ?? fetch
  }

  /** Register this deployment as a consumer and read the registry SKYLINK owns. */
  async register(): Promise<SkylinkOutcome<SkylinkChannelSummary[]>> {
    const outcome = await this.request<unknown>('POST', '/api/v1/channels/register')
    if (!outcome.ok) return outcome
    if (!isChannelRegistry(outcome.data)) return { ok: false, error: 'skylink_invalid_response' }
    return { ok: true, data: outcome.data }
  }

  /** The same call, cached briefly, for status surfaces. */
  async inventoryList(): Promise<SkylinkOutcome<SkylinkChannelSummary[]>> {
    if (this.inventory && Date.now() - this.inventory.at < this.inventoryTtlMs) return this.inventory.outcome
    const outcome = await this.register()
    this.inventory = { at: Date.now(), outcome }
    return outcome
  }

  async send(input: { channel: string; to: string; text: string }): Promise<SkylinkOutcome<SkylinkSendAck>> {
    return this.request<SkylinkSendAck>('POST', '/api/v1/send', { body: input })
  }

  /**
   * Channel control stays an operator action. The caller's ARSY session is
   * forwarded and SKYLINK validates it upstream; the service key is not used
   * here because SKYLINK deliberately denies it on control routes.
   */
  async control(
    action: 'start' | 'logout',
    id: string,
    authorization: string | undefined,
  ): Promise<SkylinkOutcome<SkylinkControlResult>> {
    if (!authorization) return { ok: false, error: 'missing_operator_session', status: 401 }
    return this.request<SkylinkControlResult>(
      'POST',
      `/api/v1/channels/${encodeURIComponent(id)}/${action}`,
      { session: authorization, service: false },
    )
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    options: { body?: unknown; service?: boolean; session?: string } = {},
  ): Promise<SkylinkOutcome<T>> {
    const headers: Record<string, string> = { accept: 'application/json' }
    const service = options.service ?? true
    if (service) headers['x-skylink-key'] = this.serviceKey
    else if (options.session) headers.authorization = options.session
    if (options.body !== undefined) headers['content-type'] = 'application/json'

    let response: Response
    try {
      response = await this.fetcher(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: AbortSignal.timeout(this.timeoutMs),
        redirect: 'error',
      })
    } catch (error) {
      return { ok: false, error: isTimeout(error) ? 'skylink_timeout' : 'skylink_unreachable' }
    }

    let text: string
    try {
      text = await response.text()
    } catch (error) {
      return { ok: false, error: isTimeout(error) ? 'skylink_timeout' : 'skylink_unreadable_response' }
    }

    const envelope = parseEnvelope(text)
    if (!response.ok) {
      const message = typeof envelope?.error?.message === 'string' ? envelope.error.message : undefined
      return {
        ok: false,
        status: response.status,
        error: response.status === 401 ? 'skylink_unauthorized' : message ?? `skylink_http_${response.status}`,
      }
    }
    if (!envelope || envelope.ok !== true || envelope.data === undefined) {
      return { ok: false, status: response.status, error: 'skylink_invalid_response' }
    }
    return { ok: true, data: envelope.data as T }
  }
}

/**
 * One Channel per provider SKYLINK reports. `id`/`label` come from SKYLINK, so a
 * second source of channel identity is structurally impossible here. Control
 * methods are intentionally absent: `modules/channels` forwards the operator
 * session instead of pretending a service credential can start a provider.
 */
export function createSkylinkChannel(client: SkylinkClient, summary: SkylinkChannelSummary): Channel {
  return {
    id: summary.id,
    label: summary.label,

    status: async (): Promise<ChannelStatus> => {
      const inventory = await client.inventoryList()
      if (!inventory.ok) return { state: summary.state, detail: { skylink: inventory.error } }
      const current = inventory.data.find((entry) => entry.id === summary.id)
      return current ? { state: current.state } : { state: 'unknown', detail: { skylink: 'channel_not_registered' } }
    },

    send: async ({ to, text }): Promise<SendResult> => {
      const outcome = await client.send({ channel: summary.id, to, text })
      if (!outcome.ok) return { channel: summary.id, to, ok: false, error: outcome.error }
      return {
        channel: summary.id,
        to,
        ok: true,
        ...(outcome.data.messageId === undefined ? {} : { id: outcome.data.messageId }),
      }
    },
  }
}

/** Boot-time registration state, read by `/api/v1/channels` to fail loudly. */
export class SkylinkRuntime {
  readonly client: SkylinkClient
  readonly url: string
  private registration: 'registered' | 'unavailable' = 'unavailable'
  private failure?: string

  constructor(options: SkylinkClientOptions) {
    this.client = new SkylinkClient(options)
    this.url = options.baseUrl
  }

  get state(): 'registered' | 'unavailable' {
    return this.registration
  }

  /** Why registration failed, as a stable code — never a secret or a raw body. */
  get error(): string | undefined {
    return this.failure
  }

  /** Never throws: a dead SKYLINK must not stop ARSY from booting. */
  async register(): Promise<SkylinkChannelSummary[]> {
    const outcome = await this.client.register()
    if (!outcome.ok) {
      this.registration = 'unavailable'
      this.failure = outcome.status === undefined ? outcome.error : `${outcome.error} (${outcome.status})`
      return []
    }
    this.registration = 'registered'
    this.failure = undefined
    return outcome.data
  }
}

/** Register every channel SKYLINK reports; surface failure and keep booting. */
export async function registerSkylinkChannels(app: FastifyInstance, runtime: SkylinkRuntime): Promise<void> {
  const channels = await runtime.register()
  if (runtime.state !== 'registered') {
    app.log.error(
      { skylink: runtime.url, reason: runtime.error },
      'skylink: channel registration failed; no provider is reachable until this succeeds',
    )
    return
  }
  for (const summary of channels) app.channels.register(createSkylinkChannel(runtime.client, summary))
  app.log.info({ skylink: runtime.url, channels: channels.map((channel) => channel.id) }, 'skylink: channels registered')
}

/** Map a SKYLINK control failure onto the hub's one HTTP error shape. */
export function skylinkControlError(outcome: { error: string; status?: number }): Error {
  if (outcome.status === 404) return notFound('Channel not found in SKYLINK')
  if (outcome.status === 401 || outcome.status === 403) {
    return httpError(502, `SKYLINK rejected the operator session (${outcome.error})`)
  }
  if (outcome.status === 501) return httpError(501, 'SKYLINK does not expose this channel operation.')
  return serviceUnavailable(`SKYLINK channel control failed (${outcome.error})`)
}

function parseEnvelope(text: string): SkylinkEnvelope | undefined {
  try {
    const parsed: unknown = JSON.parse(text)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? (parsed as SkylinkEnvelope) : undefined
  } catch {
    return undefined
  }
}

function isTimeout(error: unknown): boolean {
  return error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')
}

function isChannelRegistry(value: unknown): value is SkylinkChannelSummary[] {
  if (!Array.isArray(value)) return false
  const ids = new Set<string>()
  for (const item of value) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) return false
    const candidate = item as Record<string, unknown>
    if (typeof candidate.id !== 'string' || candidate.id.trim() === '') return false
    if (typeof candidate.label !== 'string' || candidate.label.trim() === '') return false
    if (typeof candidate.state !== 'string' || candidate.state.trim() === '') return false
    if (ids.has(candidate.id)) return false
    ids.add(candidate.id)
  }
  return true
}
