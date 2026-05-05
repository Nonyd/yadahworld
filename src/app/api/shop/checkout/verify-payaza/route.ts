import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAndFulfillPayaza } from '@/lib/shop-gateway-verify'

const schema = z.object({ reference: z.string().min(4) })

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid reference' }, { status: 400 })
  }

  const out = await verifyAndFulfillPayaza(parsed.data.reference)
  if (!out.ok) {
    return NextResponse.json({ error: out.error }, { status: out.status })
  }
  return NextResponse.json({ orderNumber: out.orderNumber })
}
