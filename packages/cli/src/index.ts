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
import { freeMonorepoPorts } from './ports.js'
import { checkMonorepoServices } from './status.js'

export { freeMonorepoPorts, checkMonorepoServices }

/** Repo root, from this file's own location: `packages/cli/dist` -> the workspace. */
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const portList = Object.values(PORTS).join(', ')

export function printHelp(): void {
  const text = `
🌙 MOONWITNESS XV — OPERATOR COMMAND LINE INTERFACE (CLI)

Usage:
  moon <command> [options]
  mw   <command> [options]

Commands:
  status        Probe every workspace service (${portList}) and report ONLINE/OFFLINE
  free-ports    Release the bound ports (${portList})
  verify        Execute the monorepo verification pipeline (pnpm verify)
  help          Display this mission operator manual

Examples:
  moon status
  moon free-ports
  mw verify
`
  console.info(text)
}

export async function runCli(args = process.argv.slice(2)): Promise<void> {
  const command = args[0] || 'help'

  switch (command) {
    case 'status': {
      console.info(`📡 Probing Moonwitness service ports (${portList})...`)
      const services = await checkMonorepoServices()
      for (const s of services) {
        const symbol = s.status === 'ONLINE' ? '🟢' : '⚪'
        console.info(`${symbol} [:${s.port}] ${s.name.padEnd(26)} -> ${s.status} (${s.url})`)
      }
      break
    }
    case 'free-ports': {
      console.info('⚡ Releasing all bound microservice ports (3000-3004)...')
      const { freed } = freeMonorepoPorts()
      if (freed.length > 0) {
        console.info(`✔ Freed ports: ${freed.map((p) => `:${p}`).join(', ')}`)
      } else {
        console.info('✔ Ports 3000-3004 were already clear.')
      }
      break
    }
    case 'verify': {
      // the help advertised this command for a while without a case behind it,
      // so `moon verify` answered "Unknown command". It now runs the same gate CI runs.
      console.info('🔎 Running the monorepo verification pipeline: pnpm verify')
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
      printHelp()
      break
    default:
      console.error(`Unknown command: "${command}". Run "moon help" for available commands.`)
      process.exitCode = 1
  }
}
