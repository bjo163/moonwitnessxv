import type { ModelMeta } from '@moonwitness/moonql-client'
import type { ListResult } from '@/data/queries/records'

export type SourceRightsInventory = {
  accessAllowed: boolean
  sources: ListResult | null
}

/** Check the published model ACL before fetching any edition rows. */
export async function loadSourceRightsInventory(
  model: ModelMeta | undefined,
  guardList: (model: ModelMeta) => Promise<boolean>,
  fetchRows: () => Promise<ListResult>,
): Promise<SourceRightsInventory> {
  if (!model?.operations.list) return { accessAllowed: false, sources: null }

  if (!(await guardList(model))) return { accessAllowed: false, sources: null }

  try {
    return { accessAllowed: true, sources: await fetchRows() }
  } catch {
    return { accessAllowed: true, sources: null }
  }
}
