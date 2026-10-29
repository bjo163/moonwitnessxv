/**
 * M45-05 — the `<b>value</b><span>label</span>` stat strip rendered by Home,
 * Library and GGS. The wrapper element and class stay page-owned because each
 * page measures its own band (62px / 54px / 84px); only the inner anatomy is
 * shared, so the measured DOM is byte-for-byte what it was before.
 */
export function StatRow({ items, className, as: Tag = 'div' }: {
  items: Array<{ value: string; label: string }>
  className: string
  as?: 'div' | 'section'
}) {
  return <Tag className={className}>
    {items.map((stat) => <div key={stat.label}><b>{stat.value}</b><span>{stat.label}</span></div>)}
  </Tag>
}
