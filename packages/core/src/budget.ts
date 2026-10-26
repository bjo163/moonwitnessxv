/**
 * Bounded fan-out for the crons that walk a table and call the network.
 *
 * Two failures this exists to prevent, both seen in the hub:
 * - a serial loop over 500 stations at 2–4 s each does not finish inside its own
 *   cadence, and the cron runner then skips every following tick ("previous run
 *   still in progress"), so the data stops moving at all;
 * - an unbounded `Promise.all` over the same table opens 500 sockets at once.
 *
 * The budget is a wall-clock ceiling, not a per-item timeout: when it is reached,
 * the remaining items are reported as skipped instead of being started and killed
 * halfway. The caller decides what "skipped" means for the next run (usually: the
 * work is still there, un-stamped, and therefore first in line next time).
 */

export interface BudgetedRun<T, R> {
  /** items that were started and finished */
  done: number
  /** items the budget did not reach; nothing was started for them */
  skipped: T[]
  /** results of the finished items, in completion order */
  results: R[]
  /** wall-clock spent, for the cron log */
  elapsedMs: number
}

export interface BudgetOptions<T, R> {
  /** parallel in-flight items; default 8 */
  concurrency?: number
  /** stop starting new items after this many ms */
  budgetMs: number
  run: (item: T) => Promise<R>
  /** injectable clock (tests) */
  clock?: () => number
}

export async function runWithBudget<T, R>(
  items: readonly T[],
  options: BudgetOptions<T, R>,
): Promise<BudgetedRun<T, R>> {
  const { concurrency = 8, budgetMs, run, clock = Date.now } = options
  const started = clock()
  const deadline = started + Math.max(0, budgetMs)
  const results: R[] = []
  const skipped: T[] = []
  let done = 0
  let next = 0

  const worker = async (): Promise<void> => {
    for (;;) {
      const at = next++
      if (at >= items.length) return
      const item = items[at]!
      if (clock() >= deadline) {
        // every remaining item is reported, once: `next` is already past it, so
        // the other workers take distinct indices
        skipped.push(item)
        continue
      }
      results.push(await run(item))
      done += 1
    }
  }

  const width = Math.max(1, Math.min(concurrency, items.length))
  await Promise.all(Array.from({ length: width }, worker))
  // skipped was collected per worker in index order; normalise so the reported
  // cursor does not depend on how the promises interleaved
  skipped.sort((a, b) => items.indexOf(a) - items.indexOf(b))
  return { done, skipped, results, elapsedMs: clock() - started }
}

/**
 * Sort rows by "least recently touched first", where a missing stamp counts as
 * never touched (and therefore first in line). `isoOf` reads the cursor field.
 */
export function byStaleness<T>(rows: readonly T[], isoOf: (row: T) => string | null | undefined): T[] {
  return [...rows].sort((a, b) => {
    const av = isoOf(a) ?? ''
    const bv = isoOf(b) ?? ''
    return av < bv ? -1 : av > bv ? 1 : 0
  })
}
