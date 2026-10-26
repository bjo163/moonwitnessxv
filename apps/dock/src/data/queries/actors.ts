import { MoonApiError } from '@moonwitness/moonql-client'
import { serverClient } from '@/data/sdk'

/**
 * M11: the Figure Registry and the Prophetic Mission Table are read-only Dock
 * projections of the hub's actor tables. The Dock keeps no second registry.
 */

export interface ActorSource {
  code: string | null
  title?: string | null
  sourceType?: string | null
  citation?: string | null
  sourceUri?: string | null
  provenanceSha?: string | null
  reviewStatus?: string | null
  approvalNote?: string | null
}

export interface ActorTradition {
  code: string
  label: string
  scope: string
  description: string
}

export interface ActorRole {
  roleCode: string
  role: string
  tradition: ActorTradition | null
  passageRef: string
  epistemicStatus: string
  statusLabel: string
  reviewer: string | null
  reason: string | null
  evidenceRef: string | null
  source: ActorSource | null
}

export interface MissionRow {
  missionCode: string
  figureCode: string
  labelEn: string
  labelId: string
  tradition: ActorTradition | null
  title: string
  problemAddressed: string
  community: string
  historicalSetting: string
  passageRef: string
  interpretationNote: string | null
  epistemicStatus: string
  statusLabel: string
  roles: string[]
  reviewer: string | null
  reason: string | null
  evidenceRef: string | null
  source: ActorSource | null
}

export interface MissionTable {
  state: string
  authority: { viewOf: string; canonicalTables: string[]; readOnly: boolean; notice: string }
  view: { name: string; derivedFrom: string; separateFigureTable: boolean; notice: string }
  meta: {
    version: string
    status: string
    notice: string
    pins: { vision: { ref: string; sha256: string }; quranEdition: { code: string; citation: string; sha256: string } }
  }
  counts: {
    figures: number
    missions: number
    traditions: number
    roles: number
    events: number
    avatars: number
    readings: number
    competingFigures: number
    returned: number
  }
  options: {
    traditions: Array<ActorTradition | null>
    figures: Array<{ code: string; label: string }>
    confidences: string[]
  }
  filters: { tradition: string | null; figure: string | null; confidence: string | null; q: string | null }
  total: number
  rows: MissionRow[]
  noExclusive: { singleMissionField: boolean; rankField: boolean; notice: string }
  readingsNotice: string
  identityNotice: string
}

export interface ActorEvent {
  eventCode: string
  title: string
  eventType: string
  location: {
    locationCode: string
    name: string
    region: string | null
    accuracy: string
    notes: string
  } | null
  chronologyLabel: string
  chronologyConfidence: string
  tradition: ActorTradition | null
  passageRef: string | null
  description: string
  source: ActorSource | null
}

export interface FigureSummary {
  figureCode: string
  labelEn: string
  labelId: string
  figureKind: string
  attestation: string
  status: string
  summary: string
  source: ActorSource | null
}

export interface FigureListItem extends FigureSummary {
  roles: ActorRole[]
  missionCount: number
  readings: number
  eventCount: number
  avatarCount: number
}

export interface FigureRegistry {
  state: string
  authority: { viewOf: string; canonicalTables: string[]; readOnly: boolean; notice: string }
  meta: MissionTable['meta']
  counts: {
    figures: number
    missions: number
    traditions: number
    roles: number
    events: number
    avatars: number
    readings: number
    competingFigures: number
  }
  figures: FigureListItem[]
  identityNotice: string
  noExclusive: { singleMissionField: boolean; rankField: boolean; notice: string }
  readingsNotice: string
}

export interface AvatarRow {
  avatarCode: string
  avatarName: string
  pedagogicalUse: string
  disclosure: string
  authorityStatus: string
  status: string
  source: ActorSource | null
}

export interface AvatarPolicy {
  proposal: string
  modelStatus: string
  namesRecovered: boolean
  seededNames: number
  sourceNote: string
  disclosureTemplate: string
  rules: string[]
  notice: string
}

export interface FigureReading {
  tradition: ActorTradition | null
  missions: MissionRow[]
  sourceCodes: string[]
}

export interface FigureDetail {
  state: string
  figure: FigureSummary
  roles: ActorRole[]
  readings: FigureReading[]
  competingReadings: boolean
  mergedDoctrine: boolean
  events: ActorEvent[]
  avatars: AvatarRow[]
  chronology: { notice: string; labels: string[] }
  counts: { roles: number; missions: number; readings: number; events: number; avatars: number }
  sources: ActorSource[]
  policy: AvatarPolicy
  identityNotice: string
  readingsNotice: string
  noExclusive: { singleMissionField: boolean; rankField: boolean; notice: string }
  roleNotice: string
}

export interface MissionFilters {
  tradition?: string
  figure?: string
  confidence?: string
  q?: string
  limit?: number
  offset?: number
}

const clean = (filters: MissionFilters): Record<string, string | number | undefined> =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''),
  ) as Record<string, string | number | undefined>

export async function readMissions(filters: MissionFilters = {}): Promise<MissionTable> {
  return serverClient().call<MissionTable>('/actors/missions', { query: clean(filters) })
}

export async function readFigures(): Promise<FigureRegistry> {
  return serverClient().call<FigureRegistry>('/actors/figures')
}

export async function readFigure(figureCode: string): Promise<FigureDetail | null> {
  try {
    return await serverClient().call<FigureDetail>('/actors/figure', { query: { code: figureCode } })
  } catch (err) {
    if (err instanceof MoonApiError && (err.statusCode === 400 || err.statusCode === 404)) return null
    throw err
  }
}
