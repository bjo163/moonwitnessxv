#!/usr/bin/env node
/**
 * Dev runner escape hatch: frees the dev ports (radio :3000, dock :3001,
 * headquarters :3002, ai gateway :3003, cockpit :3004, SKYLINK :3005, ECHOLOG :3006) and the repo's leftover dev processes.
 *
 * `pnpm dev` (scripts/dev.mjs) already kills its own process tree on Ctrl+C, but
 * an earlier run started some other way — a bare `next dev`, a crashed watcher,
 * or a Stop-Process that skipped the children — can leave the ports held. This is
 * the way back without rebooting:
 *
 *   pnpm ports:free
 *
 * Windows: parses `netstat -ano`, kills each PID **with its tree** (/T).
 * macOS/Linux: uses `lsof -ti tcp:<ports> -sTCP:LISTEN`, SIGKILL.
 *
 * Every external command runs through execFileSync (argv array, no shell), so
 * no port/PID value can ever be interpreted as shell syntax.
 */
import { execFileSync } from 'node:child_process'
import { waitForPortsFree } from './port-utils.mjs'

const PORTS = [3000, 3001, 3002, 3003, 3004, 3005, 3006]
const isWindows = process.platform === 'win32'

const run = (file, args) => execFileSync(file, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })

function listeningPids() {
  const pids = new Set()
  try {
    if (isWindows) {
      const out = run('netstat', ['-ano'])
      for (const line of out.split(/\r?\n/)) {
        const match = /^\s*TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)/i.exec(line)
        if (!match) continue
        const port = Number(match[1])
        const pid = Number(match[2])
        if (PORTS.includes(port) && Number.isInteger(pid) && pid > 0) pids.add(pid)
      }
    } else {
      const out = run('lsof', ['-ti', `tcp:${PORTS.join(',')}`, '-sTCP:LISTEN'])
      for (const pid of out.split(/\s+/)) if (pid) pids.add(Number(pid))
    }
  } catch {
    /* nothing listening / lsof absent */
  }
  return pids
}

const pids = listeningPids()

// `node --watch` supervisors and `pnpm --filter @moonwitness/*` wrappers do not
// hold the port themselves, so a socket scan misses them and they pile up as
// idle "waiting for file changes" processes. Match this repo's dev commands.
if (isWindows) {
  const DEV_TREE = /src[\\/]server\.ts|src[\\/]index\.ts|scripts[\\/]dev\.mjs|--filter @moonwitness\/|@moonwitness[\\/][a-z]+[\\/]node_modules[\\/]\.bin/
  try {
    const out = run('powershell', [
      '-NoProfile',
      '-Command',
      "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine } | ForEach-Object { \"$($_.ProcessId)|$($_.CommandLine)\" }",
    ])
    for (const line of out.split(/\r?\n/)) {
      const sep = line.indexOf('|')
      if (sep <= 0) continue
      const pid = Number(line.slice(0, sep))
      const cmd = line.slice(sep + 1)
      if (Number.isInteger(pid) && pid > 0 && DEV_TREE.test(cmd)) pids.add(pid)
    }
  } catch {
    /* powershell unavailable: socket scan only */
  }
}

if (pids.size === 0) {
  console.log(`ports:free — nothing listening on ${PORTS.join(', ')}`)
  process.exit(0)
}

for (const pid of pids) {
  try {
    if (isWindows) run('taskkill', ['/PID', String(pid), '/T', '/F'])
    else process.kill(pid, 'SIGKILL')
    console.log(`ports:free — killed pid ${pid}`)
  } catch {
    // Usually a child of a tree that /T already took down; the port check below
    // is the real verdict, so staying quiet here avoids five lines of noise.
  }
}

const remaining = listeningPids()
if (remaining.size > 0) {
  console.error(`ports:free — still busy: ${[...remaining].join(', ')}`)
  process.exit(1)
}

// A killed listener can keep the port unbindable for a moment; wait it out.
const busy = await waitForPortsFree(PORTS, 10000)
if (busy.length > 0) {
  console.error(`ports:free — kernels still hold ${busy.join(', ')}; retry in a few seconds`)
  process.exit(1)
}
console.log(`ports:free — ${PORTS.join(', ')} are free`)
