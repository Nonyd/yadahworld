import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const ticketCode = req.nextUrl.searchParams.get('ticketCode')
  if (!ticketCode) {
    return NextResponse.json({ error: 'Missing ticket code' }, { status: 400 })
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { ticketCode },
    include: { event: true, tier: true },
  })

  if (!registration) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  return NextResponse.json({
    ticketCode: registration.ticketCode,
    paymentStatus: registration.paymentStatus,
    eventTitle: registration.event.title,
    tierName: registration.tier.name,
    fullName: registration.fullName,
  })
}
