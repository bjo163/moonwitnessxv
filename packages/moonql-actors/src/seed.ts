/**
 * M11 seed: a bounded, source-cited sample for the Figure Registry and the
 * Prophetic Mission Table. Every claim cites an approved source; scripture is
 * referenced by passage ID only (D01 owns the text) and no figure is reduced to
 * one exclusive mission.
 */

export const TRADITION_SCOPES = ['SCRIPTURE', 'EXEGESIS', 'ACADEMIC', 'PROJECT', 'CREATIVE'] as const
export type TraditionScope = (typeof TRADITION_SCOPES)[number]

export const FIGURE_KINDS = ['PROPHETIC_FIGURE', 'HISTORICAL_FIGURE', 'COMMUNITY'] as const
export type FigureKind = (typeof FIGURE_KINDS)[number]

export const FIGURE_ATTESTATIONS = ['SOURCE_REPORTED', 'TRADITION_REPORTED', 'CONTESTED'] as const
export const FIGURE_STATUSES = ['CANDIDATE', 'REVIEWED', 'CONTESTED'] as const

export const ROLE_TYPES = ['PROPHET', 'MESSENGER', 'WARNER', 'GUIDE', 'LEADER', 'TEACHER'] as const
export type RoleType = (typeof ROLE_TYPES)[number]

export const EPISTEMIC_STATUSES = ['UNKNOWN', 'DISPUTED', 'ASSERTED', 'VERIFIED'] as const
export type EpistemicStatus = (typeof EPISTEMIC_STATUSES)[number]

export const EVENT_TYPES = ['MISSION', 'MIGRATION', 'CONFLICT', 'COVENANT', 'TEACHING', 'DELIVERANCE', 'OTHER'] as const
export const CHRONOLOGY_CONFIDENCES = ['UNDATED', 'REPORTED_DATE', 'DISPUTED_DATE', 'ATTESTED_DATE'] as const
export const LOCATION_ACCURACIES = ['NAMED', 'REGION_ONLY', 'UNNAMED'] as const
export const AVATAR_STATUSES = ['PROPOSAL', 'DRAFT', 'REVIEWED'] as const

export const QURAN_SOURCE = 'quran-cairo-hafs'
export const VISION_SOURCE = 'xv-master-vision'

export const VISION_REF = 'moonwitnessxv@e2f4562:docs/vision/MASTER_VISION_NARRATIVE_XV.md#06'
export const VISION_SHA256 = '7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb'
export const QURAN_SHA256 = 'c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912'

export const ACTORS_META = {
  version: '1.0.0',
  status: 'SOURCED_SAMPLE',
  figureCount: 5,
  missionCount: 6,
  notice:
    'A bounded sample of source-cited figures and mission claims. It is not a complete prophetic registry, it does not copy scripture text, and it never reduces a figure to one exclusive mission.',
  pins: {
    vision: { ref: VISION_REF, sha256: VISION_SHA256 },
    quranEdition: { code: QURAN_SOURCE, citation: 'D01 corpus edition quran_cairo_hafs', sha256: QURAN_SHA256 },
  },
} as const

export const MISSION_TABLE_NOTICE =
  'The Prophetic Mission Table is a filtered view over the Figure Registry (D04). It is not a separate prophet database.'
export const READINGS_NOTICE =
  'Missions are grouped by their own tradition and source. Competing readings stay side by side; nothing is merged into one doctrine.'
export const NO_EXCLUSIVE_NOTICE =
  'One figure may carry several missions. There is no exclusive-mission field and no religious rank.'
export const IDENTITY_NOTICE =
  'A shared name never merges two figures. This registry records figures and claims; it does not resolve identity.'

export const AVATAR_POLICY = {
  proposal: '25 Prophetic Mission Avatars',
  modelStatus: 'PROPOSAL_ONLY_NOT_INTEGRATED',
  namesRecovered: false,
  seededNames: 0,
  sourceNote:
    'The vision records the 25-avatar concept as a historical pedagogical proposal. Its final list and references were not recovered from the repository, so this milestone manufactures no names and does not claim the model is integrated.',
  disclosureTemplate:
    'This avatar is a pedagogical interface. It is not the prophet, not a resurrected messenger and not new revelation.',
  rules: [
    'An avatar is a teaching metaphor, never the actual prophet.',
    'An AI avatar is not a resurrected messenger and never delivers new revelation.',
    'No avatar may claim religious authority, prophethood or a divine voice.',
    'Every avatar row carries a disclosure and PEDAGOGICAL_ONLY authority.',
    'Avatars are not ranked, and no figure is presented as religiously superior.',
  ],
  notice: 'An avatar is a teaching metaphor, never the actual prophet and never religious authority.',
} as const

