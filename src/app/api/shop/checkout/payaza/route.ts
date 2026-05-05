import { NextRequest, NextResponse } from 'next/server'
import { payazaSecret } from '@/lib/shop-payments'

export async function POST(_req: NextRequest) {
  if (!payazaSecret()) {
    return NextResponse.json({ error: 'Payaza is not configured (PAYAZA_SECRET_KEY).' }, { status: 503 })
  }
  return NextResponse.json(
    {
      error:
        'Payaza hosted checkout is not wired in this codebase yet. Use Paystack or Flutterwave, or implement Payaza initialize/redirect using your merchant API docs (api.payaza.africa, Payaza-Auth header).',
    },
    { status: 501 },
  )
}
