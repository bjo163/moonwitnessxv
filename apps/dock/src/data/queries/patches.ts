import type { JourneyPatchesOverviewOutput } from '@moonwitness/moonql-client'
import type { PatchesRegistry } from './journey'
import type { PatchesCopy } from '@/ui/copy/patches-copy'

/**
 * UI-II P16a/P16b · the read side of `/[locale]/patches`.
 *
 * This module owns NO endpoint. `readPatchesRegistry` in `journey.ts` stays the
 * only reader of the hub (`journeyPatchesOverview` public view); everything
 * here is a pure derivation over the rows that read already
 * returned, so the census and the filter can run under `node --test` without a
 * server and without a second data owner.
 *
 * The census exists because the screen used to print a number it had not
 * counted. It states what the projection really returns instead.
 */

export type PatchRecord = JourneyPatchesOverviewOutput

/** A canonical slot code is three digits; anything else is an unnumbered record. */
export const NUMBERED_SLOT = /^\d{3}$/

export interface CodeCount {
  code: string
  count: number
}

export interface DisputedPatchPair {
  recordId: string
  slot: string
  title: string
  disputedTitle: string
  status: string
  historicalNotes: string | null
}

export interface PatchCensus {
  /** Rows the projection returned for this request. */
  records: number
  /** Rows whose slot code is a three-digit canonical slot. */
  numberedSlots: number
  /** Slot codes the projection carries that are outside the numbered span. */
  unnumberedSlots: string[]
  /** Lowest and highest numbered slot present, or null when none is. */
  slotSpan: { first: string; last: string } | null
  /** Three-digit codes inside the observed span with no row: stated, never filled. */
  missingSlots: string[]
  /** Every status code present, counted, in the order the rows carry them. */
  statuses: CodeCount[]
  /** Every thematic focus present, counted. A focus with no row is absent. */
  categories: CodeCount[]
  /** Rows the registry read classifies as canonical, kept for parity with it. */
  canonical: number
  /** Rows carrying a second, disputed title in the same record. */
  disputed: DisputedPatchPair[]
  /** Rows whose status code is the hub's unresolved numbering conflict. */
  conflicts: number
}

const pad = (n: number): string => String(n).padStart(3, '0')

function tally(values: string[]): CodeCount[] {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => a.code.localeCompare(b.code))
}

export function isNumberedSlot(slot: string): boolean {
  return NUMBERED_SLOT.test(slot)
}

/**
 * Count what the projection returned. No number here is a constant: the span,
 * the missing slots, the categories and the dispute list are all read off the
 * rows themselves, so an empty registry yields zeros rather than a claim.
 */
export function censusPatches(registry: PatchesRegistry): PatchCensus {
  const patches = registry.patches
  const numbered = patches.filter((patch) => isNumberedSlot(patch.slot)).map((patch) => patch.slot).sort()
  const present = new Set(patches.map((patch) => patch.slot))

  let missingSlots: string[] = []
  const firstNumbered = numbered[0]
  const lastNumbered = numbered[numbered.length - 1]
  if (firstNumbered !== undefined && lastNumbered !== undefined) {
    const first = Number(firstNumbered)
    const last = Number(lastNumbered)
    missingSlots = []
    for (let n = first; n <= last; n += 1) {
      const code = pad(n)
      if (!present.has(code)) missingSlots.push(code)
    }
  }

  return {
    records: patches.length,
    numberedSlots: numbered.length,
    unnumberedSlots: patches.filter((patch) => !isNumberedSlot(patch.slot)).map((patch) => patch.slot),
    slotSpan:
      firstNumbered !== undefined && lastNumbered !== undefined
        ? { first: firstNumbered, last: lastNumbered }
        : null,
    missingSlots,
    statuses: tally(patches.map((patch) => patch.status)),
    categories: tally(patches.map((patch) => patch.thematicFocus)),
    canonical: registry.counts.canonical,
    disputed: patches.flatMap((patch): DisputedPatchPair[] => {
      const disputedTitle = patch.disputedTitle
      if (typeof disputedTitle !== 'string' || disputedTitle.length === 0) return []
      return [
        {
          recordId: patch.id,
          slot: patch.slot,
          title: patch.title,
          disputedTitle,
          status: patch.status,
          historicalNotes: patch.historicalNotes,
        },
      ]
    }),
    conflicts: patches.filter((patch) => patch.status === 'UNRESOLVED_NUMBERING_CONFLICT').length,
  }
}

