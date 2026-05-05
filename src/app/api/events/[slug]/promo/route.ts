import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validatePromoForCheckout, computePromoDiscount } from '@/lib/event-promo'
import { z } from 'zod'

const bodySchema = z.object({
  code: z.string().min(1),
  tierId: z.string(),
  quantity: z.number().int().min(1).max(10).optional().default(1),
})

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid data' }, { status: 400 })
  }

  const { code, tierId, quantity } = parsed.data

  const event = await prisma.event.findFirst({
    where: { slug: params.slug, status: 'PUBLISHED' },
    include: { tiers: { where: { id: tierId, isActive: true } } },
  })
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const tier = event.tiers[0]
  if (!tier) {
    return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
  }

  const promo = await prisma.promoCode.findFirst({
    where: {
      eventId: event.id,
      code: { equals: code.trim(), mode: 'insensitive' },
      isActive: true,
    },
  })

  const subtotal = tier.price * quantity
  const v = validatePromoForCheckout(promo, subtotal)
  if (!v.ok) {
    return NextResponse.json({ error: v.error }, { status: 400 })
  }

  const discountAmount = computePromoDiscount(subtotal, v.promo.discountType, v.promo.discountValue)
  const totalAfter = Math.max(0, subtotal - discountAmount)

  return NextResponse.json({
    ok: true,
    discountType: v.promo.discountType,
    discountValue: v.promo.discountValue,
    discountAmount,
    subtotal,
    totalAfter,
    currency: tier.currency,
  })
}
