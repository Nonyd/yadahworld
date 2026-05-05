import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendTicketEmail } from '@/lib/ticket-email'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-paystack-signature')
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim()

  if (!secret || !signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')
  const signatureBuffer = Buffer.from(signature, 'utf8')
  const hashBuffer = Buffer.from(hash, 'utf8')

  if (signatureBuffer.length !== hashBuffer.length || !crypto.timingSafeEqual(hashBuffer, signatureBuffer)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { event?: string; data?: { reference?: string } }
  try {
    event = JSON.parse(body) as { event?: string; data?: { reference?: string } }
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

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
