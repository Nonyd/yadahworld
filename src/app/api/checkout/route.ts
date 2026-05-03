import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' })
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  let body: { items?: { name: string; price: number; quantity: number; image?: string }[]; customerEmail?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { items, customerEmail } = body
  if (!items?.length) {
    return NextResponse.json({ error: 'No items' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yadahworld.com'

  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: item.image ? [item.image] : [],
      },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }))

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${siteUrl}/shop?success=1`,
      cancel_url: `${siteUrl}/shop`,
      metadata: { source: 'yadahworld' },
    })
    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('Stripe checkout error:', e)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
