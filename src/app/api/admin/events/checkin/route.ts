import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { ticketCode?: string; eventId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const ticketCode = typeof body.ticketCode === 'string' ? body.ticketCode.trim() : ''
  const eventId = typeof body.eventId === 'string' ? body.eventId.trim() : ''
  if (!ticketCode) {
    return NextResponse.json({ error: 'Ticket code required' }, { status: 400 })
  }

  const registration = await prisma.eventRegistration.findFirst({
    where: {
      ticketCode: {
        equals: ticketCode,
        mode: 'insensitive',
      },
    },
    include: { event: true, tier: true },
  })

  if (!registration) {
    return NextResponse.json({
      success: false,
      status: 'INVALID',
      message: 'Ticket not found',
    })
  }

  if (eventId && registration.eventId !== eventId) {
    return NextResponse.json({
      success: false,
      status: 'WRONG_EVENT',
      message: 'This ticket is for a different event',
      name: registration.fullName,
    })
  }

  if (registration.paymentStatus === 'PENDING') {
    return NextResponse.json({
      success: false,
      status: 'UNPAID',
      message: 'Payment not confirmed',
      name: registration.fullName,
    })
  }

  if (registration.paymentStatus === 'WAITLISTED') {
    return NextResponse.json({
      success: false,
      status: 'INVALID',
      message: 'Waitlisted — not a valid ticket yet',
      name: registration.fullName,
    })
  }

  if (registration.paymentStatus === 'CANCELLED' || registration.paymentStatus === 'REFUNDED') {
    return NextResponse.json({
      success: false,
      status: 'INVALID',
      message: 'This ticket is no longer valid',
      name: registration.fullName,
    })
  }

  if (registration.checkedIn) {
    return NextResponse.json({
      success: false,
      status: 'ALREADY_CHECKED_IN',
      message: 'Already checked in',
      name: registration.fullName,
      tier: registration.tier.name,
      checkedInAt: registration.checkedInAt,
    })
  }

  const updated = await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
      checkedInBy: session.user?.email ?? 'admin',
    },
  })

  return NextResponse.json({
    success: true,
    status: 'SUCCESS',
    message: 'Check-in successful',
    name: registration.fullName,
    tier: registration.tier.name,
    event: registration.event.title,
    checkedInAt: updated.checkedInAt,
  })
}
