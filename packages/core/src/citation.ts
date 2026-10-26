import { sha256Hex } from './hash.js'

export interface PassageCitation {
  urn: string
  workRef: string
  editionRef: string
  address: string
  fingerprint: string
  rightsCleared: boolean
  formattedLabel: string
}

/**
 * Generates deterministic cryptographic watermarks for scriptural and corpus passages.
 *
 * Ensures mathematical traceability (provenance) across Reader and research workbench.
 */
export async function createPassageCitation(params: {
  workRef: string
  editionRef: string
  address: string
  textPayload: string
  rightsCleared: boolean
}): Promise<PassageCitation> {
  const { workRef, editionRef, address, textPayload, rightsCleared } = params
  const urn = `urn:moonwitness:passage:${workRef}:${editionRef}:${address}`
  const rawCanonical = `${urn}|${textPayload.trim()}|${rightsCleared ? 'cleared' : 'restricted'}`
  const fingerprint = await sha256Hex(rawCanonical)

  const formattedLabel = `${workRef.toUpperCase()} ${address} [${editionRef}]`

  return {
    urn,
    workRef,
    editionRef,
    address,
    fingerprint,
    rightsCleared,
    formattedLabel,
  }
}

/**
 * Validates whether a given citation fingerprint matches the text payload.
 */
export async function verifyPassageCitation(
  citation: PassageCitation,
  textPayload: string,
): Promise<boolean> {
  const recomputed = await createPassageCitation({
    workRef: citation.workRef,
    editionRef: citation.editionRef,
    address: citation.address,
    textPayload,
    rightsCleared: citation.rightsCleared,
  })
  return recomputed.fingerprint === citation.fingerprint
}
