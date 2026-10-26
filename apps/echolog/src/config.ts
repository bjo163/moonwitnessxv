import { z } from 'zod'

const ConfigSchema = z.object({
  host: z.string().trim().min(1).default('127.0.0.1'),
  port: z.coerce.number().int().min(1).max(65535).default(3006),
})

export interface EchologConfig {
  host: string
  port: number
}

export function parseConfig(
  environment: Record<string, string | undefined>,
  args: readonly string[] = [],
): EchologConfig {
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
    host: environment.ECHOLOG_HOST,
    port: requestedPort ?? environment.ECHOLOG_PORT,
  })
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join('.') || 'config'}: ${issue.message}`).join('; ')
    throw new Error(`Invalid ECHOLOG configuration: ${details}`)
  }

  return parsed.data
}

export function loadConfig(): EchologConfig {
  return parseConfig(process.env, process.argv.slice(2))
}
