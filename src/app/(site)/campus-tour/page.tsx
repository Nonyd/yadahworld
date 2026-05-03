import type { Metadata } from 'next'
import CampusTourView from '@/components/campus-tour/CampusTourView'
import { getCampusTourVisuals } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Campus Tour',
  description:
    'Campus Tour — a ministry expression with Yadah: worship, the gospel, and encountering Jesus on campuses and beyond.',
}

export default async function CampusTourPage() {
  const visuals = await getCampusTourVisuals()
  return <CampusTourView {...visuals} />
}
