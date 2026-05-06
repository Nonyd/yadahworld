import { NextRequest, NextResponse } from 'next/server'
import { verifyAndFulfillFlutterwave } from '@/lib/shop-gateway-verify'
import { getFlutterwaveConfig } from '@/lib/site-settings'

function extractTxRef(body: unknown): string {
  if (!body || typeof body !== 'object') return ''
  const root = body as Record<string, unknown>
  const data = root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : null
  const tx =
    (data && typeof data.tx_ref === 'string' && data.tx_ref) ||
    (typeof root.tx_ref === 'string' && root.tx_ref) ||
    ''
  return tx.trim()
}

/**
 * Flutterwave sends the dashboard “secret hash” in the `verif-hash` header — store it in
 * **Settings → Integrations → Flutterwave → Webhook secret**.
 */
export async function POST(req: NextRequest) {
  const config = await getFlutterwaveConfig()
  const expected = config.webhookSecret?.trim()
  if (!expected) {
    return NextResponse.json({ error: 'Flutterwave webhook secret is not configured.' }, { status: 503 })
  }

  const signature = req.headers.get('verif-hash')?.trim()
  if (!signature || signature !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const txRef = extractTxRef(body)
  if (txRef) {
    await verifyAndFulfillFlutterwave(txRef).catch((e) => console.error('verifyAndFulfillFlutterwave webhook', e))
  }

  return NextResponse.json({ received: true })
}