export const TRADITION_SEED = [
  {
    code: 'islamic-scripture',
    label: 'Islamic scripture',
    scope: 'SCRIPTURE' as TraditionScope,
    description:
      'Claims attributed to a Qur’anic passage. The registry cites the passage reference and does not copy the text; D01 owns the corpus.',
    sourceCode: VISION_SOURCE,
  },
  {
    code: 'project-reading',
    label: 'Project reading',
    scope: 'PROJECT' as TraditionScope,
    description:
      'Project-scoped editorial readings kept visible next to source claims. They are not scripture and never override a source claim.',
    sourceCode: VISION_SOURCE,
  },
  {
    code: 'academic-historical',
    label: 'Academic historical',
    scope: 'ACADEMIC' as TraditionScope,
    description:
      'Reserved for reviewed historical-critical entries. No row is seeded in this milestone, and no academic claim is invented.',
    sourceCode: VISION_SOURCE,
  },
]

export const LOCATION_SEED = [
  {
    locationCode: 'loc_001',
    name: 'Egypt',
    region: 'Northeast Africa',
    accuracy: 'NAMED' as (typeof LOCATION_ACCURACIES)[number],
    notes: 'Named by QS 7:104. This records the source-named land, not a modern administrative boundary.',
    sourceCode: QURAN_SOURCE,
  },
  {
    locationCode: 'loc_002',
    name: 'Place not named by the source',
    region: null,
    accuracy: 'UNNAMED' as (typeof LOCATION_ACCURACIES)[number],
    notes:
      'The seeded passages do not name a settlement for the warning of Nuh. The registry records the gap instead of filling it with a traditional site.',
    sourceCode: QURAN_SOURCE,
  },
]

export const FIGURE_SEED = [
  {
    figureCode: 'fg_001',
    labelEn: 'Nuh',
    labelId: 'Nuh',
    figureKind: 'PROPHETIC_FIGURE' as FigureKind,
    attestation: 'SOURCE_REPORTED',
    summary: 'A prophet figure named in the Qur’anic text and invoked across traditions.',
    sourceCode: QURAN_SOURCE,
    status: 'CANDIDATE',
  },
  {
    figureCode: 'fg_002',
    labelEn: 'Ibrahim',
    labelId: 'Ibrahim',
    figureKind: 'PROPHETIC_FIGURE' as FigureKind,
    attestation: 'SOURCE_REPORTED',
    summary: 'A prophet figure associated in the Qur’anic text with the rejection of idol worship.',
    sourceCode: QURAN_SOURCE,
    status: 'CANDIDATE',
  },
  {
    figureCode: 'fg_003',
    labelEn: 'Musa',
    labelId: 'Musa',
    figureKind: 'PROPHETIC_FIGURE' as FigureKind,
    attestation: 'SOURCE_REPORTED',
    summary: 'A prophet figure sent to Pharaoh, named in the Qur’anic text.',
    sourceCode: QURAN_SOURCE,
    status: 'CANDIDATE',
  },
  {
    figureCode: 'fg_004',
    labelEn: 'Isa',
    labelId: 'Isa',
    figureKind: 'PROPHETIC_FIGURE' as FigureKind,
    attestation: 'SOURCE_REPORTED',
    summary: 'A prophet figure sent to the Children of Israel, named in the Qur’anic text.',
    sourceCode: QURAN_SOURCE,
    status: 'CANDIDATE',
  },
  {
    figureCode: 'fg_005',
    labelEn: 'Muhammad',
    labelId: 'Muhammad',
    figureKind: 'PROPHETIC_FIGURE' as FigureKind,
    attestation: 'SOURCE_REPORTED',
    summary: 'A prophet figure addressed in the Qur’anic text; the seed keeps more than one sourced reading.',
    sourceCode: QURAN_SOURCE,
    status: 'CANDIDATE',
  },
]

