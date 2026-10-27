import type { ObjectMetadataInput } from '@moonwitness/echolog-core'
import type { FsStorageDriver } from '@moonwitness/echolog-core'

/** Application boundary for object operations; REST/auth policy is added by M39-09. */
export function createObjectService(driver: FsStorageDriver, referencedObjectKeys: () => Promise<Set<string>> = async () => new Set()) {
  return {
    ready() {
      return driver.ready()
    },
    upload(chunks: AsyncIterable<Uint8Array>, metadata: ObjectMetadataInput) {
      return driver.putStream(chunks, metadata)
    },
    get(objectKey: string) {
      return driver.get(objectKey)
    },
    delete(objectKey: string) {
      return driver.delete(objectKey)
    },
    collect(at?: Date) {
      return referencedObjectKeys().then((references) => driver.gc(at, references))
    },
  }
}
