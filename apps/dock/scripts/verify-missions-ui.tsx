/**
 * M11 drill: render the Figure Registry, the figure detail and the Prophetic
 * Mission Table without a browser and check what reviewers read — sourced
 * mission claims, tradition-scoped competing readings, chronology confidence,
 * the view-over-registry authority, and the avatar pedagogy disclosure.
 *
 * Run from apps/dock:
 *   node ../radio/node_modules/tsx/dist/cli.mjs scripts/verify-missions-ui.tsx
 */
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { FigureDetailView, FigureRegistryView, MissionTableView } from '../src/ui/components/actors'
import type {
  ActorSource,
  ActorTradition,
  FigureDetail,
  FigureRegistry,
  MissionRow,
  MissionTable,
} from '../src/data/queries/actors'

const quranSource: ActorSource = {
  code: 'quran-cairo-hafs',
  title: "Al-Qur'an — Cairo 1924 (Hafs 'an 'Asim)",
  sourceType: 'SCRIPTURE_EDITION',
  citation: 'D01 corpus edition quran_cairo_hafs',
  sourceUri: 'https://archive.org/details/cairo-quran-1924',
  provenanceSha: 'c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912',
  reviewStatus: 'APPROVED_FOR_CITATION',
  approvalNote: null,
}

const visionSource: ActorSource = {
  code: 'xv-master-vision',
  title: 'MoonWitness XV — Master Vision Narrative',
  sourceType: 'PROJECT_VISION',
  citation: 'moonwitnessxv@e2f4562:docs/vision/MASTER_VISION_NARRATIVE_XV.md#06',
  sourceUri: 'https://github.com/bjo163/empire-of-the-light/blob/e2f4562/docs/vision/MASTER_VISION_NARRATIVE_XV.md',
  provenanceSha: '7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb',
  reviewStatus: 'APPROVED_FOR_CITATION',
  approvalNote: null,
}

const scripture: ActorTradition = {
  code: 'islamic-scripture',
  label: 'Islamic scripture',
  scope: 'SCRIPTURE',
  description: 'Claims attributed to a Qur’anic passage. D01 owns the corpus.',
}

const project: ActorTradition = {
  code: 'project-reading',
  label: 'Project reading',
  scope: 'PROJECT',
  description: 'Project-scoped editorial readings kept next to source claims.',
}

const scriptureMission: MissionRow = {
  missionCode: 'ms_005',
  figureCode: 'fg_005',
  labelEn: 'Muhammad',
  labelId: 'Muhammad',
  tradition: scripture,
  title: 'Mercy to the worlds',
  problemAddressed: 'Not framed as a single problem by the cited passage; the registry does not invent one.',
  community: 'The worlds, as stated by the passage',
  historicalSetting: 'Not specified by the cited passage.',
  passageRef: 'qs:21:107',
  interpretationNote: null,
  epistemicStatus: 'ASSERTED',
  statusLabel: 'Asserted — not verified',
  roles: ['PROPHET', 'WARNER'],
  reviewer: null,
  reason: null,
  evidenceRef: null,
  source: quranSource,
}

const projectMission: MissionRow = {
  missionCode: 'ms_006',
  figureCode: 'fg_005',
  labelEn: 'Muhammad',
  labelId: 'Muhammad',
  tradition: project,
  title: 'Mercy without one exclusive mission',
  problemAddressed: 'Reducing a prophetic mission to a single universal slogan.',
  community: 'Readers of the project’s Prophetic Mission Table',
  historicalSetting: 'Project scope; this is not a historical claim.',
  passageRef: 'qs:21:107',
  interpretationNote:
    'This is an editorial reading attached to the project, not a claim about the prophet’s own intention.',
  epistemicStatus: 'ASSERTED',
  statusLabel: 'Asserted — not verified',
  roles: ['PROPHET', 'WARNER'],
  reviewer: null,
  reason: null,
  evidenceRef: null,
  source: visionSource,
}

