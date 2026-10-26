import { z } from 'zod'

const ConfigSchema = z.object({
  HOST: z.string().trim().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3005),
})

export interface SkylinkConfig {
  host: string
  port: number
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
    HOST: environment.HOST,
    PORT: requestedPort ?? environment.PORT,
  })
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'config'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Invalid SKYLINK configuration: ${details}`)
  }

  return { host: parsed.data.HOST, port: parsed.data.PORT }
}

export function loadConfig(): SkylinkConfig {
  return parseConfig(process.env, process.argv.slice(2))
}
