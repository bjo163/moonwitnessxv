import { z } from 'zod'
import { API_PREFIX as API_PREFIX_DEFAULT, FRONTEND_URLS, PORTS, SITE_NAME } from '@moonwitness/core'

// ---- The single, validated source of configuration ----
// All env parsing lives here, once. Invalid environment -> fail fast at boot
// with one clear error listing every bad variable.

const bool = (fallback: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined ? fallback : ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())))

const EnvSchema = z.object({
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(PORTS.hub),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CORS_ORIGIN: z
    .string()
    // `*` reflects every origin: possible, but a deliberate opt-in, never the default
    .default(`${FRONTEND_URLS.dock},${FRONTEND_URLS.headquarters}`),

  RADIO_PORT: z.coerce.number().int().positive().optional(),
  RADIO_PREFIX: z.string().optional(),
  API_PREFIX: z.string().default(API_PREFIX_DEFAULT),
  RADIO_TITLE: z.string().optional(),
  API_TITLE: z.string().default(`${SITE_NAME} Hub API`),
  API_VERSION: z.string().default('1.0.0'),

  DATABASE_URL: z.string().default(''),
  MOONQL_AUTOSYNC: bool(true),
  MOONQL_CRON_ENABLED: bool(true),
  MOONQL_SEED_POLICY: z.enum(['off', 'warn', 'require']).default('warn'),
  // Production/compose should run 'require': a REST model without a write rule
  // is anonymous-writable, and that must never boot silently.
  MOONQL_ACL_POLICY: z.enum(['off', 'warn', 'require']).default('warn'),
  TRUST_PROXY: bool(false),

  WHATSAPP_ENABLED: bool(false),
  WHATSAPP_AUTH_DIR: z.string().default('./data/whatsapp-auth'),
  WHATSAPP_AUTO_CONNECT: bool(false),
  WHATSAPP_BOT_ENABLED: bool(true),
  WHATSAPP_BOT_GREETING: z.string().default('Moonwitness WhatsApp bot is online.'),

  // Inbound webhook receiver: opt-in, and the module refuses to mount it with an
  // empty token (a public writer that anyone can feed and read).
  DENPA_ENABLED: bool(false),
  DENPA_TOKEN: z.string().default(''),

  DOCK_URL: z.string().default(FRONTEND_URLS.dock),

  // Unauthenticated entry points (/auth/login, /listen): attempts per window per ip.
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(60_000),
  HQ_URL: z.string().default(FRONTEND_URLS.headquarters),

  // extra hostnames the egress gate must refuse on top of its built-in list
  // (db, radio, dock, headquarters, localhost, metadata.google.internal); comma
  // separated. Read only by the hub's own outbound fetch policy.
  EGRESS_DENY_HOSTS: z.string().default(''),
})

/**
 * Every variable the hub itself understands. Exported so `.env.example` can be
 * checked against the real contract instead of drifting away from it.
 */
export const RADIO_ENV_KEYS: string[] = Object.keys(EnvSchema.shape)

/**
 * The only variables addons may read through `ctx.env`. Addons never see
 * process.env: the session secret, the database URL and the CORS list are the
 * hub's business, not a feature plugin's.
 */
const ADDON_ENV_KEYS = [
  'NODE_ENV',
  'MOONQL_AUTH_ADMIN_PASSWORD',
  'OPS_AUDIT_RETENTION_DAYS',
  'OPS_JOB_RETENTION_DAYS',
  'PLAYLOG_RETENTION_DAYS',
  // opt-in door for the hub's outbound fetches (station probe, now-playing)
  'EGRESS_ENABLED',
  'WHATSAPP_AUTH_DIR',
  'DENPA_TOKEN',
] as const

/** exported for the env contract test (`.env.example` may only use known keys) */
export const ADDON_ENV_KEY_LIST: string[] = [...ADDON_ENV_KEYS]

export interface RadioConfig {
  host: string
  port: number
  env: 'development' | 'production' | 'test'
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
  cors: { origin: string[] | boolean }
  api: { prefix: string; title: string; version: string }
  database: { url: string; autoSync: boolean }
  orm: { cronEnabled: boolean; seedPolicy: 'off' | 'warn' | 'require'; aclPolicy: 'off' | 'warn' | 'require' }
  trustProxy: boolean
  security: { rateLimit: { max: number; windowMs: number } }
  channels: {
    whatsapp: {
      enabled: boolean
      authDir: string
      autoConnect: boolean
      botEnabled: boolean
      botGreeting: string
    }
  }
  denpa: { enabled: boolean; token: string }
  /** outbound fetch policy: names this process must never call, plus its own port */
  egress: { denyHosts: string[] }
  /** explicit allow-list slice handed to addons as `ctx.env` */
  addonEnv: Record<string, string | undefined>
  /** the two Next.js frontends this hub serves (advertised by GET /) */
  frontends: { dock: string; headquarters: string }
}

export function loadConfig(): RadioConfig {
  // Treat empty strings (e.g. `PORT=` in .env) as "not set".
  const cleaned = Object.fromEntries(
    Object.entries(process.env).filter(([, v]) => v !== ''),
  )
  const parsed = EnvSchema.safeParse(cleaned)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(`Invalid environment configuration:\n${issues}`)
  }
  const e = parsed.data
  // `*` reflects every origin; a list is trimmed so "http://a, http://b" works
  const corsOrigin =
    e.CORS_ORIGIN === '*' ? true : e.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)

  return {
    host: e.HOST,
    port: e.RADIO_PORT ?? e.PORT,
    env: e.NODE_ENV,
    logLevel: e.LOG_LEVEL,
    cors: { origin: corsOrigin },
    api: {
      prefix: e.RADIO_PREFIX ?? e.API_PREFIX,
      title: e.RADIO_TITLE ?? e.API_TITLE,
      version: e.API_VERSION,
    },
    database: { url: e.DATABASE_URL, autoSync: e.MOONQL_AUTOSYNC },
    orm: {
      cronEnabled: e.MOONQL_CRON_ENABLED,
      seedPolicy: e.MOONQL_SEED_POLICY,
      aclPolicy: e.MOONQL_ACL_POLICY,
    },
    trustProxy: e.TRUST_PROXY,
    security: { rateLimit: { max: e.RATE_LIMIT_MAX, windowMs: e.RATE_LIMIT_WINDOW_MS } },
    channels: {
      whatsapp: {
        enabled: e.WHATSAPP_ENABLED,
        authDir: e.WHATSAPP_AUTH_DIR,
        autoConnect: e.WHATSAPP_AUTO_CONNECT,
        botEnabled: e.WHATSAPP_BOT_ENABLED,
        botGreeting: e.WHATSAPP_BOT_GREETING,
      },
    },
    denpa: { enabled: e.DENPA_ENABLED, token: e.DENPA_TOKEN },
    egress: { denyHosts: e.EGRESS_DENY_HOSTS.split(',').map((host) => host.trim()).filter(Boolean) },
    addonEnv: Object.fromEntries(ADDON_ENV_KEYS.map((key) => [key, process.env[key]])),
    frontends: { dock: e.DOCK_URL, headquarters: e.HQ_URL },
  }
}
