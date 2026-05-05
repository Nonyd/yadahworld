import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAndFulfillFlutterwave } from '@/lib/shop-gateway-verify'

const schema = z.object({ txRef: z.string().min(8) })

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid txRef' }, { status: 400 })
  }

  const out = await verifyAndFulfillFlutterwave(parsed.data.txRef)
  if (!out.ok) {
    return NextResponse.json({ error: out.error }, { status: out.status })
  }
  return NextResponse.json({ orderNumber: out.orderNumber })
}
