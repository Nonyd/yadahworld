import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendTicketEmail } from '@/lib/ticket-email'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-paystack-signature')
  const secret =
    process.env.PAYSTACK_WEBHOOK_SECRET?.trim() || process.env.PAYSTACK_SECRET_KEY

  if (!secret || !signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body) as { event?: string; data?: { reference?: string } }

  if (event.event === 'charge.success' && event.data?.reference) {
    const reference = event.data.reference

    const registration = await prisma.eventRegistration.findUnique({
      where: { ticketCode: reference },
      include: {
        event: true,
        tier: true,
      },
    })

    if (!registration || registration.paymentStatus === 'PAID') {
      return NextResponse.json({ received: true })
    }

    const updated = await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: {
        paymentStatus: 'PAID',
        paymentRef: event.data.reference,
      },
    })

    await prisma.ticketTier.update({
      where: { id: registration.tierId },
      data: { sold: { increment: 1 } },
    })

    await sendTicketEmail({
      registration: updated,
      event: registration.event,
      tier: registration.tier,
    })
  }

  return NextResponse.json({ received: true })
}
