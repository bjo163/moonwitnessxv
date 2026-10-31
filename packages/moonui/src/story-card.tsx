import type { ReactNode } from 'react'

export interface StoryCardProps {
  className: string
  artwork: string | undefined
  artworkClassName: string
  shadeClassName: string
  indexClassName: string
  bodyClassName: string
  actionClassName: string
  index: string
  eyebrow: string
  title: string
  href: string
  children: ReactNode
  action: ReactNode
}

/** Shared story-card anatomy; each page retains its measured skin classes and content. */
export function StoryCard({
  className,
  artwork,
  artworkClassName,
  shadeClassName,
  indexClassName,
  bodyClassName,
  actionClassName,
  index,
  eyebrow,
  title,
  href,
  children,
  action,
}: StoryCardProps): ReactNode {
  return (
    <article className={className}>
      <img
        className={artworkClassName}
        src={artwork}
        alt=""
        aria-hidden="true"
        width={560}
        height={900}
        loading="lazy"
        decoding="async"
      />
      <div className={shadeClassName} aria-hidden="true" />
      <p className={indexClassName}>
        <span>{index}</span>
        <span>{eyebrow}</span>
      </p>
      <div className={bodyClassName}>
        <h2>{title}</h2>
        {children}
      </div>
      <a className={actionClassName} href={href}>{action}</a>
    </article>
  )
}