export const ROLE_SEED = [
  {
    roleCode: 'rl_001',
    figure: 'fg_001',
    tradition: 'islamic-scripture',
    role: 'PROPHET' as RoleType,
    passageRef: 'qs:71:1',
    sourceCode: QURAN_SOURCE,
    epistemicStatus: 'ASSERTED' as EpistemicStatus,
  },
  {
    roleCode: 'rl_002',
    figure: 'fg_001',
    tradition: 'islamic-scripture',
    role: 'WARNER' as RoleType,
    passageRef: 'qs:71:1',
    sourceCode: QURAN_SOURCE,
    epistemicStatus: 'ASSERTED' as EpistemicStatus,
  },
  {
    roleCode: 'rl_003',
    figure: 'fg_002',
    tradition: 'islamic-scripture',
    role: 'PROPHET' as RoleType,
    passageRef: 'qs:6:74',
    sourceCode: QURAN_SOURCE,
    epistemicStatus: 'ASSERTED' as EpistemicStatus,
  },
  {
    roleCode: 'rl_004',
    figure: 'fg_003',
    tradition: 'islamic-scripture',
    role: 'MESSENGER' as RoleType,
    passageRef: 'qs:20:47',
    sourceCode: QURAN_SOURCE,
    epistemicStatus: 'ASSERTED' as EpistemicStatus,
  },
  {
    roleCode: 'rl_005',
    figure: 'fg_004',
    tradition: 'islamic-scripture',
    role: 'MESSENGER' as RoleType,
    passageRef: 'qs:3:49',
    sourceCode: QURAN_SOURCE,
    epistemicStatus: 'ASSERTED' as EpistemicStatus,
  },
  {
    roleCode: 'rl_006',
    figure: 'fg_005',
    tradition: 'islamic-scripture',
    role: 'PROPHET' as RoleType,
    passageRef: 'qs:33:45',
    sourceCode: QURAN_SOURCE,
    epistemicStatus: 'ASSERTED' as EpistemicStatus,
  },
  {
    roleCode: 'rl_007',
    figure: 'fg_005',
    tradition: 'islamic-scripture',
    role: 'WARNER' as RoleType,
    passageRef: 'qs:33:45',
    sourceCode: QURAN_SOURCE,
    epistemicStatus: 'ASSERTED' as EpistemicStatus,
  },
]

export const MISSION_SEED = [
  {
    missionCode: 'ms_001',
    figure: 'fg_001',
    tradition: 'islamic-scripture',
    title: 'Warn a community before a trial',
    problemAddressed: 'A community persisting in denial, as framed by the cited passage.',
    community: 'The people of Nuh',
    historicalSetting: 'Not dated or localised by the cited passage.',
    passageRef: 'qs:71:1',
    interpretationNote: null,
    sourceCode: QURAN_SOURCE,
    epistemicStatus: 'ASSERTED' as EpistemicStatus,
  },
  {
    missionCode: 'ms_002',
    figure: 'fg_002',
    tradition: 'islamic-scripture',
    title: 'Call a community away from idols to one God',
    problemAddressed: 'Idolatry in the speaker’s community, as framed by the cited passage.',
    community: 'The father and people addressed by Ibrahim',
    historicalSetting: 'Not localised by the cited passage.',
    passageRef: 'qs:6:74',
    interpretationNote: null,
    sourceCode: QURAN_SOURCE,
    epistemicStatus: 'ASSERTED' as EpistemicStatus,
  },
  {
    missionCode: 'ms_003',
    figure: 'fg_003',
    tradition: 'islamic-scripture',
    title: 'Confront a transgressing ruler with a sign',
    problemAddressed: 'A ruler who transgressed, as stated by the cited passage.',
    community: 'The court of Pharaoh',
    historicalSetting: 'Egypt, named elsewhere in the Qur’anic narrative (QS 7:104).',
    passageRef: 'qs:20:47',
    interpretationNote: null,
    sourceCode: QURAN_SOURCE,
    epistemicStatus: 'ASSERTED' as EpistemicStatus,
  },
  {
    missionCode: 'ms_004',
    figure: 'fg_004',
    tradition: 'islamic-scripture',
    title: 'Bring a sign to the Children of Israel',
    problemAddressed: 'A community asked to receive a sign from its Lord.',
    community: 'The Children of Israel',
    historicalSetting: 'Not dated by the cited passage.',
    passageRef: 'qs:3:49',
    interpretationNote: null,
    sourceCode: QURAN_SOURCE,
    epistemicStatus: 'ASSERTED' as EpistemicStatus,
  },
  {
    missionCode: 'ms_005',
    figure: 'fg_005',
    tradition: 'islamic-scripture',
    title: 'Mercy to the worlds',
    problemAddressed: 'Not framed as a single problem by the cited passage; the registry does not invent one.',
    community: 'The worlds, as stated by the passage',
    historicalSetting: 'Not specified by the cited passage.',
    passageRef: 'qs:21:107',
    interpretationNote: null,
    sourceCode: QURAN_SOURCE,
    epistemicStatus: 'ASSERTED' as EpistemicStatus,
  },
  {
    missionCode: 'ms_006',
    figure: 'fg_005',
    tradition: 'project-reading',
    title: 'Mercy without one exclusive mission',
    problemAddressed: 'Reducing a prophetic mission to a single universal slogan.',
    community: 'Readers of the project’s Prophetic Mission Table',
    historicalSetting: 'Project scope; this is not a historical claim.',
    passageRef: 'qs:21:107',
    interpretationNote:
      'This is an editorial reading attached to the project, not a claim about the prophet’s own intention and not a replacement for the source-attributed claim.',
    sourceCode: VISION_SOURCE,
    epistemicStatus: 'ASSERTED' as EpistemicStatus,
  },
]

