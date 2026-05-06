import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import type { PromoCode } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendTicketBundleEmail } from '@/lib/ticket-email'
import { getPaystackConfig } from '@/lib/site-settings'
import { validatePromoForCheckout } from '@/lib/event-promo'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/security'

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  tierId: z.string(),
  quantity: z.number().int().min(1).max(10).optional().default(1),
  promoCode: z.string().optional().nullable(),
  gateway: z.enum(['paystack', 'flutterwave']).optional().default('paystack'),
  claimToken: z.string().optional().nullable(),
})

function tierSalesOpen(tier: { salesStart: Date | null; salesEnd: Date | null }) {
  const now = new Date()
  if (tier.salesStart && tier.salesStart > now) return { ok: false as const, msg: 'Ticket sales have not started for this tier yet.' }
  if (tier.salesEnd && tier.salesEnd < now) return { ok: false as const, msg: 'Ticket sales have ended for this tier.' }
  return { ok: true as const }
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const ip = getClientIp(req)
  const throttle = checkRateLimit({
    key: `api:event-register:${ip}:${params.slug}`,
    max: 8,
    windowMs: 10 * 60 * 1000,
  })
  if (!throttle.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

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

    const { fullName, email, phone, tierId, quantity, promoCode, gateway, claimToken } = parsed.data

    const event = await prisma.event.findFirst({
      where: { slug: params.slug, status: 'PUBLISHED' },
      include: { tiers: true },
    })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (claimToken?.trim()) {
      const claimRow = await prisma.eventRegistration.findFirst({
        where: {
          eventId: event.id,
          tierId,
          waitlistClaimToken: claimToken.trim(),
          paymentStatus: 'WAITLISTED',
          waitlistClaimExpires: { gt: new Date() },
        },
      })
      if (!claimRow) {
        return NextResponse.json({ error: 'Invalid or expired claim link.' }, { status: 400 })
      }
      if (claimRow.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json({ error: 'Use the same email address we sent the invite to.' }, { status: 400 })
      }
      await prisma.eventRegistration.delete({ where: { id: claimRow.id } })
    }

    const tier = event.tiers.find((t) => t.id === tierId)
    if (!tier || !tier.isActive) {
      return NextResponse.json({ error: 'Ticket tier not found' }, { status: 404 })
    }

    const sales = tierSalesOpen(tier)
    if (!sales.ok) {
      return NextResponse.json({ error: sales.msg }, { status: 400 })
    }

    const qty = quantity
    const spotsNeeded = qty

    if (tier.capacity !== null && tier.sold + spotsNeeded > tier.capacity) {
      return NextResponse.json(
        { error: 'Not enough tickets left for this tier.', code: 'TIER_CAPACITY' },
        { status: 409 },
      )
    }

    if (event.totalCapacity) {
      const totalSold = await prisma.eventRegistration.count({
        where: {
          eventId: event.id,
          paymentStatus: { in: ['PAID', 'FREE'] },
        },
      })
      if (totalSold + spotsNeeded > event.totalCapacity) {
        return NextResponse.json({ error: 'This event is sold out.', code: 'EVENT_CAPACITY' }, { status: 409 })
      }
    }

    const duplicateRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId: event.id,
        email,
        paymentStatus: { in: ['PENDING', 'PAID', 'FREE', 'WAITLISTED'] },
      },
      select: { id: true },
    })
    if (duplicateRegistration) {
      return NextResponse.json({ error: 'This email already has an active registration for this event.' }, { status: 409 })
    }

    const subtotal = tier.price * qty
    let discountAmount = 0
    let appliedPromoId: string | null = null
    let promoRow: PromoCode | null = null

    if (promoCode?.trim() && subtotal > 0) {
      promoRow = await prisma.promoCode.findFirst({
        where: {
          eventId: event.id,
          code: { equals: promoCode.trim(), mode: 'insensitive' },
          isActive: true,
        },
      })
      const v = validatePromoForCheckout(promoRow, subtotal)
      if (!v.ok) {
        return NextResponse.json({ error: v.error }, { status: 400 })
      }
      discountAmount = v.discountAmount
      appliedPromoId = v.promo.id
    }

    const totalKobo = Math.max(0, subtotal - discountAmount)

    if (tier.price === 0 || totalKobo === 0) {
      const created = await prisma.$transaction(async (tx) => {
        const rows = []
        for (let i = 0; i < qty; i++) {
          const r = await tx.eventRegistration.create({
            data: {
              eventId: event.id,
              tierId: tier.id,
              fullName,
              email,
              phone,
              quantity: 1,
              amount: 0,
              currency: tier.currency,
              paymentStatus: 'FREE',
              promoCode: promoCode?.trim() || null,
              discountAmount: i === 0 ? discountAmount : 0,
            },
          })
          rows.push(r)
        }
        await tx.ticketTier.update({
          where: { id: tier.id },
          data: { sold: { increment: qty } },
        })
        if (appliedPromoId && discountAmount > 0) {
          await tx.promoCode.update({
            where: { id: appliedPromoId },
            data: { usedCount: { increment: 1 } },
          })
        }
        return rows
      })

      await sendTicketBundleEmail({
        registrations: created,
        event,
        tier,
      })

      return NextResponse.json({
        success: true,
        ticketCodes: created.map((c) => c.ticketCode),
        ticketCode: created[0]?.ticketCode,
        message: 'Registration successful. Check your email for your ticket(s).',
      })
    }

    if (gateway === 'flutterwave') {
      return NextResponse.json(
        { error: 'Flutterwave checkout for events is coming soon. Please choose Paystack.' },
        { status: 503 },
      )
    }

    const { secretKey: paystackKey } = await getPaystackConfig()
    if (!paystackKey) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 503 })
    }

    const orderGroupId = randomUUID()
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

    const created = await prisma.$transaction(async (tx) => {
      const rows = []
      for (let i = 0; i < qty; i++) {
        const r = await tx.eventRegistration.create({
          data: {
            eventId: event.id,
            tierId: tier.id,
            fullName,
            email,
            phone,
            quantity: 1,
            amount: i === 0 ? totalKobo : 0,
            currency: tier.currency,
            paymentStatus: 'PENDING',
            paymentProvider: 'paystack',
            promoCode: promoCode?.trim() || null,
            discountAmount: i === 0 ? discountAmount : 0,
            orderGroupId,
          },
        })
        rows.push(r)
      }
      return rows
    })

    const primary = created[0]!

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: totalKobo,
        currency: tier.currency,
        reference: orderGroupId,
        callback_url: `${siteUrl}/tickets/${primary.ticketCode}?verify=true`,
        metadata: {
          orderGroupId,
          registrationIds: created.map((c) => c.id),
          eventTitle: event.title,
          tierName: tier.name,
          fullName,
          quantity: qty,
        },
      }),
    })

    const paystackData = (await paystackRes.json()) as {
      status?: boolean
      data?: { authorization_url?: string; reference?: string }
      message?: string
    }

    if (!paystackData.status) {
      await prisma.eventRegistration.deleteMany({
        where: { id: { in: created.map((c) => c.id) } },
      })
      return NextResponse.json(
        { error: paystackData.message || 'Payment initialization failed' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paystackData.data?.authorization_url,
      reference: paystackData.data?.reference ?? orderGroupId,
      ticketCode: primary.ticketCode,
    })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
