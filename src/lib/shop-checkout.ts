import { randomUUID } from 'crypto'
import type { Prisma, ProductType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { resolveShippingRate } from '@/lib/shop-shipping'

export type CheckoutLineInput = {
  productId: string
  variantId?: string | null
  quantity: number
}

export type ResolvedCheckoutLine = {
  productId: string
  variantId: string | null
  quantity: number
  unitPrice: number
  name: string
  variantLabel: string | null
  image: string
  type: ProductType
}

export type CheckoutCustomer = {
  name: string
  email: string
  phone?: string | null
}

export type ShippingAddress = {
  name: string
  street: string
  city: string
  state: string
  country: string
  zip?: string | null
  phone?: string | null
}

export async function nextShopOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `YDH-${year}-`
  const last = await tx.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  })
  let seq = 1
  if (last?.orderNumber) {
    const parts = last.orderNumber.split('-')
    const n = parseInt(parts[2] ?? '0', 10)
    if (Number.isFinite(n)) seq = n + 1
  }
  return `${prefix}${String(seq).padStart(4, '0')}`
}

export async function resolveCheckoutLines(
  lines: CheckoutLineInput[],
): Promise<{ ok: true; lines: ResolvedCheckoutLine[]; requiresShipping: boolean } | { ok: false; error: string }> {
  if (!lines.length) return { ok: false, error: 'Cart is empty.' }
  const resolved: ResolvedCheckoutLine[] = []
  let requiresShipping = false

  for (const line of lines) {
    if (!line.productId || line.quantity < 1 || line.quantity > 99) {
      return { ok: false, error: 'Invalid cart line.' }
    }
    const product = await prisma.product.findFirst({
      where: { id: line.productId, isActive: true },
      include: { variants: true },
    })
    if (!product) return { ok: false, error: 'A product is no longer available.' }

    if (product.type === 'PHYSICAL' || product.type === 'BOOK') requiresShipping = true

    const unitBase = product.price
    let unitPrice = unitBase
    let variantLabel: string | null = null
    let variantId: string | null = null

    if (product.variants.length > 0) {
      if (!line.variantId) return { ok: false, error: `Select an option for ${product.name}.` }
      const v = product.variants.find((x) => x.id === line.variantId)
      if (!v) return { ok: false, error: `Invalid variant for ${product.name}.` }
      if (v.stock < line.quantity) return { ok: false, error: `${product.name} is out of stock.` }
      unitPrice = v.price ?? unitBase
      variantLabel = `${v.name}: ${v.value}`
      variantId = v.id
    } else {
      if (product.type !== 'DIGITAL') {
        return { ok: false, error: `${product.name} is not available (missing variants).` }
      }
    }

    const img = product.images[0] ?? ''
    resolved.push({
      productId: product.id,
      variantId,
      quantity: line.quantity,
      unitPrice,
      name: product.name,
      variantLabel,
      image: img,
      type: product.type,
    })
  }

  return { ok: true, lines: resolved, requiresShipping }
}

export function subtotalFromResolved(lines: ResolvedCheckoutLine[]): number {
  return lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0)
}

export async function createCheckoutSession(params: {
  gateway: string
  lines: CheckoutLineInput[]
  customer: CheckoutCustomer
  shippingAddress: ShippingAddress | null
  shippingFee?: number | null
}): Promise<
  | {
      ok: true
      sessionId: string
      reference: string
      subtotal: number
      shippingFee: number
      total: number
      linesResolved: ResolvedCheckoutLine[]
    }
  | { ok: false; error: string }