const missionTable: MissionTable = {
  state: 'ok',
  authority: {
    viewOf: 'actor_figures',
    canonicalTables: [
      'actor_figures',
      'actor_traditions',
      'actor_roles',
      'actor_missions',
      'actor_events',
      'actor_locations',
      'actor_avatars',
    ],
    readOnly: true,
    notice: 'The Prophetic Mission Table is a filtered view over the Figure Registry (D04).',
  },
  view: {
    name: 'Prophetic Mission Table',
    derivedFrom: 'actor_figures',
    separateFigureTable: false,
    notice: 'The Prophetic Mission Table is a filtered view over the Figure Registry (D04). It is not a separate prophet database.',
  },
  meta: {
    version: '1.0.0',
    status: 'SOURCED_SAMPLE',
    notice: 'A bounded sample of source-cited figures and mission claims.',
    pins: {
      vision: {
        ref: 'moonwitnessxv@e2f4562:docs/vision/MASTER_VISION_NARRATIVE_XV.md#06',
        sha256: '7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb',
      },
      quranEdition: {
        code: 'quran-cairo-hafs',
        citation: 'D01 corpus edition quran_cairo_hafs',
        sha256: 'c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912',
      },
    },
  },
  counts: {
    figures: 5,
    missions: 2,
    traditions: 3,
    roles: 7,
    events: 5,
    avatars: 0,
    readings: 2,
    competingFigures: 1,
    returned: 2,
  },
  options: {
    traditions: [scripture, project],
    figures: [{ code: 'fg_005', label: 'Muhammad' }],
    confidences: ['ASSERTED'],
  },
  filters: { tradition: null, figure: null, confidence: null, q: null },
  total: 2,
  rows: [scriptureMission, projectMission],
  noExclusive: {
    singleMissionField: false,
    rankField: false,
    notice: 'One figure may carry several missions. There is no exclusive-mission field and no religious rank.',
  },
  readingsNotice:
    'Missions are grouped by their own tradition and source. Competing readings stay side by side; nothing is merged into one doctrine.',
  identityNotice: 'A shared name never merges two figures.',
}

const figureRegistry: FigureRegistry = {
  state: 'ok',
  authority: missionTable.authority,
  meta: missionTable.meta,
  counts: {
    figures: 2,
    missions: 2,
    traditions: 3,
    roles: 7,
    events: 5,
    avatars: 0,
    readings: 2,
    competingFigures: 1,
  },
  figures: [
    {
      figureCode: 'fg_003',
      labelEn: 'Musa',
      labelId: 'Musa',
      figureKind: 'PROPHETIC_FIGURE',
      attestation: 'SOURCE_REPORTED',
      status: 'CANDIDATE',
      summary: 'A prophet figure sent to Pharaoh, named in the Qur’anic text.',
      source: quranSource,
      roles: [
        {
          roleCode: 'rl_004',
          role: 'MESSENGER',
          tradition: scripture,
          passageRef: 'qs:20:47',
          epistemicStatus: 'ASSERTED',
          statusLabel: 'Asserted — not verified',
          reviewer: null,
          reason: null,
          evidenceRef: null,
          source: quranSource,
        },
      ],
      missionCount: 0,
      readings: 0,
      eventCount: 1,
      avatarCount: 0,
    },
    {
      figureCode: 'fg_005',
      labelEn: 'Muhammad',
      labelId: 'Muhammad',
      figureKind: 'PROPHETIC_FIGURE',
      attestation: 'SOURCE_REPORTED',
      status: 'CANDIDATE',
      summary: 'A prophet figure addressed in the Qur’anic text; the seed keeps more than one sourced reading.',
      source: quranSource,
      roles: [],
      missionCount: 2,
      readings: 2,
      eventCount: 1,
      avatarCount: 0,
    },
  ],
  identityNotice: 'A shared name never merges two figures. This registry records figures and claims; it does not resolve identity.',
  noExclusive: missionTable.noExclusive,
  readingsNotice: missionTable.readingsNotice,
}

