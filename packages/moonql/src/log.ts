/**
 * The one logger shape moonql depends on.
 *
 * It was declared five times (`boot`, `crons`, `datasync`, `repository`, `sync`),
 * which meant a change to the contract (say, an `error` level) had to be made in
 * five places or silently not at all. Fastify's logger satisfies this shape, so the
 * hub passes `app.log` without an adapter.
 */
export interface Log {
  info: (obj: unknown, msg: string) => void
  warn: (obj: unknown, msg: string) => void
}
