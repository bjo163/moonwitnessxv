import { cellText as coreCellText } from '@moonwitness/core'

export type ClassValue = string | false | null | undefined

/** tiny class joiner (no dependency, no runtime cost when nothing changes) */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}

/**
 * The one stringifier for relation-ish values: never prints [object Object].
 * The rule itself lives in @moonwitness/core so the SDK and the design system
 * cannot drift apart (they used to keep two key lists with different results).
 */
export function cellText(value: unknown): string {
  return coreCellText(value)
}
