import { createElement, type ReactNode } from 'react'

/**
 * Zine notes and join banners ship a fixed line rhythm. Catalogue entries carry that
 * rhythm as `\n`, and this helper turns it back into real breaks so the wording can
 * live in the locale catalogues while the typography stays as designed.
 */
export function zineLines(text: string): ReactNode[] {
  const lines = text.split('\n')
  const nodes: ReactNode[] = []
  lines.forEach((line, index) => {
    if (index > 0) nodes.push(createElement('br', { key: `break-${index}` }))
    nodes.push(line)
  })
  return nodes
}
