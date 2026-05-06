import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession } from '@/lib/shop-checkout'
import { getPayazaConfig } from '@/lib/site-settings'

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
      name: z.string(),
      street: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      zip: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  shippingFee: z.number().int().min(0).optional(),
})

function findPayazaCheckoutUrl(obj: unknown, depth = 0): string | null {
  if (depth > 8 || !obj || typeof obj !== 'object') return null
  const o = obj as Record<string, unknown>
  const keys = [
    'checkout_url',
    'authorization_url',
    'payment_url',
    'payment_link',
    'checkoutLink',
    'link',
    'redirect_url',
    'url',
  ]
  for (const k of keys) {
    const v = o[k]
    if (typeof v === 'string' && /^https?:\/\//i.test(v)) return v
  }
  for (const v of Object.values(o)) {
    const found = findPayazaCheckoutUrl(v, depth + 1)
    if (found) return found
  }
  return null
}

export async function POST(req: NextRequest) {
  const config = await getPayazaConfig()
  if (!config.secretKey) {
    return NextResponse.json({ error: 'Payaza is not configured.' }, { status: 503 })
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
    gateway: 'payaza',
    lines: parsed.data.lines,
    customer: parsed.data.customer,
    shippingAddress: parsed.data.shippingAddress ?? null,
    shippingFee: parsed.data.shippingFee,
  })
  if (!session.ok) {
    return NextResponse.json({ error: session.error }, { status: 400 })
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const baseUrl =
    config.mode === 'live' ? 'https://api.payaza.africa' : 'https://sandbox.payaza.africa'

  const orderRef = session.reference

  const response = await fetch(`${baseUrl}/send-request/checkout/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Payaza-Auth': `Bearer ${config.secretKey}`,
    },
    body: JSON.stringify({
      transaction_type: 'PAYAZA_ACCOUNT',
      requested_amount: session.total,
      currency_code: 'NGN',
      transaction_reference: session.reference,
      email_address: parsed.data.customer.email.trim(),
      merchant_reference: orderRef,
      callback_url: `${siteUrl}/shop/checkout?gw=payaza&ref=${encodeURIComponent(session.reference)}`,
    }),
  })

  let payazaJson: unknown
  try {
    payazaJson = await response.json()
  } catch {
    payazaJson = null
  }

  const paymentUrl = findPayazaCheckoutUrl(payazaJson)
  if (!paymentUrl) {
    await prisma.shopCheckoutSession.deleteMany({ where: { id: session.sessionId } }).catch(() => null)
    const msg =
      payazaJson && typeof payazaJson === 'object' && 'message' in payazaJson
        ? String((payazaJson as { message?: unknown }).message ?? '')
        : ''
    return NextResponse.json(
      { error: msg || 'Payaza initialization failed (no checkout URL in response).' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    paymentUrl,
    reference: session.reference,
    publicKey: config.publicKey,
  })
}
