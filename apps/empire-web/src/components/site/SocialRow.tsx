/**
 * M45-14 — the four social marks from the mockups (YouTube, X, Instagram,
 * Telegram). They are drawn, not linked: no verified account exists, and a fake
 * destination is worse than no icon. `aria-hidden` keeps them out of the
 * accessibility tree, so a screen reader never announces a control that is not
 * one. CLAIMS.md row 7 records this.
 */
const marks = [
  { name: 'youtube', path: <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3V9Z" /></> },
  { name: 'x', path: <><path d="M4 4l16 16M20 4 4 20" /></> },
  { name: 'instagram', path: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r="0.8" fill="currentColor" /></> },
  { name: 'telegram', path: <><path d="M21 4 3 11l5 2 2 6 3-4 4 3 4-14Z" /><path d="m8 13 8-6" /></> },
]

export function SocialRow({ className }: { className: string }) {
  return <p className={className} aria-hidden="true">
    {marks.map((mark) => <svg key={mark.name} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{mark.path}</svg>)}
  </p>
}
