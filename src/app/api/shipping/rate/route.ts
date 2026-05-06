import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { resolveShippingRate } from '@/lib/shop-shipping'

const schema = z.object({
  state: z.string().optional().default(''),
  country: z.string().optional().default('Nigeria'),
  subtotal: z.number().int().min(0),
  requiresShipping: z.boolean().optional().default(true),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  const out = await resolveShippingRate(parsed.data)
  return NextResponse.json(out)
}
