import type { ProvideCtx } from '@moonwitness/moonql'
import { probeTarget, type Measure, type ProbeDeps } from './probes.js'

/**
 * One monitoring tick. Only rows an operator registered for their own tenant are
 * attempted, one at a time, and the sweep stops when its budget runs out and
 * reports what it did not reach — an overrunning cron silences itself forever,
 * which reads to an operator exactly like a healthy network.
 *
 * A measurement of `unknown` never opens an incident: not having checked is a
 * different fact from the node being down, and conflating them would page someone
 * because this runtime lacks an ICMP helper.
 */
export interface SweepDeps extends ProbeDeps {
  now?: () => number
  budgetMs?: number
}

export interface SweepSummary {
  probed: number
  opened: number
  resolved: number
  deferred: number
}

/** A sweep that tried to reach more than this in one tick is a scanning storm. */
const sweepLimit = 200

export async function sweepMonitorTargets(orm: ProvideCtx['orm'], deps: SweepDeps = {}): Promise<SweepSummary> {
  const targets = orm.model('isp_monitor_targets')
  const incidents = orm.model('isp_incidents')
  const now = deps.now ?? Date.now
  const deadline = now() + (deps.budgetMs ?? 20_000)
  const summary: SweepSummary = { probed: 0, opened: 0, resolved: 0, deferred: 0 }
  const rows = await targets.list({ where: { enabled: true }, limit: sweepLimit })

  for (const target of rows) {
    if (now() >= deadline) {
      summary.deferred += 1
      continue
    }
    const tenantRef = String(target.tenantRef)
    const nodeRef = String(target.nodeRef)
    const outcome = await probeTarget(String(target.probeKind), String(target.targetRef), deps)
    const status: Measure = outcome.measure
    await targets.update(String(target.id), { status, checkedAt: new Date(now()).toISOString() })
    summary.probed += 1

    const open = await incidents.list({ where: { tenantRef, nodeRef, status: 'open' }, limit: 1 })
    if (status === 'unreachable' || status === 'degraded') {
      if (open.length === 0) {
        await incidents.create({
          tenantRef,
          nodeRef,
          severity: status === 'unreachable' ? 'critical' : 'major',
          status: 'open',
          summary: `${String(target.probeKind)} probe of ${String(target.targetRef)}: ${outcome.detail}`,
          openedAt: new Date(now()).toISOString(),
          notifyState: 'pending',
        })
        summary.opened += 1
      }
      continue
    }
    if (status === 'healthy' && open.length > 0) {
      await incidents.update(String(open[0]?.id), {
        status: 'resolved',
        resolvedAt: new Date(now()).toISOString(),
      })
      summary.resolved += 1
    }
  }

  return summary
}
