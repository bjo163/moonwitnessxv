import type { ModelRepo } from '@moonwitness/moonql'
import type { TypedModule } from '../../lib/types.js'
import { deliverIncidentAlert, pendingAlertIds } from '../../lib/isp-alerts.js'

/**
 * The ISP alert consumer — no routes on purpose, like the announcer.
 *
 * `CronDef.run` in the isp addon sees the orm but never a channel, so the D20
 * sweep can only record that a node went bad. This module is the half that owns
 * the messenger: it reacts to an incident as it is written and revisits the ones
 * still owed a notice, one at a time, because two concurrent sends of the same
 * incident would page an operator twice.
 */
const RETRY_INTERVAL_MS = 60_000

const ispAlertsModule: TypedModule = async (fastify) => {
  const orm = fastify.moonql
  const incidents = (): ModelRepo => orm.model('isp_incidents') as ModelRepo

  // A single linked promise is the whole concurrency story: every delivery is
  // queued behind the previous one, so an incident can never be in flight twice.
  let queue: Promise<void> = Promise.resolve()
  const enqueue = (incidentId: string): void => {
    queue = queue
      .then(() => deliverIncidentAlert(orm, incidents(), incidentId, {
        broadcast: (input) => fastify.channels.broadcast(input),
        warn: (message) => fastify.log.warn(message),
      }))
      .then(() => undefined)
      .catch((err: Error) => {
        // A messenger that threw is a fact about the messenger, not a reason to
        // lose the incident or to stop the queue.
        fastify.log.warn({ err: err.message }, 'isp-alerts: delivery attempt failed')
      })
  }

  orm.bus.on('model.created', (payload) => {
    if (payload.model !== 'isp_incidents') return
    enqueue(String(payload.id))
  })

  const drain = async (): Promise<void> => {
    const owed = await pendingAlertIds(incidents()).catch((err: Error) => {
      fastify.log.warn({ err: err.message }, 'isp-alerts: could not read owed incidents')
      return [] as string[]
    })
    for (const id of owed) enqueue(id)
  }

  const timer = setInterval(() => {
    void drain()
  }, RETRY_INTERVAL_MS)
  timer.unref()
  fastify.addHook('onClose', async () => {
    clearInterval(timer)
    await queue
  })

  fastify.log.info('isp-alerts: watching ISP incidents for the D18 alert leg')
}

export default ispAlertsModule