> {
  const resolved = await resolveCheckoutLines(params.lines)
  if (!resolved.ok) return resolved

  const subtotal = subtotalFromResolved(resolved.lines)
  let shippingFee = 0
  if (resolved.requiresShipping) {
    const rate = await resolveShippingRate({
      state: params.shippingAddress?.state,
      country: params.shippingAddress?.country,
      subtotal,
      requiresShipping: true,
    })
    shippingFee = rate.rate
  }
  if (typeof params.shippingFee === 'number' && Number.isFinite(params.shippingFee) && params.shippingFee >= 0) {
    shippingFee = Math.floor(params.shippingFee)
  }
  const total = subtotal + shippingFee

  if (params.customer.name.trim().length < 2) return { ok: false, error: 'Enter your name.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.customer.email.trim())) {
    return { ok: false, error: 'Enter a valid email.' }
  }
  if (resolved.requiresShipping) {
    const a = params.shippingAddress
    if (!a?.street?.trim() || !a.city?.trim() || !a.state?.trim() || !a.country?.trim()) {
      return { ok: false, error: 'Complete your shipping address.' }
    }
  }

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
  const reference = randomUUID()
  const session = await prisma.shopCheckoutSession.create({
    data: {
      expiresAt,
      reference,
      gateway: params.gateway,
      linesJson: resolved.lines as unknown as Prisma.InputJsonValue,
      customerJson: params.customer as unknown as Prisma.InputJsonValue,
      shippingJson: (params.shippingAddress ?? undefined) as unknown as Prisma.InputJsonValue,
      subtotal,
      shippingFee,
      total,
    },
  })

  return {
    ok: true,
    sessionId: session.id,
    reference,
    subtotal,
    shippingFee,
    total,
    linesResolved: resolved.lines,
  }
}

export async function fulfillShopCheckoutFromReference(params: {
  reference: string
  paidAmountKobo: number
  paymentRef: string
  gateway: string
}): Promise<{ ok: true; orderNumber: string } | { ok: false; error: string; status?: number }> {
  const paidAlready = await prisma.order.findFirst({
    where: { paymentRef: params.paymentRef },
    select: { orderNumber: true },
  })
  if (paidAlready) return { ok: true, orderNumber: paidAlready.orderNumber }

  const session = await prisma.shopCheckoutSession.findUnique({
    where: { reference: params.reference },
  })
  if (!session) return { ok: false, error: 'Checkout session not found.', status: 404 }
  if (session.expiresAt < new Date()) return { ok: false, error: 'Checkout expired. Please try again.', status: 410 }
  if (session.orderId) {
    const ord = await prisma.order.findUnique({ where: { id: session.orderId }, select: { orderNumber: true } })
    if (ord) return { ok: true, orderNumber: ord.orderNumber }
  }

  if (params.paidAmountKobo < session.total) {
    return { ok: false, error: 'Paid amount does not match order total.' }
  }

  const lines = session.linesJson as unknown as ResolvedCheckoutLine[]
  if (!Array.isArray(lines) || !lines.length) return { ok: false, error: 'Invalid session data.' }

  const customer = session.customerJson as CheckoutCustomer
  const shipping = session.shippingJson as ShippingAddress | null | undefined

  try {
    const orderNumber = await prisma.$transaction(async (tx) => {
      const requiresShipping = lines.some((l) => l.type === 'PHYSICAL' || l.type === 'BOOK')
      const orderNumberInner = await nextShopOrderNumber(tx)

      const order = await tx.order.create({
        data: {
          orderNumber: orderNumberInner,
          status: 'PROCESSING',
          customerName: customer.name.trim(),
          customerEmail: customer.email.trim(),
          customerPhone: customer.phone?.trim() || null,
          shippingAddress: requiresShipping && shipping ? (shipping as object) : undefined,
          subtotal: session.subtotal,
          shippingFee: session.shippingFee,
          discount: 0,
          total: session.total,
          paymentGateway: params.gateway,
          paymentRef: params.paymentRef,
          paymentStatus: 'PAID',
          statusHistory: [{ status: 'PROCESSING', at: new Date().toISOString(), note: 'Payment received' }] as unknown as Prisma.InputJsonValue,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              quantity: l.quantity,
              price: l.unitPrice,
              name: l.name,
              variantLabel: l.variantLabel,
            })),
          },
        },
      })

      for (const l of lines) {
        if (l.variantId) {
          const v = await tx.productVariant.findUnique({ where: { id: l.variantId } })
          if (v && v.stock < l.quantity) {
            throw new Error('INSUFFICIENT_STOCK')
          }
          if (v) {
            await tx.productVariant.update({
              where: { id: l.variantId },
              data: { stock: { decrement: l.quantity } },
            })
          }
        }
      }

      await tx.shopCheckoutSession.update({
        where: { id: session.id },
        data: { orderId: order.id },
      })

      return order.orderNumber
    })

    return { ok: true, orderNumber }
  } catch (e) {
    if (e instanceof Error && e.message === 'INSUFFICIENT_STOCK') {
      return { ok: false, error: 'An item went out of stock. You have not been charged twice — contact support if you were debited.', status: 409 }
    }
    console.error('fulfillShopCheckoutFromReference', e)
    return { ok: false, error: 'Could not complete order.' }
  }
}
