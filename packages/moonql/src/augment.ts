// Same local FastifySchema augmentation used by the other packages, so the
// generated routes can carry tags/summary without depending on @fastify/swagger.
//
// Deliberately duplicated across moonql, denpa and whatsapp: those two are standalone
// plugins that must not gain a fastify dependency (or a cycle back into moonql) just
// to share four optional properties. The hub's own augmentation
// (`apps/radio/src/fastify.d.ts`) is different on purpose — it decorates the instance.
declare module 'fastify' {
  interface FastifySchema {
    tags?: string[]
    summary?: string
    description?: string
  }
}

export {}
