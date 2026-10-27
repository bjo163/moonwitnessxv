#!/usr/bin/env node
/**
 * Print the runner-side inventory: what `pnpm dev`, `pnpm ports:free` and the
 * Cockpit actually cover. One command instead of reading three files.
 *
 *   pnpm apps
 *   pnpm apps --json
 */
import { APPS, ORDERED } from './apps.registry.mjs'

const asJson = process.argv.includes('--json')
const pad = (value, width) => String(value).padEnd(width)

if (asJson) {
  process.stdout.write(`${JSON.stringify(ORDERED, null, 2)}\n`)
} else {
  const rows = ORDERED.map((app) => ({
    tag: app.tag,
    port: app.port ?? '—',
    kind: app.kind,
    dev: app.dev ? 'yes' : 'no',
    cockpit: app.supervised ? 'yes' : '—',
    health: app.health ?? '—',
    note: app.note ?? '',
  }))

  const widths = {
    tag: Math.max(4, ...rows.map((row) => row.tag.length)),
    port: 5,
    kind: 8,
    dev: 4,
    cockpit: 8,
    health: Math.max(6, ...rows.map((row) => String(row.health).length)),
  }

  const line = (row) =>
    [
      pad(row.tag, widths.tag),
      pad(row.port, widths.port),
      pad(row.kind, widths.kind),
      pad(row.dev, widths.dev),
      pad(row.cockpit, widths.cockpit),
      pad(row.health, widths.health),
      row.note,
    ]
      .join('  ')
      .trimEnd()

  process.stdout.write(`${line({ tag: 'TAG', port: 'PORT', kind: 'KIND', dev: 'DEV', cockpit: 'COCKPIT', health: 'HEALTH', note: 'NOTE' })}\n`)
  process.stdout.write(`${'-'.repeat(widths.tag + widths.port + widths.kind + widths.dev + widths.cockpit + widths.health + 12 + 4)}\n`)
  for (const row of rows) process.stdout.write(`${line(row)}\n`)

  const runnable = APPS.filter((app) => app.dev).length
  const ported = APPS.filter((app) => typeof app.port === 'number').length
  process.stdout.write(`\n${runnable} runnable · ${ported} ported · ${APPS.length - runnable} scaffold(s) listed but never spawned\n`)
}
