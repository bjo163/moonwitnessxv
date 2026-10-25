import type { SchemaDocument } from './schema.js'
import { MoonApiError } from './errors.js'
import type { Creates, ModelName, Rows, Updates, ViewName, ViewOutputs } from './generated.js'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/** query values are pre-encoded by the client (`where` becomes JSON, `expand` a CSV) */
export type QueryInit = Record<string, string | number | boolean | undefined>

export interface ListOptions {
  limit?: number
  offset?: number
  where?: Record<string, unknown>
  order?: string
  expand?: string[]
  /** also read `x-total-count` into `Page.total` */
  total?: boolean
}

export interface Page<T> {
  rows: T[]
  /** null when the call did not ask for `total` */
  total: number | null
}

export interface ModelApi<R, C, U> {
  list(options?: ListOptions): Promise<Page<R>>
  get(id: string, options?: { expand?: string[] }): Promise<R>
  create(body: C): Promise<R>
  update(id: string, patch: U): Promise<R>
  remove(id: string): Promise<void>
}

export interface CallOptions {
  method?: HttpMethod
  body?: unknown
  query?: QueryInit
}

export interface StreamOptions {
  query?: QueryInit
  signal?: AbortSignal
  onEvent: (data: unknown, event: string) => void
  /**
   * Fired once the server has accepted the stream (headers read, body about to be
   * consumed). A UI needs to say "live" at that moment, not at the first frame —
   * a quiet feed is still a connected feed.
   */
  onOpen?: () => void
}

export interface MoonClientOptions {
  /** e.g. `http://127.0.0.1:3000/api/v1` */
  baseUrl: string
  /** static token, or a reader (cookie-backed) resolved per request */
  token?: string | (() => string | undefined | Promise<string | undefined>)
  headers?: Record<string, string>
  /** injection seam for tests (e.g. a Fastify `inject` shim) */
  fetch?: typeof fetch
  /** opt-in extras merged into every request (cache hints, credentials, ...) */
  requestInit?: RequestInit
}

export interface MoonClient {
  readonly baseUrl: string
  schema(): Promise<SchemaDocument>
  model<M extends ModelName>(name: M): ModelApi<Rows[M], Creates[M], Updates[M]>
  view<V extends ViewName>(name: V): { read(options?: { limit?: number; offset?: number; order?: string; total?: boolean }): Promise<Page<ViewOutputs[V]>> }
  call<T = unknown>(path: string, init?: CallOptions): Promise<T>
  stream(path: string, init: StreamOptions): Promise<void>
}

interface RawResult {
  data: unknown
  total: number | null
}

interface Envelope {
  ok?: boolean
  data?: unknown
  error?: { message?: string; details?: unknown }
}

const trimSlash = (url: string): string => url.replace(/\/+$/, '')

function queryString(query?: QueryInit): string {
  if (!query) return ''
  const parts: string[] = []
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  }
  return parts.length ? `?${parts.join('&')}` : ''
}

/**
 * The typed SDK over the moonql REST contract: one envelope, one error type,
 * relative paths only (`/stations`), no Node built-ins (works in RSC, route
 * handlers and edge runtimes alike).
 */
