import { pseudonym } from '@moonwitness/core'
import denpa from '@moonwitness/denpa'
import type { FastifyInstance } from 'fastify'

/**
 * DENPA 電波 module -> mounted at <apiPrefix>/denpa
 * Inbound webhook receiver: anyone "transmits", we catch the signal.
 *
 * A transmission that carries words becomes a `requests` row: the queue is then
 * data the DJ can sort, close and audit instead of a line that scrolls past in a
 * terminal. Two rules travel with it — the origin is never stored in the clear,
 * and nothing a webhook does may take the hub down.
 */
const MESSAGE_CAP = 500

/** The same pseudonym rule as the public listen beacon, applied to the sender. */
const senderOf = (origin: string): Promise<string> => pseudonym('dn', origin)

/** The human part of a payload: `msg` when present, otherwise the payload itself. */
const messageOf = (payload: unknown): string => {
  if (typeof payload === 'string') return payload.slice(0, MESSAGE_CAP)
  if (payload && typeof payload === 'object') {
    const msg = (payload as { msg?: unknown }).msg
    if (typeof msg === 'string') return msg.slice(0, MESSAGE_CAP)
  }
  return JSON.stringify(payload ?? '').slice(0, MESSAGE_CAP)
}

/** A request may name a station; an unknown name is dropped, not invented. */
const stationRefOf = async (fastify: FastifyInstance, payload: unknown): Promise<string | null> => {
  if (!payload || typeof payload !== 'object') return null
  const hint = (payload as { station?: unknown }).station
  if (typeof hint !== 'string' || !hint.trim()) return null
  const rows = await fastify.moonql.model('stations').list({ where: { name: hint.trim() }, limit: 1 })
  return rows[0] ? String(rows[0].id) : null
}

export default async function denpaModule(fastify: FastifyInstance) {
  const cfg = fastify.config.denpa
  if (!cfg.enabled) return

  // An inbound webhook without a token is a public writer that anyone can feed
  // (and read back through GET). Refuse instead of silently opening it.
  if (!cfg.token) {
    fastify.log.error('denpa: DENPA_ENABLED is on but DENPA_TOKEN is empty — inbound webhook not registered')
    return
  }

  const queue = async (origin: string, payload: unknown): Promise<void> => {
    // The DJ can close the queue from HQ; a closed queue still logs the signal.
    const gate = await fastify.moonql.model('settings_entries').list({ where: { key: 'requests_open' }, limit: 1 })
    if (String(gate[0]?.value ?? 'true') === 'false') return

    const message = messageOf(payload).trim()
    if (!message) return
    await fastify.moonql.model('requests').create({
      message,
      sender: await senderOf(origin),
      stationRef: await stationRefOf(fastify, payload),
    })
  }

  await fastify.register(denpa, {
    token: cfg.token,
    onReceive: (t) => {
      fastify.log.info({ id: t.id, origin: t.origin }, '⚡ denpa: transmission received')
      // fire-and-forget, but never unhandled: a slow or failing write must not
      // reject inside a webhook that has already answered 202
      void queue(t.origin, t.payload).catch((err: unknown) =>
        fastify.log.warn({ err: (err as Error).message }, 'denpa: transmission not queued as a request'),
      )
    },
  })
}
