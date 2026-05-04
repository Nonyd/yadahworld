import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTicketEmail } from '@/lib/ticket-email'
import { z } from 'zod'

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  tierId: z.string(),
})

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Invalid data'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { fullName, email, phone, tierId } = parsed.data

    const event = await prisma.event.findFirst({
      where: { slug: params.slug, status: 'PUBLISHED' },
      include: { tiers: true },
    })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const tier = event.tiers.find((t) => t.id === tierId)
    if (!tier || !tier.isActive) {
      return NextResponse.json({ error: 'Ticket tier not found' }, { status: 404 })
    }

    if (tier.capacity !== null && tier.sold >= tier.capacity) {
      return NextResponse.json({ error: 'This ticket tier is sold out' }, { status: 409 })
    }

    if (event.totalCapacity) {
      const totalSold = await prisma.eventRegistration.count({
        where: {
          eventId: event.id,
          paymentStatus: { in: ['PAID', 'FREE'] },
        },
      })
      if (totalSold >= event.totalCapacity) {
        return NextResponse.json({ error: 'This event is sold out' }, { status: 409 })
      }
    }

    if (tier.price === 0) {
      const registration = await prisma.eventRegistration.create({
        data: {
          eventId: event.id,
          tierId: tier.id,
          fullName,
          email,
          phone,
          amount: 0,
          currency: tier.currency,
          paymentStatus: 'FREE',
        },
      })

      await prisma.ticketTier.update({
        where: { id: tier.id },
        data: { sold: { increment: 1 } },
      })

      await sendTicketEmail({ registration, event, tier })

      return NextResponse.json({
        success: true,
        ticketCode: registration.ticketCode,
        message: 'Registration successful. Check your email for your ticket.',
      })
    }

    const paystackKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackKey) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 503 })
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        tierId: tier.id,
        fullName,
        email,
        phone,
        amount: tier.price,
        currency: tier.currency,
        paymentStatus: 'PENDING',
        paymentProvider: 'paystack',
      },
    })

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: tier.price,
        currency: tier.currency,
        reference: registration.ticketCode,
        callback_url: `${siteUrl}/tickets/${registration.ticketCode}?verify=true`,
        metadata: {
          registrationId: registration.id,
          ticketCode: registration.ticketCode,
          eventTitle: event.title,
          tierName: tier.name,
          fullName,
        },
      }),
    })

    const paystackData = (await paystackRes.json()) as {
      status?: boolean
      data?: { authorization_url?: string; reference?: string }
      message?: string
    }

    if (!paystackData.status) {
      await prisma.eventRegistration.delete({
        where: { id: registration.id },
      })
      return NextResponse.json(
        { error: paystackData.message || 'Payment initialization failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paystackData.data?.authorization_url,
      reference: paystackData.data?.reference,
    })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
