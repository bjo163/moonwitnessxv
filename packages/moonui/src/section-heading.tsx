import type { ReactNode } from 'react'
import { cn } from './cn.js'

export interface SectionHeadingProps {
  eyebrow: ReactNode
  eyebrowClassName?: string
  titleClassName?: string
  children: ReactNode
}

/** Shared, wrapper-free eyebrow and h2 anatomy for Empire story sections. */
export function SectionHeading({
  eyebrow,
  eyebrowClassName,
  titleClassName,
  children,
}: SectionHeadingProps): ReactNode {
  return (
    <>
      <p className={cn('su-eyebrow', eyebrowClassName)}>{eyebrow}</p>
      <h2 className={titleClassName}>{children}</h2>
    </>
  )
}
