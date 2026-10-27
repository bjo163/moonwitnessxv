import { httpError, pseudonym } from '@moonwitness/core'
import denpa from '@moonwitness/denpa'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

/**
 * DENPA 電波 module -> mounted at <apiPrefix>/denpa
 * Inbound webhook receiver: anyone "transmits", we catch the signal.
 *
 * A transmission that carries words becomes a `requests` row and a
 * `denpa_transmissions` row: the queue is data the DJ can sort, close and audit,
 * and the live on-air view feeds public frontends.
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

/**
 * A request may point at a station. Accept either the station's name (the webhook
 * hint) or its id (what the Dock transceiver sends), and drop anything that
 * resolves to no real station — a dangling ref must never be stored. An unresolvable
 * hint is dropped, not invented.
 */
const resolveStationRef = async (fastify: FastifyInstance, hint: unknown): Promise<string | null> => {
  if (typeof hint !== 'string' || !hint.trim()) return null
  const trimmed = hint.trim()
  const byName = await fastify.moonql.model('stations').list({ where: { name: trimmed }, limit: 1 })
  if (byName[0]) return String(byName[0].id)
  const byId = await fastify.moonql.model('stations').get(trimmed).catch(() => null)
  return byId ? String(byId.id) : null
}

/** Webhook form of the same rule: the station hint rides under `payload.station`. */
const stationRefOf = async (fastify: FastifyInstance, payload: unknown): Promise<string | null> => {
  if (!payload || typeof payload !== 'object') return null
  return resolveStationRef(fastify, (payload as { station?: unknown }).station)
}

interface TransmitBody {
  message: string
  pseudonym?: string
  stationRef?: string
}

export default async function denpaModule(fastify: FastifyInstance) {
  const cfg = fastify.config.denpa

  // Public listener transmission endpoint: web visitors can beam shortwave messages
  fastify.post('/transmit', {
    schema: {
      tags: ['denpa'],
      summary: 'Transmit a shortwave denpa message from the public web transceiver',
      body: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', minLength: 1, maxLength: 500 },
          pseudonym: { type: 'string', maxLength: 50 },
          stationRef: { type: 'string' },
        },
      },
    },
  }, async (req: FastifyRequest<{ Body: TransmitBody }>, reply: FastifyReply) => {
    const rawMessage = req.body?.message?.trim() ?? ''
    if (!rawMessage) {
      // Thrown, not returned as a raw {ok:false}: the envelope builds its error
      // body from {statusCode,message}, so a hand-rolled shape loses the reason.
      throw httpError(400, 'message cannot be empty')
    }
    const message = rawMessage.slice(0, MESSAGE_CAP)
    const pseudo = req.body.pseudonym?.trim() || await senderOf(req.ip || 'anonymous')
    // The Dock sends a station id; a bogus ref is dropped instead of stored.
    const stationRef = await resolveStationRef(fastify, req.body.stationRef)

    const transmission = await fastify.moonql.model('denpa_transmissions').create({
      tokenHash: 'web_listener',
      pseudonym: pseudo,
      message,
      stationRef,
      status: 'ON_AIR',
      broadcastAt: new Date().toISOString(),
    })

    try {
      const gate = await fastify.moonql.model('settings_entries').list({ where: { key: 'requests_open' }, limit: 1 })
      if (String(gate[0]?.value ?? 'true') !== 'false') {
        await fastify.moonql.model('requests').create({
          message,
          sender: pseudo,
          stationRef,
        })
      }
    } catch (err) {
      fastify.log.warn({ err: (err as Error).message }, 'denpa: failed to queue transmission to requests')
    }

    return reply.code(201).send(transmission)
  })

  if (!cfg.enabled) return

  // An inbound webhook without a token is a public writer that anyone can feed
  // (and read back through GET). Refuse instead of silently opening it.
  if (!cfg.token) {
    fastify.log.error('denpa: DENPA_ENABLED is on but DENPA_TOKEN is empty — inbound webhook not registered')
    return
  }

  const recordAndQueue = async (origin: string, tokenHash: string, payload: unknown): Promise<void> => {
    const message = messageOf(payload).trim()
    if (!message) return

    const sender = await senderOf(origin)
    const stationRef = await stationRefOf(fastify, payload)

    await fastify.moonql.model('denpa_transmissions').create({
      tokenHash,
      pseudonym: sender,
      message,
      stationRef,
      status: 'ON_AIR',
      broadcastAt: new Date().toISOString(),
    })

    const gate = await fastify.moonql.model('settings_entries').list({ where: { key: 'requests_open' }, limit: 1 })
    if (String(gate[0]?.value ?? 'true') === 'false') return

    await fastify.moonql.model('requests').create({
      message,
      sender,
      stationRef,
    })
  }

  await fastify.register(denpa, {
    token: cfg.token,
    onReceive: (t) => {
      fastify.log.info({ id: t.id, origin: t.origin }, 'denpa: transmission received')
      void recordAndQueue(t.origin, 'denpa_webhook', t.payload).catch((err: unknown) =>
        fastify.log.warn({ err: (err as Error).message }, 'denpa: transmission not recorded/queued'),
      )
    },
  })
}
