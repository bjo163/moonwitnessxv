import type { JourneyPatchesOverviewOutput, EmpireSystemsOverviewOutput } from '@moonwitness/moonql-client'
import { serverClient } from '@/data/sdk'

export interface PatchesRegistry {
  patches: JourneyPatchesOverviewOutput[]
  counts: {
    total: number
    canonical: number
    disputed: number
    historical: number
  }
}

export async function readPatchesRegistry(): Promise<PatchesRegistry> {
  const patchesRes = await serverClient().view('journeyPatchesOverview').read({ limit: 100 })

  const patches = patchesRes.rows

  const canonical = patches.filter((p) => p.status === 'REPORTED_IN_CHAT' || p.status === 'RECOVERED_DRAFT').length
  const disputed = patches.filter((p) => p.status === 'UNRESOLVED_NUMBERING_CONFLICT').length
  const historical = patches.filter((p) => p.status === 'UNNUMBERED_HISTORICAL').length

  return {
    patches,
    counts: {
      total: patches.length,
      canonical,
      disputed,
      historical,
    },
  }
}

export async function readEmpireOverview(): Promise<EmpireSystemsOverviewOutput[]> {
  const res = await serverClient().view('empireSystemsOverview').read({ limit: 50 })
  return res.rows
}
