import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyNextWaitlistForTier } from '@/lib/event-waitlist'

export async function POST(_req: NextRequest, { params }: { params: { registrationId: string } }) {
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

  return NextResponse.json({ ok: true })
}
