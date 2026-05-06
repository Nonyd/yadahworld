import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { finalizePaidEventRegistrations } from '@/lib/event-paystack-finalize'
import { getPaystackConfig } from '@/lib/site-settings'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-paystack-signature')
  const config = await getPaystackConfig()
  const secret = (config.webhookSecret || config.secretKey).trim()

  if (!secret || !signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')
  const signatureBuffer = Buffer.from(signature, 'utf8')
  const hashBuffer = Buffer.from(hash, 'utf8')

  if (signatureBuffer.length !== hashBuffer.length || !crypto.timingSafeEqual(hashBuffer, signatureBuffer)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { event?: string; data?: { reference?: string } }
  try {
    event = JSON.parse(body) as { event?: string; data?: { reference?: string } }
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (event.event === 'charge.success' && event.data?.reference) {
    await finalizePaidEventRegistrations(event.data.reference)
  }

  return NextResponse.json({ received: true })
}
