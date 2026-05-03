import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

function getStripe(secret: string) {
  return new Stripe(secret, { apiVersion: '2026-04-22.dahlia' })
}

export async function POST(req: NextRequest) {
  let body: {
    items?: { name: string; price: number; quantity: number; image?: string; currency?: string }[]
    productSlug?: string
    customerEmail?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null)
  if (!settings?.stripeEnabled) {
    return NextResponse.json({ error: 'Stripe checkout is disabled in site settings.' }, { status: 503 })
  }

  const secretKey = settings.stripeSecretKey?.trim() || process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
  }

  const stripe = getStripe(secretKey)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yadahworld.com'

  if (body.productSlug?.trim()) {
    const slug = body.productSlug.trim()
    const product = await prisma.product.findUnique({ where: { slug } }).catch(() => null)
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    if (!product.inStock) return NextResponse.json({ error: 'Out of stock' }, { status: 400 })
    const cur = (product.currency || 'NGN').toLowerCase()
    const img = product.images[0]
    const lineItems = [
      {
        price_data: {
          currency: cur === 'usd' ? 'usd' : 'ngn',
          product_data: {
            name: product.name,
            images: img ? [img] : [],
          },
          unit_amount: product.price,
        },
        quantity: 1,
      },
    ]
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: body.customerEmail,
        success_url: `${siteUrl}/shop/${product.slug}?success=1`,
        cancel_url: `${siteUrl}/shop`,
        metadata: { source: 'yadahworld' },
      })
      return NextResponse.json({ url: session.url })
    } catch (e) {
      console.error('Stripe checkout error:', e)
      return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
    }
  }

  const { items } = body
  if (!items?.length) {
    return NextResponse.json({ error: 'No items' }, { status: 400 })
  }
  const lineItems = items.map((item) => ({
    price_data: {
      currency: (item.currency || 'usd').toLowerCase() === 'ngn' ? 'ngn' : 'usd',
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
      customer_email: body.customerEmail,
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