export interface PatchFilter {
  focus: string
  query: string
}

/**
 * The screen's filter, kept here so P16e can exercise it as a function: a
 * category that matches nothing yields zero rows, an unknown slot code yields
 * zero rows, and the match spans title, slot, description and disputed title.
 */
export function filterPatches(patches: PatchRecord[], filter: PatchFilter): PatchRecord[] {
  const query = filter.query.trim().toLowerCase()
  return patches.filter((patch) => {
    if (filter.focus !== 'ALL' && patch.thematicFocus !== filter.focus) return false
    if (query === '') return true
    const haystack = [patch.slot, patch.title, patch.disputedTitle ?? '', patch.description ?? '']
      .join('\n')
      .toLowerCase()
    return haystack.includes(query)
  })
}

/**
 * Stable in-page anchor for one record. Slot codes are short, human-written
 * keys (`014`, `UNNUMBERED-01`); anything unsafe for an id or a fragment is
 * dropped rather than encoded, so the anchor never invents a second key.
 */
export function patchAnchor(slot: string): string {
  const safe = slot.replace(/[^A-Za-z0-9_-]/g, '')
  return `patch-${safe}`
}

/**
 * Status wording in the rendered locale WITHOUT normalizing the code away: the
 * badge keeps the hub code verbatim, and this sentence explains it. An unknown
 * code says that it is unknown instead of borrowing another code's meaning.
 */
export function statusMeaning(status: string, copy: PatchesCopy): string {
  switch (status) {
    case 'REPORTED_IN_CHAT':
      return copy.statusReported
    case 'RECOVERED_DRAFT':
      return copy.statusRecovered
    case 'UNRESOLVED_NUMBERING_CONFLICT':
      return copy.statusConflict
    case 'EDITORIAL_PROPOSAL':
      return copy.statusProposal
    case 'USER_SUBMITTED_IN_CHAT':
      return copy.statusUserSubmitted
    case 'UNNUMBERED_HISTORICAL':
      return copy.statusUnnumbered
    default:
      return copy.statusUnknown
  }
}

/** A patch's own status, in words, for the disputed-pair notice. */
export function patchStatusWords(patch: PatchRecord, copy: PatchesCopy): string {
  return statusMeaning(patch.status, copy)
}

/**
 * A thematic focus in words. An unknown code says that it is unknown instead of
 * borrowing another focus's label, so a hub enum widening never silently renames
 * a record.
 */
export function focusWords(focus: string, copy: PatchesCopy): string {
  switch (focus) {
    case 'PROTECTION':
      return copy.focusProtection
    case 'ETHICS':
      return copy.focusEthics
    case 'COMMUNITY':
      return copy.focusCommunity
    case 'STEWARDSHIP':
      return copy.focusStewardship
    case 'JUSTICE':
      return copy.focusJustice
    case 'ACTION':
      return copy.focusAction
    default:
      return copy.focusUnknown
  }
}

/** The scope code as recorded, with its meaning in the rendered locale. */
export function scopeWords(scope: string, copy: PatchesCopy): string {
  switch (scope) {
    case 'SELF':
      return copy.scopeSelf
    case 'COMMUNITY':
      return copy.scopeCommunity
    case 'GLOBAL':
      return copy.scopeGlobal
    default:
      return copy.scopeUnknown
  }
}
