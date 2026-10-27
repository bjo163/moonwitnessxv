import process from 'node:process'
import { execSync } from 'node:child_process'
import { PORTS } from '@moonwitness/core'

/**
 * The port set comes from the shared contract, so `moon free-ports` cannot drift
 * behind a port change. `scripts/free-ports.mjs` keeps its own copy deliberately:
 * it is the escape hatch for a tree that has not been built yet, so it must not
 * import anything compiled (`apps/arsy/test/env-contract.test.ts` holds its
 * literals honest instead).
 */
const MONOREPO_PORTS = Object.values(PORTS)

export function freeMonorepoPorts(ports: readonly number[] = MONOREPO_PORTS): { freed: number[]; errors: string[] } {
  const freed: number[] = []
  const errors: string[] = []
  const isWindows = process.platform === 'win32'

  for (const port of ports) {
    try {
      if (isWindows) {
        // Windows netstat + taskkill
        const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] })
        const lines = out.trim().split('\n')
        const pids = new Set<string>()

        for (const line of lines) {
          const parts = line.trim().split(/\s+/)
          const last = parts[parts.length - 1]
          if (last && /^\d+$/.test(last) && last !== '0') {
            pids.add(last)
          }
        }

        for (const pid of pids) {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' })
        }
        freed.push(port)
      } else {
        // POSIX lsof + kill
        execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' })
        freed.push(port)
      }
    } catch {
      // Port might not be occupied; continue
    }
  }

  return { freed, errors }
}
