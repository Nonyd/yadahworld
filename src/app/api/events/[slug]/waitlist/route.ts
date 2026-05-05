import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWaitlistConfirmationEmail } from '@/lib/event-waitlist'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/security'

const bodySchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  tierId: z.string(),
})

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const ip = getClientIp(req)
  const throttle = checkRateLimit({
    key: `api:event-waitlist:${ip}:${params.slug}`,
    max: 10,
    windowMs: 15 * 60 * 1000,
  })
  if (!throttle.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

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

  const { fullName, email, tierId, phone } = parsed.data

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

  const tierFull = tier.capacity !== null && tier.sold >= tier.capacity
  if (!tierFull) {
    return NextResponse.json({ error: 'This tier still has availability — please register normally.' }, { status: 400 })
  }

  const existing = await prisma.eventRegistration.findFirst({
    where: {
      eventId: event.id,
      email,
      tierId,
      paymentStatus: 'WAITLISTED',
    },
  })
  if (existing) {
    return NextResponse.json({ error: 'You are already on the waitlist for this tier.' }, { status: 409 })
  }

  const position =
    (await prisma.eventRegistration.count({
      where: { tierId, paymentStatus: 'WAITLISTED' },
    })) + 1

  await prisma.eventRegistration.create({
    data: {
      eventId: event.id,
      tierId,
      fullName,
      email,
      phone: phone?.trim() || '',
      quantity: 1,
      amount: 0,
      currency: tier.currency,
      paymentStatus: 'WAITLISTED',
      isWaitlisted: true,
      waitlistPos: position,
    },
  })

  await sendWaitlistConfirmationEmail({
    to: email,
    name: fullName,
    event,
    tier,
    position,
  })

  return NextResponse.json({
    success: true,
    position,
    message: "You're on the waitlist. We'll email you if a spot opens.",
  })
}
