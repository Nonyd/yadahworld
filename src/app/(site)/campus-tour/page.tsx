import type { Metadata } from 'next'
import CampusTourView from '@/components/campus-tour/CampusTourView'
import { getCampusTourVisuals, getSiteCopy } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Campus Tour',
  description:
    'Campus Tour — a ministry expression with Yadah: worship, the gospel, and encountering Jesus on campuses and beyond.',
}

export default async function CampusTourPage() {
  const [visuals, copy] = await Promise.all([getCampusTourVisuals(), getSiteCopy()])
  return <CampusTourView {...visuals} copy={copy} />
}
