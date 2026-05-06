'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/components/shop/CartProvider'
import { formatNgnKobo } from '@/lib/shop-money'
import { defaultEstimatedShippingKobo } from '@/lib/shop-shipping'

export default function ShopCartView() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart()

  const needsShip = cart.some((i) => i.requiresShipping === true)
  const shipping = defaultEstimatedShippingKobo(needsShip)
  const total = cartTotal + shipping

  if (!cart.length) {
    return (
      <div className="max-w-lg">
        <p className="body-lg mb-6 text-muted">Your cart is empty.</p>
        <Link href="/shop" className="btn-outline inline-flex">
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start">
      <ul className="space-y-6">
        {cart.map((item) => (
          <li
            key={`${item.productId}-${item.variantId ?? ''}`}
            className="flex gap-4 border-b border-[rgba(42,37,32,0.08)] pb-6"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded border border-[rgba(42,37,32,0.08)] bg-surface">
              {item.image ? <Image src={item.image} alt="" fill className="object-cover" sizes="96px" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-playfair text-lg text-body">{item.name}</p>
              {item.variantLabel && <p className="body-sm text-muted">{item.variantLabel}</p>}
              <p className="ui-label mt-2 text-accent">{formatNgnKobo(item.price)} each</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="sr-only" htmlFor={`q-${item.productId}`}>
                  Quantity
                </label>
                <input
                  id={`q-${item.productId}`}
                  type="number"
                  min={1}
                  max={99}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.productId, item.variantId, Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  className="w-20 border border-[rgba(42,37,32,0.12)] bg-transparent px-2 py-1 font-jost text-sm"
                />
                <button type="button" className="ui-label text-accent hover:underline" onClick={() => removeFromCart(item.productId, item.variantId)}>
                  Remove
                </button>
              </div>
            </div>
            <p className="shrink-0 font-playfair text-body">{formatNgnKobo(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <aside className="border manuscript-frame border-[rgba(42,37,32,0.1)] bg-surface/40 p-6">
        <p className="eyebrow mb-4">Order summary</p>
        <div className="space-y-2 font-jost text-sm text-body">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatNgnKobo(cartTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping (est.)</span>
            <span>{formatNgnKobo(shipping)}</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-[rgba(42,37,32,0.08)] pt-4 font-playfair text-lg">
            <span>Total</span>
            <span className="text-accent">{formatNgnKobo(total)}</span>
          </div>
        </div>
        <Link href="/shop/checkout" className="btn-primary mt-8 flex w-full justify-center">
          Proceed to Checkout
        </Link>
      </aside>
    </div>
  )
}
