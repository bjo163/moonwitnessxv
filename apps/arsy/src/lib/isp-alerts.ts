import type { ModelRepo } from '@moonwitness/moonql'

/**
 * The D18 leg for ISP network alerts. An incident is D20's record; delivering a
 * message about it is SKYLINK's job, so this module only ever submits an intent
 * through the channel manager and writes back what happened.
 *
 * Two facts make the state machine worth having: the sending process can restart
 * with an operator still un-notified, and a messenger that is merely down must
 * not be recorded as notified. Attempts are therefore counted, capped, and kept
 * on the incident rather than in memory.
 */
export const MAX_ALERT_ATTEMPTS = 3

/** Settings are operator-authored, so the destination is read, never assumed. */
export const ALERT_DESTINATION_SETTING = 'isp_alert_to'
export const FALLBACK_DESTINATION_SETTING = 'announce_to'

interface OrmLike {
  model(name: string): ModelRepo
}

export interface AlertChannelResult {
  ok: boolean
  channel: string
  error?: string
}

export interface AlertDeps {
  broadcast: (input: { to: string; text: string }) => Promise<AlertChannelResult[]>
  now?: () => number
  warn?: (message: string) => void
}

export type AlertOutcome = 'sent' | 'retry' | 'exhausted' | 'pending' | 'unknown-incident'

const settingOf = async (orm: OrmLike, key: string): Promise<string> => {
  const rows = await orm.model('settings_entries').list({ where: { key }, limit: 1 })
  return String(rows[0]?.value ?? '')
}

const clip = (value: string): string => (value.length > 200 ? `${value.slice(0, 199)}…` : value)

const alertText = async (orm: OrmLike, incident: Record<string, unknown>): Promise<string> => {
  const tenants = await orm.model('isp_tenants').list({ where: { id: String(incident.tenantRef) }, limit: 1 })
  const tenant = String(tenants[0]?.name ?? tenants[0]?.slug ?? incident.tenantRef)
  return `[ISP ${String(incident.severity)}] ${tenant}: ${String(incident.summary ?? 'network incident')}`
}

/**
 * One delivery attempt for one incident. The row is re-read because a bus event
 * and a retry sweep can name the same incident; only a row still marked pending
 * may be sent, so the second caller leaves it alone.
 */
export async function deliverIncidentAlert(
  orm: OrmLike,
  incidents: ModelRepo,
  incidentId: string,
  deps: AlertDeps,
): Promise<AlertOutcome> {
  const now = deps.now ?? Date.now
  const found = await incidents.list({ where: { id: incidentId }, limit: 1 })
  const incident = found[0]
  if (!incident) return 'unknown-incident'
  if (String(incident.notifyState) !== 'pending') return 'pending'

  const destination = await settingOf(orm, ALERT_DESTINATION_SETTING)
  const to = destination.length > 0 ? destination : await settingOf(orm, FALLBACK_DESTINATION_SETTING)
  if (to.length === 0) {
    // No destination is an operator-configurable state, not a delivery failure,
    // so the attempt counter stays untouched and the alert is still owed.
    deps.warn?.('isp-alerts: no alert destination is configured; the incident stays owed')
    return 'pending'
  }

  const attempts = Number(incident.notifyAttempts ?? 0) + 1
  const results = await deps.broadcast({ to, text: await alertText(orm, incident) })
  const delivered = results.some((result) => result.ok)
  if (delivered) {
    await incidents.update(incidentId, {
      notifyState: 'sent',
      notifyAttempts: attempts,
      notifiedAt: new Date(now()).toISOString(),
      notifyDetail: clip(`sent to ${to}`),
    })
    return 'sent'
  }

  const refused = results.map((result) => `${result.channel}: ${result.error ?? 'refused'}`).join(', ')
  const terminal = attempts >= MAX_ALERT_ATTEMPTS
  await incidents.update(incidentId, {
    notifyState: terminal ? 'failed' : 'pending',
    notifyAttempts: attempts,
    notifyDetail: clip(refused || 'no channel answered'),
  })
  if (!terminal) deps.warn?.(`isp-alerts: attempt ${attempts} for ${incidentId} was refused; it will be retried`)
  return terminal ? 'exhausted' : 'retry'
}

/** Incidents still owed an operator notice, oldest first, excluding dead rows. */
export async function pendingAlertIds(incidents: ModelRepo): Promise<string[]> {
  const rows = await incidents.list({
    where: { notifyState: 'pending', status: 'open' },
    limit: 50,
  })
  return rows.map((row) => String(row.id))
}
