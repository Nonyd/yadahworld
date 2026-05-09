import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { seedShippingRates } from '@/lib/seed-shipping'
import { logAdminApiActivity } from '@/lib/admin-activity-log'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const out = await seedShippingRates()
  await logAdminApiActivity(session, {
    method: 'POST',
    path: '/api/admin/shipping/seed',
  })
  return NextResponse.json(out)
}
