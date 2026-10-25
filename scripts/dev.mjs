#!/usr/bin/env node
/**
 * Dev runner for the three long-lived processes (radio hub, dock, headquarters).
 *
 * Why not `pnpm --parallel`? It makes the child Next.js processes start with a
 * non-development NODE_ENV ("You are using a non-standard NODE_ENV value"),
 * and Ctrl+C on Windows kills only pnpm, leaving the Next.js children bound to
 * :3001/:3002 so the next `pnpm dev` dies with EADDRINUSE.
 *
 * This runner starts every app as a plain `pnpm --filter <pkg> dev`, prefixes
 * the output, and kills the whole process tree on Ctrl+C / SIGTERM.
 *
 *   pnpm dev            # build libs, then run everything
 *   node scripts/dev.mjs radio,dock   # subset
 */
import { spawn, execFileSync } from 'node:child_process'
import { createInterface } from 'node:readline'
import { waitForPortsFree } from './port-utils.mjs'

const APPS = [
  { tag: 'radio', pkg: '@moonwitness/radio', port: Number(process.env.RADIO_PORT ?? 3000) },
  { tag: 'dock', pkg: '@moonwitness/dock', port: 3001 },
  { tag: 'hq', pkg: '@moonwitness/headquarters', port: 3002 },
]

const only = (process.argv[2] ?? '').split(',').map((s) => s.trim()).filter(Boolean)
const selected = only.length > 0 ? APPS.filter((app) => only.includes(app.tag)) : APPS
const isWindows = process.platform === 'win32'
const width = Math.max(...selected.map((app) => app.tag.length))

// `node --watch` swallows a startup failure and idles ("Failed running ...
// waiting for file changes"), which looks like a hang. Wait for the ports to be
// bindable first, so a just-stopped dev run cannot poison the next one.
const busy = await waitForPortsFree(selected.map((app) => app.port), 10000)
if (busy.length > 0) {
  console.error(`dev: ports ${busy.join(', ')} are still in use — run \`pnpm ports:free\` and try again`)
  process.exit(1)
}

const children = []
let stopping = false

function killTree(child) {
  if (child.exitCode !== null || child.signalCode !== null) return
  try {
    if (isWindows) execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    else child.kill('SIGTERM')
  } catch {
    /* already gone */
  }
}

function shutdown(code) {
  if (stopping) return
  stopping = true
  for (const child of children) killTree(child)
  setTimeout(() => process.exit(code), 200).unref()
}

for (const signal of isWindows ? ['SIGINT', 'SIGTERM', 'SIGBREAK', 'SIGHUP'] : ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => shutdown(0))
}

for (const app of selected) {
  const label = app.tag.padEnd(width)
  const child = spawn(isWindows ? 'pnpm.cmd' : 'pnpm', ['--filter', app.pkg, 'dev'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
    windowsHide: true,
    shell: isWindows,
  })
  children.push(child)

  for (const stream of [child.stdout, child.stderr]) {
    createInterface({ input: stream }).on('line', (line) => {
      process.stdout.write(`${label} | ${line}\n`)
      if (line.includes('Failed running')) {
        process.stdout.write(`${label} | ↑ the app died at startup (often EADDRINUSE) — fix the error above, then save a file to retry\n`)
      }
    })
  }

  child.on('error', (err) => {
    console.error(`${label} | failed to spawn: ${err.message}`)
    shutdown(1)
  })

  child.on('exit', (code) => {
    if (stopping) return
    console.error(`${label} | exited with code ${code ?? 'null'} — stopping the others`)
    shutdown(code ?? 1)
  })
}

console.log(`dev: ${selected.map((app) => app.tag).join(', ')} (Ctrl+C stops all)`)