const figureDetail: FigureDetail = {
  state: 'ok',
  figure: {
    figureCode: 'fg_005',
    labelEn: 'Muhammad',
    labelId: 'Muhammad',
    figureKind: 'PROPHETIC_FIGURE',
    attestation: 'SOURCE_REPORTED',
    status: 'CANDIDATE',
    summary: 'A prophet figure addressed in the Qur’anic text; the seed keeps more than one sourced reading.',
    source: quranSource,
  },
  roles: [
    {
      roleCode: 'rl_006',
      role: 'PROPHET',
      tradition: scripture,
      passageRef: 'qs:33:45',
      epistemicStatus: 'ASSERTED',
      statusLabel: 'Asserted — not verified',
      reviewer: null,
      reason: null,
      evidenceRef: null,
      source: quranSource,
    },
    {
      roleCode: 'rl_007',
      role: 'WARNER',
      tradition: scripture,
      passageRef: 'qs:33:45',
      epistemicStatus: 'ASSERTED',
      statusLabel: 'Asserted — not verified',
      reviewer: null,
      reason: null,
      evidenceRef: null,
      source: quranSource,
    },
  ],
  readings: [
    {
      tradition: scripture,
      missions: [scriptureMission],
      sourceCodes: ['quran-cairo-hafs'],
    },
    {
      tradition: project,
      missions: [projectMission],
      sourceCodes: ['xv-master-vision'],
    },
  ],
  competingReadings: true,
  mergedDoctrine: false,
  events: [
    {
      eventCode: 'ev_005',
      title: 'Proclamation of mercy to the worlds',
      eventType: 'MISSION',
      location: {
        locationCode: 'loc_002',
        name: 'Place not named by the source',
        region: null,
        accuracy: 'UNNAMED',
        notes: 'The registry records the gap instead of filling it with a traditional site.',
      },
      chronologyLabel: 'Not dated by the source',
      chronologyConfidence: 'UNDATED',
      tradition: scripture,
      passageRef: 'qs:21:107',
      description: 'The passage states the mercy claim without a date or a named place.',
      source: quranSource,
    },
  ],
  avatars: [],
  chronology: {
    notice:
      'Chronology confidence describes the dating claim only; it is not a verification of the event. A source-attributed event can stay undated.',
    labels: ['UNDATED', 'REPORTED_DATE', 'DISPUTED_DATE', 'ATTESTED_DATE'],
  },
  counts: { roles: 2, missions: 2, readings: 2, events: 1, avatars: 0 },
  sources: [quranSource, visionSource],
  policy: {
    proposal: '25 Prophetic Mission Avatars',
    modelStatus: 'PROPOSAL_ONLY_NOT_INTEGRATED',
    namesRecovered: false,
    seededNames: 0,
    sourceNote:
      'The vision records the 25-avatar concept as a historical pedagogical proposal. Its final list was not recovered, so no name is manufactured.',
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
  },
  identityNotice: missionTable.identityNotice,
  readingsNotice: missionTable.readingsNotice,
  noExclusive: missionTable.noExclusive,
  roleNotice:
    'Roles are claims scoped to a tradition and a source. A project reading never replaces a source-attributed role, and no role is a ranking.',
}

let checks = 0
function must(condition: boolean, label: string): void {
  assert.ok(condition, label)
  checks++
  console.info(`PASS ${label}`)
}

const tableHtml = renderToStaticMarkup(<MissionTableView table={missionTable} />)
const registryHtml = renderToStaticMarkup(<FigureRegistryView registry={figureRegistry} />)
const detailHtml = renderToStaticMarkup(<FigureDetailView detail={figureDetail} />)

// ---- mission table: claims, sources and the view authority ------------------
must(tableHtml.includes('data-mission-code="ms_005"'), 'renders the scripture mission code')
must(tableHtml.includes('data-mission-code="ms_006"'), 'renders the project mission code')
must(tableHtml.includes('data-figure-code="fg_005"'), 'each mission carries its figure code')
must(tableHtml.includes('href="/figures/fg_005"'), 'figure links point at the registry detail')
must(tableHtml.includes('data-tradition="islamic-scripture"'), 'scripture reading keeps its tradition')
must(tableHtml.includes('data-tradition="project-reading"'), 'project reading keeps its tradition')
must(tableHtml.includes('qs:21:107'), 'passage reference is shown as a reference, not copied text')
must(tableHtml.includes('quran-cairo-hafs'), 'the scripture source is named')
must(tableHtml.includes('xv-master-vision'), 'the project source is named')
must(tableHtml.includes('D01 corpus edition quran_cairo_hafs'), 'source citation is visible')
must(tableHtml.includes('data-reading-note="true"'), 'the editorial interpretation note is marked')
must(tableHtml.includes('not a claim about the prophet’s own intention'), 'the interpretation note is rendered')
must(tableHtml.includes('Asserted — not verified'), 'ASSERTED is labelled as not verified')
must(tableHtml.includes('no exclusive-mission field and no religious rank'), 'the no-exclusive/no-rank notice is rendered')
must(tableHtml.includes('Exclusive mission field'), 'the table names the missing exclusive field')
must(tableHtml.includes('absent — a figure may carry several missions'), 'the table states that a figure may carry several missions')
must(tableHtml.includes('absent — no religious ranking exists'), 'the table states that no religious rank exists')
must(tableHtml.includes('not a second prophet database'), 'the single-registry rule is rendered')
must(tableHtml.includes('separate figure table: no'), 'the view declares no duplicate figure table')
must(tableHtml.includes('actor_figures'), 'the canonical figure table is named')
must(tableHtml.includes('actor_prophets') === false, 'no prophet table is invented')
must(tableHtml.includes('read-only: yes'), 'the projection is marked read-only')
must(tableHtml.includes('<strong>5</strong>'), 'figure count is rendered')
must(tableHtml.includes('<strong>6</strong>') || tableHtml.includes('<strong>2</strong>'), 'mission count is rendered')
must(tableHtml.includes('7aedcf336063'), 'the vision provenance digest is visible')

