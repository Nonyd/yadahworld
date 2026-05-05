import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAndFulfillFlutterwave, verifyAndFulfillPayaza, verifyAndFulfillPaystack } from '@/lib/shop-gateway-verify'

const schema = z.object({
  gateway: z.enum(['paystack', 'flutterwave', 'payaza']),
  reference: z.string().min(4),
})

/** Completes checkout after the customer returns from a payment provider (idempotent). */
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { gateway, reference } = parsed.data

  if (gateway === 'paystack') {
    const out = await verifyAndFulfillPaystack(reference)
    if (!out.ok) return NextResponse.json({ error: out.error }, { status: out.status })
    return NextResponse.json({ orderNumber: out.orderNumber })
  }
  if (gateway === 'flutterwave') {
    const out = await verifyAndFulfillFlutterwave(reference)
    if (!out.ok) return NextResponse.json({ error: out.error }, { status: out.status })
    return NextResponse.json({ orderNumber: out.orderNumber })
  }
  const out = await verifyAndFulfillPayaza(reference)
  if (!out.ok) return NextResponse.json({ error: out.error }, { status: out.status })
  return NextResponse.json({ orderNumber: out.orderNumber })
}
