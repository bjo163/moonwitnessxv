#!/usr/bin/env node
/**
 * M51-01 — D20 ownership and source boundary contract (dependency-free).
 *
 * Proves the accepted ISP boundary is recorded identically in every canonical
 * index, and fails when an index loses one of the boundary exclusions:
 *   - `@moonwitness/moonql-isp` through ARSY stays the only durable D20 owner
 *     (no third SQL owner);
 *   - ARSY stays the only Hub (no second Hub);
 *   - the ISP surface stays private (no public or customer-facing portal).
 *
 * Read-only: no network, no writes. Exit 0 on pass, 1 on failure.
 * Usage: node scripts/check-m51-01-d20-boundary.mjs
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const SOURCE_SHA = 'ab8a512b468c4a9b979418f8b05720a58651ebfe'

/** Canonical indexes and the phrases each must carry for the boundary to hold. */
export const REQUIREMENTS = [
  {
    file: 'docs/decisions/ADR-0018-isp-network-operations.md',
    role: 'accepted decision',
    needles: [
      { id: 'ADR_ACCEPTED', text: '**Status: ACCEPTED' },
      { id: 'ADR_D20_OWNER', text: 'Add **D20 ISP & Network Operations**, persisted through ARSY/MoonQL' },
      { id: 'ADR_NO_THIRD_SQL_OWNER', text: 'D20 is not a third SQL owner or a second Hub.' },
      { id: 'ADR_PACKAGE', text: 'Add `packages/moonql-isp` for D20 models' },
      { id: 'ADR_RUNTIME', text: '`apps/isp-radius` as a Go protocol runtime' },
      { id: 'ADR_RUNTIME_NO_SQL', text: 'it has no SQL driver, durable business store, user login or generic REST model API' },
      { id: 'ADR_SECRET_REFS_ONLY', text: 'Persist only NAS secret references in D20.' },
      { id: 'ADR_DENY_ON_OUTAGE', text: 'If ARSY is unavailable, deny new authentication.' },
      { id: 'ADR_CONSOLE_PRIVATE', text: 'Add `apps/isp-console`, a private Next.js operator surface' },
      { id: 'ADR_NO_PUBLIC_PORTAL', text: 'Do not add operator links or ISP data to public Dock.' },
      { id: 'ADR_RELEASE_GATE', text: 'A real NAS pilot requires a separate operator go/no-go and recovery proof.' },
      { id: 'ADR_SOURCE_PIN', text: SOURCE_SHA },
      { id: 'ADR_EXCLUDES_DIRTY_WORKTREE', text: 'The source worktree contains uncommitted RADIUS EAP/TEAP changes; they are excluded' },
    ],
  },
  {
    file: 'BLUEPRINT.md',
    role: 'architecture register',
    needles: [
      { id: 'BP_D20_ROW', text: '| **D20** | **ISP & Network Operations — owned by ARSY/MoonQL** |' },
      { id: 'BP_PACKAGE', text: 'owned by the existing `@moonwitness/moonql` package through `@moonwitness/moonql-isp`' },
      { id: 'BP_RUNTIME', text: '`apps/isp-radius` is a protocol adapter without SQL' },
      { id: 'BP_CONSOLE', text: '`apps/isp-console` is a private frontend' },
      { id: 'BP_EXCLUSIONS', text: 'D20 adds no SQL owner, second Hub, second login, public ISP surface or duplicate customer/invoice/payment data.' },
      { id: 'BP_RUNTIME_ROW', text: '| **ISP RADIUS runtime** | `apps/isp-radius` (M51) |' },
    ],
  },
  {
    file: 'docs/decisions/M02-02-domain-assignments.md',
    role: 'domain assignment register',
    needles: [
      { id: 'DA_TITLE_D20', text: 'Domain Ownership Mapping & Boundary Register (D00–D20)' },
      { id: 'DA_D20_ROW', text: '| **D20** | **ISP & Network Operations** *(Accepted — ADR-0018; implementation M51)* |' },
      { id: 'DA_PACKAGE', text: '`@moonwitness/moonql-isp` through ARSY; protocol runtime `apps/isp-radius`' },
      { id: 'DA_SOLE_OWNER', text: 'ARSY/MoonQL remains the sole durable owner.' },
      { id: 'DA_NO_SECRET_ROWS', text: 'never duplicate customer/invoice/payment rows or NAS shared secrets' },
      { id: 'DA_RUNTIME_NO_SQL', text: 'Go runtime has no SQL.' },
    ],
  },
  {
    file: 'docs/architecture/ISP_NETWORK.md',
    role: 'D20 architecture contract',
    needles: [
      { id: 'ISPN_D20_TITLE', text: '# ISP & Network Operations — D20' },
      { id: 'ISPN_PACKAGE', text: '`@moonwitness/moonql-isp`' },
      { id: 'ISPN_RUNTIME', text: '`apps/isp-radius`' },
      { id: 'ISPN_CONSOLE', text: '`apps/isp-console`' },
      { id: 'ISPN_ONE_OWNER', text: 'One record has one owner.' },
      { id: 'ISPN_SECRET_REFS', text: 'D20 stores no duplicate customer profile, invoice, payment, login or NAS shared secret.' },
      { id: 'ISPN_READONLY_MONITORING', text: 'Registered-target monitoring stays read-only.' },
      { id: 'ISPN_SOURCE_ROWS_EXCLUDED', text: 'Do not migrate source database rows or runtime secrets.' },
    ],
  },
  {
    file: 'docs/architecture/README.md',
    role: 'architecture index',
    needles: [
      { id: 'AR_LINK', text: '[ISP & Network Operations](ISP_NETWORK.md)' },
      { id: 'AR_D20_ACCEPTED', text: 'D20 for ISP/network operations through ARSY/MoonQL' },
      { id: 'AR_M51_GATE', text: 'D20 implementation remains under M51.' },
    ],
  },
  {
    file: 'docs/planning/DOMAIN_COVERAGE.md',
    role: 'domain coverage register',
    needles: [
      { id: 'DC_M51_ROW', text: '| M51 | D00 identity/grants; D15 customer, package, subscription and invoice; D16 manual payment/reconciliation; D20 ISP tenant and network access operations under MoonQL/ARSY |' },
      { id: 'DC_EXCLUSIONS', text: 'No third SQL owner, second Hub, copied billing rows, public portal, online gateway, or router writes.' },
      { id: 'DC_ACCEPTED_D20', text: 'accepted D20 ISP/network technical operations M51' },
    ],
  },
  {
    file: 'README.md',
    role: 'repository index',
    needles: [
      { id: 'RD_D20', text: '**D20 ISP & Network Operations** — accepted by ADR-0018 for implementation through ARSY/MoonQL under M51' },
    ],
  },
  {
    file: 'MASTER_DESIGN.md',
    role: 'UI semantics register',
    needles: [
      { id: 'MD_CONSOLE_PRIVATE', text: 'The console is a private, bilingual Empire WORKS operations surface' },
      { id: 'MD_NO_DOCK_ROUTE', text: 'it has no browser-to-database path and no public Dock route' },
      { id: 'MD_NO_SECRET_LEAK', text: 'RADIUS shared secrets and service keys are never displayed after entry or returned to the browser.' },
    ],
  },
  {
    file: 'docs/milestones/M51.md',
    role: 'milestone context',
    needles: [
      { id: 'MS_ENTRY_PIN', text: `the source baseline is pinned to \`${SOURCE_SHA}\`` },
      { id: 'MS_NO_ROWS', text: 'No source database rows or live secrets are imported.' },
      { id: 'MS_GO_NO_SQL', text: 'a stateless Go RADIUS protocol runtime' },
    ],
  },
]

/**
 * @param {(relativePath: string) => string} read supplies one canonical file
 * @returns {{ failures: string[], checked: number, needles: number }}
 */
export function validateBoundary(read) {
  const failures = []
  let needles = 0
  for (const group of REQUIREMENTS) {
    let text
    try {
      text = read(group.file)
    } catch {
      failures.push(`${group.file}: missing (${group.role})`)
      continue
    }
    for (const needle of group.needles) {
      needles += 1
      if (!text.includes(needle.text)) {
        failures.push(`${group.file}: ${needle.id} boundary phrase absent`)
      }
    }
  }
  return { failures, checked: REQUIREMENTS.length, needles }
}

function main() {
  const result = validateBoundary((relative) => readFileSync(path.join(ROOT, relative), 'utf8'))
  if (result.failures.length) {
    process.stderr.write(`D20 boundary contract invalid:\n${result.failures.map((line) => `  - ${line}`).join('\n')}\n`)
    process.exitCode = 1
    return
  }
  process.stdout.write(
    `D20 boundary contract valid: ${result.checked} canonical indexes, ${result.needles} ownership and exclusion phrases.\n`,
  )
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
