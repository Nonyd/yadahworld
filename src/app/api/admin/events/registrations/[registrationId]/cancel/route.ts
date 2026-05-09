import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyNextWaitlistForTier } from '@/lib/event-waitlist'
import { logAdminApiActivity } from '@/lib/admin-activity-log'

export async function POST(req: NextRequest, { params }: { params: { registrationId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const reg = await prisma.eventRegistration.findUnique({
    where: { id: params.registrationId },
    include: { tier: true },
  })
  if (!reg) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (reg.paymentStatus !== 'PAID' && reg.paymentStatus !== 'FREE') {
    return NextResponse.json({ error: 'Only confirmed tickets can be cancelled this way.' }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.eventRegistration.update({
      where: { id: reg.id },
      data: { paymentStatus: 'CANCELLED' },
    })
    if (reg.paymentStatus === 'PAID' || reg.paymentStatus === 'FREE') {
      await tx.ticketTier.update({
        where: { id: reg.tierId },
        data: { sold: { decrement: 1 } },
      })
    }
  })

  await notifyNextWaitlistForTier(reg.tierId)

  await logAdminApiActivity(session, {
    method: 'POST',
    path: `${req.nextUrl.pathname}${req.nextUrl.search}`,
    req,
  })
  return NextResponse.json({ ok: true })
}