export function createMoonClient(options: MoonClientOptions): MoonClient {
  const baseUrl = trimSlash(options.baseUrl)
  const doFetch: typeof fetch = options.fetch ?? fetch

  const authToken = async (): Promise<string | undefined> => {
    const token = options.token
    return typeof token === 'function' ? await token() : token
  }

  const headersFor = async (extra?: Record<string, string>): Promise<Record<string, string>> => {
    const headers: Record<string, string> = { ...(options.headers ?? {}), ...(extra ?? {}) }
    const token = await authToken()
    if (token) headers.authorization = `Bearer ${token}`
    return headers
  }

  const send = async (method: HttpMethod, path: string, init?: CallOptions): Promise<RawResult> => {
    const url = `${baseUrl}${path}${queryString(init?.query)}`
    const headers = await headersFor()
    const body = init?.body
    const hasBody = body !== undefined
    if (hasBody) headers['content-type'] = 'application/json'

    const res = await doFetch(url, {
      ...options.requestInit,
      method,
      headers,
      cache: 'no-store',
      ...(hasBody ? { body: JSON.stringify(body) } : {}),
    })

    const totalHeader = res.headers.get('x-total-count')
    const total = totalHeader === null ? null : Number(totalHeader)
    if (res.status === 204) return { data: undefined, total }

    const text = await res.text()
    let parsed: unknown
    try {
      parsed = text ? JSON.parse(text) : undefined
    } catch {
      parsed = undefined
    }
    const envelope = parsed !== null && typeof parsed === 'object' ? (parsed as Envelope) : undefined

    if (!res.ok) {
      throw new MoonApiError(
        res.status,
        envelope?.error?.message ?? (text || res.statusText || `HTTP ${res.status}`),
        envelope?.error?.details,
        url,
      )
    }
    if (envelope?.ok === true) return { data: envelope.data, total }
    if (envelope?.ok === false) {
      throw new MoonApiError(res.status, envelope.error?.message ?? 'Request failed', envelope.error?.details, url)
    }
    return { data: parsed, total }
  }

  const model = <M extends ModelName>(name: M): ModelApi<Rows[M], Creates[M], Updates[M]> => ({
    async list(o: ListOptions = {}): Promise<Page<Rows[M]>> {
      const result = await send('GET', `/${name}`, {
        query: {
          limit: o.limit,
          offset: o.offset,
          order: o.order,
          total: o.total,
          where: o.where ? JSON.stringify(o.where) : undefined,
          expand: o.expand?.length ? o.expand.join(',') : undefined,
        },
      })
      return { rows: (result.data ?? []) as Rows[M][], total: result.total }
    },
    async get(id: string, o?: { expand?: string[] }): Promise<Rows[M]> {
      const result = await send('GET', `/${name}/${encodeURIComponent(id)}`, {
        query: { expand: o?.expand?.length ? o.expand.join(',') : undefined },
      })
      return result.data as Rows[M]
    },
    async create(input: Creates[M]): Promise<Rows[M]> {
      const result = await send('POST', `/${name}`, { body: input })
      return result.data as Rows[M]
    },
    async update(id: string, patch: Updates[M]): Promise<Rows[M]> {
      const result = await send('PATCH', `/${name}/${encodeURIComponent(id)}`, { body: patch })
      return result.data as Rows[M]
    },
    async remove(id: string): Promise<void> {
      await send('DELETE', `/${name}/${encodeURIComponent(id)}`)
    },
  })

  const view = <V extends ViewName>(name: V): { read(options?: { limit?: number; offset?: number; order?: string; total?: boolean }): Promise<Page<ViewOutputs[V]>> } => ({
    async read(o: { limit?: number; offset?: number; order?: string; total?: boolean } = {}): Promise<Page<ViewOutputs[V]>> {
      const result = await send('GET', `/${name}`, { query: { limit: o.limit, offset: o.offset, order: o.order, total: o.total } })
      return { rows: (result.data ?? []) as ViewOutputs[V][], total: result.total }
    },
  })

  /** SSE reader: `:` comments are skipped, `event:` names are forwarded */
  const stream = async (path: string, init: StreamOptions): Promise<void> => {
    const url = `${baseUrl}${path}${queryString(init.query)}`
    const res = await doFetch(url, {
      method: 'GET',
      headers: await headersFor({ accept: 'text/event-stream' }),
      signal: init.signal,
      cache: 'no-store',
    })
    if (!res.ok) throw new MoonApiError(res.status, (await res.text()) || `HTTP ${res.status}`, undefined, url)
    init.onOpen?.()
    if (!res.body) return

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    const dispatch = (chunk: string): void => {
      let event = 'message'
      const dataLines: string[] = []
      for (const line of chunk.split('\n')) {
        if (line === '' || line.startsWith(':')) continue
        const colon = line.indexOf(':')
        const field = colon === -1 ? line : line.slice(0, colon)
        const value = colon === -1 ? '' : line.slice(colon + 1).replace(/^ /, '')
        if (field === 'event') event = value
        else if (field === 'data') dataLines.push(value)
      }
      if (!dataLines.length) return
      const raw = dataLines.join('\n')
      let payload: unknown = raw
      try {
        payload = JSON.parse(raw)
      } catch {
        /* keep the raw text */
      }
      init.onEvent(payload, event)
    }

    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let boundary = buffer.indexOf('\n\n')
      while (boundary >= 0) {
        dispatch(buffer.slice(0, boundary))
        buffer = buffer.slice(boundary + 2)
        boundary = buffer.indexOf('\n\n')
      }
    }
    if (buffer.trim()) dispatch(buffer)
  }

  return {
    baseUrl,
    async schema(): Promise<SchemaDocument> {
      const result = await send('GET', '/_schema')
      return result.data as SchemaDocument
    },
    model,
    view,
    async call<T = unknown>(path: string, init?: CallOptions): Promise<T> {
      const result = await send(init?.method ?? 'GET', path, init)
      return result.data as T
    },
    stream,
  }
}
