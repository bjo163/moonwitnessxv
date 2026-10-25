import type { Domain, OrderTerm } from '../domain.js'

export interface ListOptions {
  limit: number
  offset: number
  where?: Domain
  order?: OrderTerm[]
}

export type Row = Record<string, unknown>

/** precompiled aggregate metric (identifiers already validated + column-named by the registry) */
export interface CompiledMetric {
  alias: string
  fn: 'count' | 'sum' | 'avg' | 'min' | 'max'
  column?: string
}

export interface AggregateQuery {
  /** source field keys of the GROUP BY (validated, have columns) */
  groupBy: string[]
  metrics: CompiledMetric[]
  where?: Domain
  limit: number
}

/**
 * One engine contract, two implementations (pg + memory). Rows always
 * materialize every descriptor field (nullable = null when unset) so both
 * engines behave identically. Domain/order are engine-translated.
 */
export interface MoonEngine {
  list(opts: ListOptions): Promise<Row[]>
  count(where?: Domain): Promise<number>
  find(id: string, where?: Domain): Promise<Row | null>
  insert(data: Row): Promise<Row>
  patch(id: string, data: Row, where?: Domain): Promise<Row | null>
  drop(id: string): Promise<boolean>
  /**
   * Bulk delete behind a predicate, bounded per call (retention jobs). Returns
   * the number of rows removed. Deliberately silent on the bus: retention is
   * housekeeping, not a business write, and must not refill the table it trims.
   */
  removeWhere(where: Domain | undefined, limit: number): Promise<number>
  /** GROUP BY over real SQL (pg) / fold (memory); output keys: group fields + metric aliases */
  aggregate(q: AggregateQuery): Promise<Row[]>
}
