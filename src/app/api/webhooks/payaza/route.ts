import { NextRequest, NextResponse } from 'next/server'
import { verifyAndFulfillPayaza } from '@/lib/shop-gateway-verify'
import { getPayazaConfig } from '@/lib/site-settings'

function extractReference(obj: unknown, depth = 0): string | null {
  if (depth > 10 || !obj || typeof obj !== 'object') return null
  const o = obj as Record<string, unknown>
  const keys = [
    'transaction_reference',
    'transactionReference',
    'merchant_reference',
    'merchantReference',
    'reference',
    'tx_ref',
    'txRef',
  ]
  for (const k of keys) {
    const v = o[k]
    if (typeof v === 'string' && v.trim().length >= 8) return v.trim()
  }
  if (typeof o.data === 'object' && o.data !== null) {
    const inner = extractReference(o.data, depth + 1)
    if (inner) return inner
  }
  for (const v of Object.values(o)) {
    if (typeof v === 'object' && v !== null) {
      const inner = extractReference(v, depth + 1)
      if (inner) return inner
    }
  }
  return null
}

/**
 * Payaza payment notifications: re-verify with Payaza API before fulfilling (idempotent).
 * Optional: set `payazaWebhookSecret` in Site Settings; when set, `Authorization: Bearer <secret>` must match.
 */
export async function POST(req: NextRequest) {
  const config = await getPayazaConfig()
  const expectedWh = config.webhookSecret?.trim()
  if (expectedWh) {
    const auth = req.headers.get('authorization')?.trim()
    const bearer = auth?.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : null
    if (bearer !== expectedWh) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const reference = extractReference(payload)
  if (!reference) {
    return NextResponse.json({ received: true })
  }

  await verifyAndFulfillPayaza(reference).catch((e) => {
    console.error('verifyAndFulfillPayaza webhook', e)
  })

  return NextResponse.json({ received: true })
}
