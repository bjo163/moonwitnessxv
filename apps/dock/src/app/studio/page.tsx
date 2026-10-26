import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { GeneratorStudio } from '@/ui/client/GeneratorStudio'

export const metadata: Metadata = {
  title: 'Vector Studio // Generative Avatars, Seals & Glyphs',
  description:
    'Interactive algorithmic SVG generator for Moonwitness cyber-monastic avatars, heraldic radio seals, and vector icons.',
}

export default function StudioPage(): ReactNode {
  return <GeneratorStudio />
}
