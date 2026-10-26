/**
 * @moonwitness/core — The 33 World Patches Canonical Registry (Section 21A.8)
 *
 * Full status-preserving registry of the 33 historical World Patches.
 * Explicitly preserves the unresolved slot 014 numbering conflict, slot 033
 * in-chat submission status, and unnumbered historical entries without
 * claiming unverified divine authority.
 */

export type PatchStatus =
  | 'REPORTED_IN_CHAT'
  | 'RECOVERED_DRAFT'
  | 'UNRESOLVED_NUMBERING_CONFLICT'
  | 'EDITORIAL_PROPOSAL'
  | 'USER_SUBMITTED_IN_CHAT'
  | 'UNNUMBERED_HISTORICAL'

export interface WorldPatchEntry {
  slot: string // "001" to "033" or "UNNUMBERED"
  title: string
  status: PatchStatus
  disputedTitle?: string
  description?: string
  thematicFocus: 'PROTECTION' | 'ETHICS' | 'COMMUNITY' | 'STEWARDSHIP' | 'JUSTICE' | 'ACTION'
}

export const WORLD_PATCHES: WorldPatchEntry[] = [
  { slot: '001', title: 'AEGIS PROTECTION', status: 'REPORTED_IN_CHAT', thematicFocus: 'PROTECTION' },
  { slot: '002', title: 'NEVERMORE', status: 'REPORTED_IN_CHAT', thematicFocus: 'ETHICS' },
  { slot: '003', title: 'DIPINGIT MODE ON', status: 'REPORTED_IN_CHAT', thematicFocus: 'PROTECTION' },
  { slot: '004', title: 'PINK NOISE', status: 'REPORTED_IN_CHAT', thematicFocus: 'COMMUNITY' },
  { slot: '005', title: 'WINDWALKER', status: 'REPORTED_IN_CHAT', thematicFocus: 'STEWARDSHIP' },
  { slot: '006', title: 'PATCH QIBLAT UTARA', status: 'REPORTED_IN_CHAT', thematicFocus: 'PROTECTION' },
  { slot: '007', title: 'MAROON 5', status: 'REPORTED_IN_CHAT', thematicFocus: 'COMMUNITY' },
  { slot: '008', title: 'FUTURE IS NOW', status: 'REPORTED_IN_CHAT', thematicFocus: 'ACTION' },
  { slot: '009', title: 'WE ARE SAVAGES', status: 'RECOVERED_DRAFT', thematicFocus: 'ETHICS' },
  { slot: '010', title: 'HAVE A NICE DAY', status: 'RECOVERED_DRAFT', thematicFocus: 'COMMUNITY' },
  { slot: '011', title: 'KARMA — THE BUG IS ME', status: 'RECOVERED_DRAFT', thematicFocus: 'ETHICS' },
  { slot: '012', title: 'THE PRIME DIRECTIVE', status: 'RECOVERED_DRAFT', thematicFocus: 'PROTECTION' },
  { slot: '013', title: 'SAFE FROM DAY ONE', status: 'RECOVERED_DRAFT', thematicFocus: 'PROTECTION' },
  {
    slot: '014',
    title: 'FAMILY WITHOUT FEAR',
    disputedTitle: 'THE WRONG WAY / HELLROAD',
    status: 'UNRESOLVED_NUMBERING_CONFLICT',
    thematicFocus: 'ETHICS',
    description: 'Historical XI/XII records note unresolved numbering conflict between FAMILY WITHOUT FEAR and THE WRONG WAY.',
  },
  { slot: '015', title: 'FAIR WORK, FAIR LIFE', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'JUSTICE' },
  { slot: '016', title: 'BREAK THE DEBT LOOP', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'JUSTICE' },
  { slot: '017', title: 'THE SECOND CHANCE', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'ETHICS' },
  { slot: '018', title: 'JUSTICE FOR EVERYONE', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'JUSTICE' },
  { slot: '019', title: 'THE HONEST WITNESS', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'JUSTICE' },
  { slot: '020', title: 'NO ONE DIES ALONE', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'COMMUNITY' },
  { slot: '021', title: 'THE MERCY NETWORK', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'COMMUNITY' },
  { slot: '022', title: 'CLEAN WATER FOR ALL', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'STEWARDSHIP' },
  { slot: '023', title: 'NO ONE GOES HUNGRY', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'COMMUNITY' },
  { slot: '024', title: 'HEALTH WITHOUT BARRIERS', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'COMMUNITY' },
  { slot: '025', title: 'LEARN FOR LIFE', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'ACTION' },
  { slot: '026', title: 'NO ONE LEFT BEHIND', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'JUSTICE' },
  { slot: '027', title: 'CRISIS READY', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'PROTECTION' },
  { slot: '028', title: 'EARTH STEWARDSHIP', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'STEWARDSHIP' },
  { slot: '029', title: 'SAFE DIGITAL WORLD', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'PROTECTION' },
  { slot: '030', title: 'FAIR GOVERNANCE', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'JUSTICE' },
  { slot: '031', title: 'PEACE BUILDER', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'JUSTICE' },
  { slot: '032', title: 'A SAFE PLACE TO LIVE', status: 'EDITORIAL_PROPOSAL', thematicFocus: 'COMMUNITY' },
  {
    slot: '033',
    title: 'KOPIHITAM - SIACENG / FAITH TO ACTION',
    status: 'USER_SUBMITTED_IN_CHAT',
    thematicFocus: 'ACTION',
    description: 'User-submitted in-chat record; requires concrete human project and measurable deliverable.',
  },
  {
    slot: 'UNNUMBERED',
    title: 'WILD YOUTH / MWX-SYF-00752',
    status: 'UNNUMBERED_HISTORICAL',
    thematicFocus: 'ETHICS',
  },
  {
    slot: 'UNNUMBERED',
    title: 'RIBA — NOT APPROVED',
    status: 'UNNUMBERED_HISTORICAL',
    thematicFocus: 'JUSTICE',
  },
  {
    slot: 'UNNUMBERED',
    title: 'THE FINAL AUDIT',
    status: 'UNNUMBERED_HISTORICAL',
    thematicFocus: 'JUSTICE',
  },
]

export function getPatchBySlot(slot: string): WorldPatchEntry | undefined {
  return WORLD_PATCHES.find((p) => p.slot === slot)
}
