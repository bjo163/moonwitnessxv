import type { Metadata } from 'next'
import { Landing } from '../../components/Landing'
import { SITE_ORIGIN } from '../../lib/seo'

export const metadata: Metadata = { alternates: { canonical: `${SITE_ORIGIN}/` } }

export default function Home() { return <Landing locale="en" /> }
