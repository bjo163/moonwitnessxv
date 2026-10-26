/**
 * @moonwitness/cli
 *
 * Developer & Operator Command-Line Tool for Moonwitness XV.
 */

import process from 'node:process'
import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PORTS } from '@moonwitness/core'
import type { Locale } from '@moonwitness/core'
import { freeMonorepoPorts } from './ports.js'
import { checkMonorepoServices } from './status.js'
import { cliMessage, resolveCliLocale } from './locale.js'

export { cliCopy, cliMessage, resolveCliLocale } from './locale.js'
export type { CliCopyKey, CliLocaleParse } from './locale.js'

export { freeMonorepoPorts, checkMonorepoServices }

/** Repo root, from this file's own location: `packages/cli/dist` -> the workspace. */
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const portList = Object.values(PORTS).join(', ')

export function printHelp(locale: Locale = 'en'): void {
  const text = `
🌙 ${cliMessage(locale, 'helpTitle')}

${cliMessage(locale, 'usage')}
  moon <command> [options]
  mw   <command> [options]

${cliMessage(locale, 'commands')}
  status        ${cliMessage(locale, 'statusCommand', { ports: portList })}
  free-ports    ${cliMessage(locale, 'freePortsCommand', { ports: portList })}
  verify        ${cliMessage(locale, 'verifyCommand')}
  help          ${cliMessage(locale, 'helpCommand')}

${cliMessage(locale, 'options')}
  --locale <id|en>  ${cliMessage(locale, 'localeOption')}

${cliMessage(locale, 'examples')}
  moon status
  moon free-ports
  mw verify
`
  console.info(text)
}

const localizedServiceName = (name: string, locale: Locale): string => {
  const message = {
    'Radio Core Hub (ARSY)': 'serviceHub',
    'Public Radio Dock': 'serviceDock',
    'Command Headquarters': 'serviceHeadquarters',
    'AI Gateway Router': 'serviceAiGateway',
    'Moondeck Cockpit': 'serviceCockpit',
  } as const
  const key = message[name as keyof typeof message]
  return key ? cliMessage(locale, key) : name
}

export function formatServiceStatusLine(
  service: { status: 'ONLINE' | 'OFFLINE'; port: number; name: string; url: string },
  locale: Locale,
): string {
  const symbol = service.status === 'ONLINE' ? '🟢' : '⚪'
  return `${symbol} [:${service.port}] ${localizedServiceName(service.name, locale).padEnd(26)} -> ${service.status} (${service.url})`
}

export async function runCli(args = process.argv.slice(2)): Promise<void> {
  const parsed = resolveCliLocale(args, process.env.MW_LOCALE)
  if (!parsed.ok) {
    const message = parsed.error === 'missing'
      ? cliMessage(parsed.locale, 'localeMissing')
      : cliMessage(parsed.locale, 'localeInvalid', { locale: parsed.value ?? '' })
    console.error(message)
    process.exitCode = 1
    return
  }
  const { locale, args: commandArgs } = parsed
  const command = commandArgs[0] || 'help'

  switch (command) {
    case 'status': {
      console.info(`📡 ${cliMessage(locale, 'statusProbe', { ports: portList })}`)
      const services = await checkMonorepoServices()
      for (const service of services) console.info(formatServiceStatusLine(service, locale))
      break
    }
    case 'free-ports': {
      console.info(`⚡ ${cliMessage(locale, 'freePortsStart')}`)
      const { freed } = freeMonorepoPorts()
      if (freed.length > 0) {
        console.info(`✔ ${cliMessage(locale, 'freedPorts', { ports: freed.map((port) => `:${port}`).join(', ') })}`)
      } else {
        console.info(`✔ ${cliMessage(locale, 'portsClear')}`)
      }
      break
    }
    case 'verify': {
      // the help advertised this command for a while without a case behind it,
      // so `moon verify` answered "Unknown command". It now runs the same gate CI runs.
      console.info(`🔎 ${cliMessage(locale, 'verifyStart')}`)
      try {
        execSync('pnpm verify', { stdio: 'inherit', cwd: repoRoot })
      } catch {
        // execSync already streamed the failure; mark the CLI itself as failed
        process.exitCode = 1
      }
      break
    }
    case 'help':
    case '--help':
    case '-h':
      printHelp(locale)
      break
    default:
      console.error(cliMessage(locale, 'unknownCommand', { command }))
      process.exitCode = 1
  }
}
