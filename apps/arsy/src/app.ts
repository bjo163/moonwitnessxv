import Fastify from 'fastify'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readdir } from 'node:fs/promises'
import { type JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import { bootMoonQl, moonqlRest } from '@moonwitness/moonql'
import { preferredLocale } from '@moonwitness/core'
import { loadPlugins, loadModules, loadChannels } from './lib/loader.js'
import { installEgress } from './lib/egress.js'
import { ChannelManager } from './lib/channels.js'
import { renderLaunchpadHtml } from './lib/launchpad.js'
import { addons } from './addons.js'
import type { RadioConfig } from './config.js'

const here = dirname(fileURLToPath(import.meta.url))

/**
 * Build the radio (IM hub) Fastify application.
 * Order: moonql boot -> plugins -> orm REST -> channels -> route modules.
 */
export async function buildApp(config: RadioConfig) {
  const app = Fastify({
    logger: { level: config.logLevel },
    // Only trust X-Forwarded-* when the operator says there is a proxy in front;
    // otherwise a client can spoof its own ip/host straight into the logs.
    trustProxy: config.trustProxy,
    ajv: { customOptions: { strictSchema: false } },
  }).withTypeProvider<JsonSchemaToTsProvider>()

  app.decorate('config', config)
  app.decorate('channels', new ChannelManager())

  // Outbound policy before anything can fetch: crons armed at boot (probe, now
  // playing) run through this gate.
  const egress = installEgress(config)
  app.log.info({ ...egress, deniedHosts: egress.denyHosts.length }, 'egress: outbound policy installed')

  // Single ORM bootstrap: addons installed, engine picked, schema synced.
  const modulesRoot = join(here, 'modules')
  const moduleDirs = (
    await Promise.all(
      (await readdir(modulesRoot, { withFileTypes: true }))
        .filter((e) => e.isDirectory())
        .map(async (e) => {
          // only folders with a real index entry claim their path (empty dirs don't)
          const files = await readdir(join(modulesRoot, e.name)).catch(() => [])
          return files.some((f) => /^index\.(js|ts|mjs)$/.test(f) && !f.endsWith('.d.ts')) ? e.name : null
        }),
    )
  ).filter((n): n is string => n !== null)
  const moonql = await bootMoonQl({
    databaseUrl: config.database.url || undefined,
    autoSync: config.database.autoSync,
    addons,
    reservedPaths: moduleDirs, // generated REST vs handwritten module collision guard
    env: config.addonEnv, // allow-list slice (config.ADDON_ENV_KEYS) — never process.env
    cronEnabled: config.orm.cronEnabled,
    seedPolicy: config.orm.seedPolicy,
    aclPolicy: config.orm.aclPolicy,
    requirePg: config.env === 'production',
    log: app.log,
  })

  app.decorate('moonql', moonql)
  app.addHook('onClose', async () => moonql.close())

  await loadPlugins(app, join(here, 'plugins'))

  // Auto-REST for addon models + declarative endpoints, before handwritten modules.
  await app.register(moonqlRest, { prefix: config.api.prefix, instance: moonql, apiVersion: config.api.version })

  await loadChannels(app, app.channels, join(here, 'channels'), config)
  await loadModules(app, join(here, 'modules'), config.api.prefix)

  // Service index: one place that answers "what runs where?" for operators and
  // the two frontends (root is free — every module mounts under the api prefix).
  // Browser visitors (Accept: text/html) receive a sleek visual Launchpad portal.
  app.get('/', { schema: { tags: ['system'], summary: 'Service index' } }, async (req, reply) => {
    const isBrowser = Boolean(req.headers.accept?.startsWith('text/html'))
    const payload = {
      name: config.api.title,
      version: config.api.version,
      engine: moonql.engine,
      api: config.api.prefix,
      docs: '/docs',
      // the machine-readable face of the same document: frontends and codegen tools
      // should not have to know that swagger-ui serves its spec under /docs/json
      openapi: '/docs/json',
      health: `${config.api.prefix}/health`,
      metrics: `${config.api.prefix}/metrics`,
      studio: `${config.api.prefix}/studio`,
      frontends: config.frontends,
    }

    if (isBrowser) {
      const locale = preferredLocale(req.headers['accept-language']) ?? 'en'
      return reply.header('Vary', 'Accept-Language').type('text/html; charset=utf-8').send(renderLaunchpadHtml(payload, locale))
    }

    return payload
  })

  // Release channel resources on shutdown.
  app.addHook('onClose', async () => app.channels.shutdownAll())

  await app.ready()
  return app
}
