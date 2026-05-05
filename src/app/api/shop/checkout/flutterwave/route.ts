import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession } from '@/lib/shop-checkout'
import { flutterwaveSecret } from '@/lib/shop-payments'

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
  const secret = flutterwaveSecret(settings)
  if (!secret) {
    return NextResponse.json({ error: 'Flutterwave is not configured.' }, { status: 503 })
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
    gateway: 'flutterwave',
    lines: parsed.data.lines,
    customer: parsed.data.customer,
    shippingAddress: parsed.data.shippingAddress ?? null,
  })
  if (!session.ok) {
    return NextResponse.json({ error: session.error }, { status: 400 })
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const amountMajor = session.total / 100

  const fwRes = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: session.reference,
      amount: amountMajor,
      currency: 'NGN',
      redirect_url: `${siteUrl}/shop/checkout?gw=flutterwave&ref=${encodeURIComponent(session.reference)}`,
      customer: {
        email: parsed.data.customer.email.trim(),
        name: parsed.data.customer.name.trim(),
        phonenumber: parsed.data.customer.phone?.trim() || undefined,
      },
      customizations: { title: 'Yadah Shop' },
    }),
  })

  const fwData = (await fwRes.json()) as { status?: string; message?: string; data?: { link?: string } }
  if (fwData.status !== 'success' || !fwData.data?.link) {
    await prisma.shopCheckoutSession.deleteMany({ where: { id: session.sessionId } }).catch(() => null)
    return NextResponse.json({ error: fwData.message || 'Flutterwave initialization failed.' }, { status: 500 })
  }

  return NextResponse.json({
    paymentLink: fwData.data.link,
    txRef: session.reference,
    publicKey: settings?.flutterwavePublicKey?.trim() || process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
  })
}
