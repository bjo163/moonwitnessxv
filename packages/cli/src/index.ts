/**
 * @moonwitness/cli
 *
 * Developer & Operator Command-Line Tool for Moonwitness XV.
 */

import process from 'node:process'
import { freeMonorepoPorts } from './ports.js'
import { checkMonorepoServices } from './status.js'

export { freeMonorepoPorts, checkMonorepoServices }

export function printHelp(): void {
  const text = `
🌙 MOONWITNESS XV — OPERATOR COMMAND LINE INTERFACE (CLI)

Usage:
  moon <command> [options]
  mw   <command> [options]

Commands:
  status        Check health and port occupancy across all 5 microservices (3000-3004)
  free-ports    Forcefully release bound ports (3000, 3001, 3002, 3003, 3004)
  verify        Execute the 6-stage monorepo verification pipeline
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
      console.info('📡 Probing Moonwitness microservice ports (3000-3004)...')
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
