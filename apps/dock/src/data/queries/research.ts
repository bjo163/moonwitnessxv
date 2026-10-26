import type {
  ResearchCasesRow,
  ResearchFramesRow,
  ResearchWitnessesRow,
  ResearchHypothesesRow,
} from '@moonwitness/moonql-client'
import { serverClient } from '@/data/sdk'

export interface ResearchRegistry {
  cases: ResearchCasesRow[]
  frames: ResearchFramesRow[]
  witnesses: ResearchWitnessesRow[]
  hypotheses: ResearchHypothesesRow[]
  counts: {
    cases: number
    frames: number
    witnesses: number
    hypotheses: number
    openCases: number
  }
}

export async function readResearchRegistry(): Promise<ResearchRegistry> {
  const [casesRes, framesRes, witnessesRes, hypothesesRes] = await Promise.all([
    serverClient().model('research_cases').list({ limit: 50 }),
    serverClient().model('research_frames').list({ limit: 50 }),
    serverClient().model('research_witnesses').list({ limit: 50 }),
    serverClient().model('research_hypotheses').list({ limit: 50 }),
  ])

  const cases = casesRes.rows
  const frames = framesRes.rows
  const witnesses = witnessesRes.rows
  const hypotheses = hypothesesRes.rows

  const openCases = cases.filter((c) => c.researchStatus === 'OPEN').length

  return {
    cases,
    frames,
    witnesses,
    hypotheses,
    counts: {
      cases: cases.length,
      frames: frames.length,
      witnesses: witnesses.length,
      hypotheses: hypotheses.length,
      openCases,
    },
  }
}
