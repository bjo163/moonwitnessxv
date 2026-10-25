import {
  ADMIN_FULL,
  ADMIN_ONLY,
  BUS_EVENTS,
  busStream,
  defineAddon,
  defineModel,
  int,
  sel,
  str,
  type ProvideCtx,
} from '@moonwitness/moonql'

/**
 * moonql-ops — the observability addon: an audit trail, a cron monitor, one
 * dashboard endpoint and a live SSE stream. It never touches another addon's
 * files: everything arrives through `observe(bus)` and the metadata contract.
 */

const AUDIT_KEYS = new Set(['id', 'createdAt', 'updatedAt'])
const summaryOf = (row: Record<string, unknown>): string =>
  Object.keys(row)
    .filter((key) => !AUDIT_KEYS.has(key))
    .join(', ')
    .slice(0, 240)

/**
 * Retention: bulk delete in bounded passes (never one statement per row) and
 * without bus events — a purge that announced each row would instantly refill
 * the very table it is trimming.
 */
async function purgeOlder(orm: ProvideCtx['orm'], model: 'ops_audit' | 'ops_jobs', days: number) {
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString()
  const repo = orm.model(model)
  let removed = 0
  for (let pass = 0; pass < 50; pass++) {
    const chunk: number = await repo.removeWhere({ createdAt: { lt: cutoff } }, 1000)
    removed += chunk
    if (chunk < 1000) break
  }
  return { model, days, removed }
}

/** bus payloads are `{model,id,row}` — the "who" is not on the bus, by design */
function auditWriter({ orm, log }: Pick<ProvideCtx, 'orm' | 'log'>) {
  return (action: 'create' | 'update' | 'delete', model: string, recordId: string, summary: string | null): void => {
    void orm
      .model('ops_audit')
      .create({ model: model.slice(0, 60), action, recordId: recordId.slice(0, 36), summary })
      .catch((err: Error) => log.warn({ err: err.message }, 'moonql-ops: audit write failed'))
  }
}

export const ops = defineAddon({
  name: 'ops',
  version: '1.0.0',
  depends: ['auth'],
  models: {
    ops_audit: defineModel({
      label: 'Audit entry',
      seedless: true,
      rest: { list: true, get: true },
      fields: {
        model: str({ maxLength: 60, index: true }),
        action: sel(['create', 'update', 'delete']),
        recordId: str({ maxLength: 36, index: true }),
        summary: str({ maxLength: 240, null: true }),
      },
      acl: ADMIN_FULL,
      menu: { group: 'System', icon: '🧾', order: 20 },
    }),
    ops_jobs: defineModel({
      label: 'Cron job run',
      seedless: true,
      rest: { list: true, get: true },
      fields: {
        job: str({ maxLength: 80, index: true }),
        status: sel(['ok', 'error']),
        durationMs: int({ default: 0 }),
        detail: str({ maxLength: 500, null: true }),
      },
      acl: ADMIN_FULL,
      menu: { group: 'System', icon: '⏱️', order: 30 },
    }),
  },
  endpoints: {
    dashboard: {
      path: '/ops/dashboard',
      method: 'GET',
      requires: ADMIN_ONLY,
      menu: { group: 'System', icon: '📊', order: 10 },
      handler: async ({ orm, engine, schema }) => {
        const doc = schema()
        const names = Object.keys(doc.models)
        const counts = await Promise.all(names.map(async (name) => Number(await orm.model(name).count())))

        const recentJobs = await orm.model('ops_jobs').search({ limit: 100, order: '-createdAt' })
        const lastRun = new Map<string, string>()
        for (const row of recentJobs.rows as Array<Record<string, unknown>>) {
          const job = String(row.job)
          if (!lastRun.has(job)) lastRun.set(job, String(row.createdAt))
        }

        return {
          engine,
          startedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
          uptimeSec: Math.round(process.uptime()),
          minDemoRows: doc.minDemoRows,
          addons: doc.addons,
          busEvents: BUS_EVENTS,
          models: names.map((name, index) => {
            const meta = doc.models[name]!
            return {
              name,
              label: meta.label,
              addon: meta.addon,
              dataTier: meta.dataTier,
              count: counts[index] ?? 0,
              rest: meta.operations,
              delete: meta.delete,
            }
          }),
          views: Object.entries(doc.views).map(([key, view]) => ({
            key,
            label: view.label,
            addon: view.addon,
            from: view.from,
            aggregate: Boolean(view.aggregate),
            acl: view.acl,
          })),
          crons: doc.crons.map((cron) => ({ ...cron, lastRun: lastRun.get(`${cron.addon}/${cron.name}`) ?? null })),
          audit: (await orm.model('ops_audit').search({ limit: 10, order: '-createdAt' })).rows,
          jobs: recentJobs.rows.slice(0, 10),
        }
      },
    },
    liveStream: {
      path: '/ops/stream',
      method: 'GET',
      requires: ADMIN_ONLY,
      stream: true,
      handler: ({ bus, query, signal }) =>
        busStream(bus, {
          limit: Number(query.limit ?? 0) || 0,
          seconds: Number(query.seconds ?? 0) || 0,
          signal,
        }),
    },
  },
  cron: [
    {
      name: 'purge-audit',
      every: '1d',
      run: async ({ orm, env }) => purgeOlder(orm, 'ops_audit', Number(env.OPS_AUDIT_RETENTION_DAYS ?? 14) || 14),
    },
    {
      // every cron tick of every addon lands here: without a retention window
      // this table grows fastest exactly when the system is busiest
      name: 'purge-jobs',
      every: '1d',
      run: async ({ orm, env }) => purgeOlder(orm, 'ops_jobs', Number(env.OPS_JOB_RETENTION_DAYS ?? 7) || 7),
    },
  ],
  observe: (bus, ctx) => {
    const audit = auditWriter(ctx)
    // feedback guard: an audit row must never produce an audit row
    const skip = (model: string) => model.startsWith('ops_')

    bus.on('model.created', (p) => {
      if (!skip(p.model)) audit('create', p.model, p.id, summaryOf(p.row))
    })
    bus.on('model.updated', (p) => {
      if (!skip(p.model)) audit('update', p.model, p.id, summaryOf(p.row))
    })
    bus.on('model.deleted', (p) => {
      if (!skip(p.model)) audit('delete', p.model, p.id, null)
    })
    bus.on('cron.run', (p) => {
      void ctx.orm
        .model('ops_jobs')
        .create({ job: `${p.addon}/${p.cron}`.slice(0, 80), status: p.status, durationMs: p.durationMs, detail: p.detail })
        .catch((err: Error) => ctx.log.warn({ err: err.message }, 'moonql-ops: job log write failed'))
    })
  },
})

export default ops