// ---- registry: figures stay separate and sourced ---------------------------
must(registryHtml.includes('data-figure-code="fg_003"'), 'Musa is a separate figure row')
must(registryHtml.includes('data-figure-code="fg_005"'), 'Muhammad is a separate figure row')
must(registryHtml.includes('MESSENGER'), 'roles are rendered inline')
must(registryHtml.includes('data-role-code="rl_004"') === false, 'inline roles stay compact on the registry card')
must(registryHtml.includes('2 READINGS'), 'competing readings are counted per figure')
must(registryHtml.includes('shared name never merges'), 'the identity notice is rendered')
must(registryHtml.includes('PROPHETIC_FIGURE'), 'the figure kind is rendered')
must(registryHtml.includes('SOURCE_REPORTED'), 'the attestation is rendered')

// ---- detail: competing readings, chronology and avatar policy --------------
must(detailHtml.includes('data-tradition="islamic-scripture"'), 'the detail keeps the scripture reading separate')
must(detailHtml.includes('data-tradition="project-reading"'), 'the detail keeps the project reading separate')
must(detailHtml.includes('data-competing="true"'), 'the panel is marked as carrying competing readings')
must(detailHtml.includes('data-merged-doctrine="false"'), 'no merged doctrine is claimed')
must(detailHtml.includes('Nothing is merged into a single doctrine'), 'the readings notice is rendered')
must(detailHtml.includes('data-role-code="rl_006"'), 'the prophet role is rendered as a claim')
must(detailHtml.includes('data-role-code="rl_007"'), 'the warner role is rendered as a claim')
must(detailHtml.includes('no role is a ranking'), 'the role notice is rendered')
must(detailHtml.includes('data-event-code="ev_005"'), 'the event is rendered')
must(detailHtml.includes('data-chronology="UNDATED"'), 'the event carries its chronology confidence')
must(detailHtml.includes('UNNAMED'), 'an unnamed place is labelled instead of invented')
must(detailHtml.includes('Place not named by the source'), 'the missing place stays visible')
must(detailHtml.includes('not a verification of the event'), 'chronology is not presented as verification')
must(detailHtml.includes('PROPOSAL_ONLY_NOT_INTEGRATED'), 'the avatar proposal is marked as not integrated')
must(detailHtml.includes('no — no name is manufactured'), 'the avatar policy states no name was recovered')
must(detailHtml.includes('not the prophet'), 'the avatar disclosure is rendered')
must(detailHtml.includes('No avatar is seeded'), 'an empty avatar list is explicit')
must(detailHtml.includes('c0a8f1e72b4d912a'), 'the Qur’an edition digest is visible')
must(detailHtml.includes('7aedcf33606388a7'), 'the vision digest is visible')

const avatarFixture: FigureDetail = {
  ...figureDetail,
  avatars: [
    {
      avatarCode: 'av_901',
      avatarName: 'Nuh teaching companion',
      pedagogicalUse: 'Classroom dialogue prompt.',
      disclosure: 'This avatar is a pedagogical interface. It is not the prophet and not new revelation.',
      authorityStatus: 'PEDAGOGICAL_ONLY',
      status: 'DRAFT',
      source: visionSource,
    },
  ],
}
const avatarHtml = renderToStaticMarkup(<FigureDetailView detail={avatarFixture} />)
must(avatarHtml.includes('data-avatar-code="av_901"'), 'a recorded avatar is rendered')
must(avatarHtml.includes('PEDAGOGICAL_ONLY'), 'the avatar authority is pedagogical only')
must(avatarHtml.includes('not the prophet'), 'a recorded avatar keeps its disclosure')
must(avatarHtml.includes('DRAFT'), 'the avatar status stays a draft')

console.info(`\n${checks} checks passed for the M11 missions and figures UI.`)