export const EVENT_SEED = [
  {
    eventCode: 'ev_001',
    figure: 'fg_001',
    title: 'The flood after the warning',
    eventType: 'DELIVERANCE' as (typeof EVENT_TYPES)[number],
    location: 'loc_002',
    chronologyLabel: 'Not dated by the source',
    chronologyConfidence: 'UNDATED' as (typeof CHRONOLOGY_CONFIDENCES)[number],
    tradition: 'islamic-scripture',
    passageRef: 'qs:11:44',
    description:
      'The passage narrates the flood; it names neither a date nor a settlement. The registry keeps both gaps visible.',
    sourceCode: QURAN_SOURCE,
  },
  {
    eventCode: 'ev_002',
    figure: 'fg_002',
    title: 'Proclamation against idol worship',
    eventType: 'TEACHING' as (typeof EVENT_TYPES)[number],
    location: null,
    chronologyLabel: 'Not dated by the source',
    chronologyConfidence: 'UNDATED' as (typeof CHRONOLOGY_CONFIDENCES)[number],
    tradition: 'islamic-scripture',
    passageRef: 'qs:6:74',
    description: 'The cited passage reports the address to Ibrahim’s father; it does not name a place or a date.',
    sourceCode: QURAN_SOURCE,
  },
  {
    eventCode: 'ev_003',
    figure: 'fg_003',
    title: 'Confrontation with Pharaoh',
    eventType: 'CONFLICT' as (typeof EVENT_TYPES)[number],
    location: 'loc_001',
    chronologyLabel: 'Not dated by the source',
    chronologyConfidence: 'UNDATED' as (typeof CHRONOLOGY_CONFIDENCES)[number],
    tradition: 'islamic-scripture',
    passageRef: 'qs:7:104',
    description:
      'Egypt is named by QS 7:104. The passage gives no calendar date, so the event remains undated here.',
    sourceCode: QURAN_SOURCE,
  },
  {
    eventCode: 'ev_004',
    figure: 'fg_004',
    title: 'A sign to the Children of Israel',
    eventType: 'MISSION' as (typeof EVENT_TYPES)[number],
    location: null,
    chronologyLabel: 'Not dated by the source',
    chronologyConfidence: 'UNDATED' as (typeof CHRONOLOGY_CONFIDENCES)[number],
    tradition: 'islamic-scripture',
    passageRef: 'qs:3:49',
    description: 'The passage reports the sign and the address; it does not give a calendar date or a settlement.',
    sourceCode: QURAN_SOURCE,
  },
  {
    eventCode: 'ev_005',
    figure: 'fg_005',
    title: 'Proclamation of mercy to the worlds',
    eventType: 'MISSION' as (typeof EVENT_TYPES)[number],
    location: null,
    chronologyLabel: 'Not dated by the source',
    chronologyConfidence: 'UNDATED' as (typeof CHRONOLOGY_CONFIDENCES)[number],
    tradition: 'islamic-scripture',
    passageRef: 'qs:21:107',
    description: 'The passage states the mercy claim without a date or a named place.',
    sourceCode: QURAN_SOURCE,
  },
]
