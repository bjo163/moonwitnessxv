import process from 'node:process'
import { execSync } from 'node:child_process'

const MONOREPO_PORTS = [3000, 3001, 3002, 3003, 3004]

export function freeMonorepoPorts(ports = MONOREPO_PORTS): { freed: number[]; errors: string[] } {
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
