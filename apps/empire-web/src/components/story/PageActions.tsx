import { IconBookOpen } from '@moonwitness/moonui'

/**
 * M45-05 — the hero action pair rendered by Home, Library, Codex (twice) and GGS.
 * The row keeps its page class so each hero measures what it did before; only
 * the primary/secondary anatomy is shared.
 */
export function PageActions({ className, size, primary, secondary }: {
  className: string
  size?: 'sm'
  primary: { href: string; label: string }
  secondary: { href: string; label: string }
}) {
  const modifier = size === 'sm' ? ' su-btn--sm' : ''
  const iconSize = size === 'sm' ? 14 : 15
  return <div className={className}>
    <a className={`su-btn su-btn--primary${modifier}`} href={primary.href}><span aria-hidden="true">↘</span>{primary.label}</a>
    <a className={`su-btn su-btn--ghost${modifier}`} href={secondary.href}><IconBookOpen size={iconSize} />{secondary.label}</a>
  </div>
}
