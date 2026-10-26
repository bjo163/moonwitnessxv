import type {
  MonitorRadarsRow,
  MonitorSignalsRow,
  MonitorSourcesRow,
  MonitorTasksRow,
} from '@moonwitness/moonql-client'
import { serverClient } from '@/data/sdk'

export interface MonitorOverviewRadar extends MonitorRadarsRow {
  sourceCount: number
  signalCount: number
}

export interface MonitorOverviewSource extends MonitorSourcesRow {
  signalCount: number
}

export interface MonitorOverview {
  counts: {
    radars: number
    activeRadars: number
    sources: number
    activeSources: number
    signals: number
    criticalSignals: number
    pendingTasks: number
  }
  radars: MonitorOverviewRadar[]
  sources: MonitorOverviewSource[]
  signals: MonitorSignalsRow[]
  tasks: MonitorTasksRow[]
}

const EMPTY_OVERVIEW: MonitorOverview = {
  counts: {
    radars: 0,
    activeRadars: 0,
    sources: 0,
    activeSources: 0,
    signals: 0,
    criticalSignals: 0,
    pendingTasks: 0,
  },
  radars: [],
  sources: [],
  signals: [],
  tasks: [],
}

/** Single-request 3-tier World Monitor snapshot from `/monitor/overview`. */
export async function getMonitorOverview(): Promise<MonitorOverview> {
  return serverClient()
    .call<MonitorOverview>('/monitor/overview')
    .catch(() => EMPTY_OVERVIEW)
}
