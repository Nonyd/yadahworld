import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession } from '@/lib/shop-checkout'
import { paystackSecret } from '@/lib/shop-payments'

const bodySchema = z.object({
  lines: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional().nullable(),
      quantity: z.number().int().min(1).max(99),
    }),
  ),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional().nullable(),
  }),
  shippingAddress: z
    .object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      zip: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export async function POST(req: NextRequest) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null)
  const secret = paystackSecret(settings)
  if (!secret) {
    return NextResponse.json({ error: 'Paystack is not configured.' }, { status: 503 })
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

  const session = await createCheckoutSession({
    gateway: 'paystack',
    lines: parsed.data.lines,
    customer: parsed.data.customer,
    shippingAddress: parsed.data.shippingAddress ?? null,
  })
  if (!session.ok) {
    return NextResponse.json({ error: session.error }, { status: 400 })
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: parsed.data.customer.email.trim(),
      amount: session.total,
      currency: 'NGN',
      reference: session.reference,
      callback_url: `${siteUrl}/shop/checkout?gw=paystack&ref=${encodeURIComponent(session.reference)}`,
      metadata: { shop_checkout: session.reference },
    }),
  })

  const paystackData = (await paystackRes.json()) as {
    status?: boolean
    data?: { authorization_url?: string; reference?: string }
    message?: string
  }

  if (!paystackData.status || !paystackData.data?.authorization_url) {
    await prisma.shopCheckoutSession.deleteMany({ where: { id: session.sessionId } }).catch(() => null)
    return NextResponse.json(
      { error: paystackData.message || 'Paystack initialization failed.' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    authorizationUrl: paystackData.data.authorization_url,
    reference: paystackData.data.reference ?? session.reference,
  })
}
