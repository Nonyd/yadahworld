import type { Metadata } from 'next'
import GospelPageContent from '@/components/gospel/GospelPageContent'
import { getSiteCopy } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'The Gospel',
  description: 'The good news of Jesus Christ — scripture, invitation, and a simple prayer.',
}

export default async function GospelPage() {
  const copy = await getSiteCopy()
  return <GospelPageContent copy={copy} />
}
