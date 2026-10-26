import type { JourneyPatchesOverviewOutput, JourneyMandatesRow, EmpireSystemsOverviewOutput } from '@moonwitness/moonql-client'
import { serverClient } from '@/data/sdk'

export interface PatchesRegistry {
  patches: JourneyPatchesOverviewOutput[]
  mandates: JourneyMandatesRow[]
  counts: {
    total: number
    canonical: number
    disputed: number
    historical: number
    mandates: number
  }
}

export async function readPatchesRegistry(): Promise<PatchesRegistry> {
  const [patchesRes, mandatesRes] = await Promise.all([
    serverClient().view('journeyPatchesOverview').read({ limit: 100 }),
    serverClient().model('journey_mandates').list({ limit: 100 }),
  ])

  const patches = patchesRes.rows
  const mandates = mandatesRes.rows

  const canonical = patches.filter((p) => p.status === 'REPORTED_IN_CHAT' || p.status === 'RECOVERED_DRAFT').length
  const disputed = patches.filter((p) => p.status === 'UNRESOLVED_NUMBERING_CONFLICT').length
  const historical = patches.filter((p) => p.status === 'UNNUMBERED_HISTORICAL').length

  return {
    patches,
    mandates,
    counts: {
      total: patches.length,
      canonical,
      disputed,
      historical,
      mandates: mandates.length,
    },
  }
}

export async function readEmpireOverview(): Promise<EmpireSystemsOverviewOutput[]> {
  const res = await serverClient().view('empireSystemsOverview').read({ limit: 50 })
  return res.rows
}
