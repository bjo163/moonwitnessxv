// Same local FastifySchema augmentation used by the other packages, so the
// generated routes can carry tags/summary without depending on @fastify/swagger.
declare module 'fastify' {
  interface FastifySchema {
    tags?: string[]
    summary?: string
    description?: string
  }
}

export {}
