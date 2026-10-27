import { z } from 'zod'

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().trim().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3005),
  DATABASE_URL: z.string().trim().default(''),
  SKYLINK_ARSY_URL: z.string().url().default('http://127.0.0.1:3000'),
  SKYLINK_SERVICE_KEY: z.string().max(256).default(''),
  SKYLINK_TELEGRAM_BOT_TOKEN: z.string().default(''),
  SKYLINK_TELEGRAM_WEBHOOK_SECRET: z.string().default(''),
})

export interface SkylinkConfig {
  host: string
  port: number
  databaseUrl: string
  arsyUrl: string
  serviceKey: string
  telegramBotToken: string
  telegramWebhookSecret: string
}

export function parseConfig(
  environment: Record<string, string | undefined>,
  args: readonly string[] = [],
): SkylinkConfig {
  let requestedPort: string | undefined

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--port') {
      const value = args[index + 1]
      if (value === undefined || value.startsWith('--')) {
        throw new Error('Invalid command line configuration: --port requires an integer from 1 to 65535.')
      }
      if (requestedPort !== undefined) {
        throw new Error('Invalid command line configuration: --port may be provided only once.')
      }
      requestedPort = value
      index += 1
    } else if (argument?.startsWith('--port=')) {
      if (requestedPort !== undefined) {
        throw new Error('Invalid command line configuration: --port may be provided only once.')
      }
      requestedPort = argument.slice('--port='.length)
    }
  }

  const parsed = ConfigSchema.safeParse({
    NODE_ENV: environment.NODE_ENV,
    HOST: environment.HOST,
    PORT: requestedPort ?? environment.PORT,
    DATABASE_URL: environment.DATABASE_URL,
    SKYLINK_ARSY_URL: environment.SKYLINK_ARSY_URL,
    SKYLINK_SERVICE_KEY: environment.SKYLINK_SERVICE_KEY,
    SKYLINK_TELEGRAM_BOT_TOKEN: environment.SKYLINK_TELEGRAM_BOT_TOKEN,
    SKYLINK_TELEGRAM_WEBHOOK_SECRET: environment.SKYLINK_TELEGRAM_WEBHOOK_SECRET,
  })
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'config'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Invalid SKYLINK configuration: ${details}`)
  }

  if (parsed.data.SKYLINK_SERVICE_KEY.length > 0 && parsed.data.SKYLINK_SERVICE_KEY.length < 32) {
    throw new Error('Invalid SKYLINK configuration: SKYLINK_SERVICE_KEY must be at least 32 characters when configured.')
  }
  if (parsed.data.NODE_ENV === 'production' && (!parsed.data.DATABASE_URL || !parsed.data.SKYLINK_SERVICE_KEY)) {
    throw new Error('Invalid SKYLINK production configuration: DATABASE_URL and SKYLINK_SERVICE_KEY are required.')
  }
  if (Boolean(parsed.data.SKYLINK_TELEGRAM_BOT_TOKEN) !== Boolean(parsed.data.SKYLINK_TELEGRAM_WEBHOOK_SECRET)) {
    throw new Error('Invalid SKYLINK configuration: Telegram bot token and webhook secret must be configured together.')
  }
  if (parsed.data.SKYLINK_TELEGRAM_WEBHOOK_SECRET.length > 0 && parsed.data.SKYLINK_TELEGRAM_WEBHOOK_SECRET.length < 32) {
    throw new Error('Invalid SKYLINK configuration: Telegram webhook secret must be at least 32 characters.')
  }

  return {
    host: parsed.data.HOST,
    port: parsed.data.PORT,
    databaseUrl: parsed.data.DATABASE_URL,
    arsyUrl: parsed.data.SKYLINK_ARSY_URL,
    serviceKey: parsed.data.SKYLINK_SERVICE_KEY,
    telegramBotToken: parsed.data.SKYLINK_TELEGRAM_BOT_TOKEN,
    telegramWebhookSecret: parsed.data.SKYLINK_TELEGRAM_WEBHOOK_SECRET,
  }
}

export function loadConfig(): SkylinkConfig {
  return parseConfig(process.env, process.argv.slice(2))
}
