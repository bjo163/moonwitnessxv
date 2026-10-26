import { readdir, access } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import type { ChannelManager, ChannelFactory } from './channels.js'
import type { RadioConfig } from '../config.js'

type AnyPlugin = FastifyPluginAsync

const isSource = (f: string) => /\.(js|ts)$/.test(f) && !f.endsWith('.d.ts')

/** Resolve a real entry file, working in dev (.ts) and prod (.js). */
async function resolveFile(dir: string, name: string): Promise<string | null> {
  for (const ext of ['.js', '.ts', '.mjs']) {
    const p = join(dir, `${name}${ext}`)
    try {
      await access(p)
      return p
    } catch {
      /* try next */
    }
  }
  return null
}

async function importDefault(file: string): Promise<unknown> {
  const mod = await import(pathToFileURL(file).href)
  if (!mod.default) throw new Error(`"${file}" has no default export`)
  return mod.default
}

/** Auto-register global plugins from `dir` (alphabetical order). */
export async function loadPlugins(app: FastifyInstance, dir: string): Promise<void> {
  const files = (await readdir(dir)).filter(isSource).sort()
  for (const file of files) {
    const plugin = (await importDefault(join(dir, file))) as AnyPlugin
    await app.register(plugin)
    app.log.debug(`registered plugin: ${file}`)
  }
}

/** Auto-register route modules; each folder mounts at `<prefix>/<folder>`. */
export async function loadModules(app: FastifyInstance, dir: string, prefix: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true })
  const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort()
  for (const folder of folders) {
    const entry = await resolveFile(join(dir, folder), 'index')
    if (!entry) {
      app.log.warn(`module "${folder}" skipped: no index entry file`)
      continue
    }
    const plugin = (await importDefault(entry)) as AnyPlugin
    await app.register(plugin, { prefix: `${prefix}/${folder}` })
    app.log.debug(`registered module: ${prefix}/${folder}`)
  }
}

/** Auto-register channel plugins from `dir`; factories may return null to opt out. */
export async function loadChannels(
  app: FastifyInstance,
  manager: ChannelManager,
  dir: string,
  config: RadioConfig,
): Promise<void> {
  const files = (await readdir(dir)).filter(isSource).sort()
  for (const file of files) {
    const factory = (await importDefault(join(dir, file))) as ChannelFactory
    const channel = await factory(config)
    if (!channel) {
      app.log.info(`channel "${file}" disabled by config`)
      continue
    }
    manager.register(channel)
    app.log.info(`channel registered: ${channel.id}`)
  }
}
