'use client'

import { useState } from 'react'
import { useCart } from '@/components/shop/CartProvider'
import type { CartItem } from '@/lib/cart'

export default function AddToCartButton({
  item,
  disabled,
  label = 'Add to Cart',
}: {
  item: Omit<CartItem, 'quantity'> & { quantity?: number }
  disabled?: boolean
  label?: string
}) {
  const { addToCart } = useCart()
  const [done, setDone] = useState(false)

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        addToCart({ ...item, quantity: item.quantity ?? 1 })
        setDone(true)
        window.setTimeout(() => setDone(false), 2000)
      }}
      className="btn-primary disabled:opacity-50"
    >
      {done ? 'Added' : label}
    </button>
  )
}
