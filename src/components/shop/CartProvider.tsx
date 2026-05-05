'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { CartItem } from '@/lib/cart'
import { SHOP_CART_STORAGE_KEY, cartLineKey } from '@/lib/cart'

type CartContextValue = {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string, variantId?: string | null) => void
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
}

const CartContext = createContext<CartContextValue | null>(null)

function readStorage(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SHOP_CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is CartItem =>
        x &&
        typeof x === 'object' &&
        typeof (x as CartItem).productId === 'string' &&
        typeof (x as CartItem).name === 'string' &&
        typeof (x as CartItem).price === 'number' &&
        typeof (x as CartItem).quantity === 'number' &&
        typeof (x as CartItem).image === 'string',
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setCart(readStorage())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(SHOP_CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {
      /* ignore */
    }
  }, [cart, hydrated])

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const key = cartLineKey(item.productId, item.variantId)
      const idx = prev.findIndex((p) => cartLineKey(p.productId, p.variantId) === key)
      if (idx === -1) return [...prev, { ...item, quantity: Math.min(99, Math.max(1, item.quantity)) }]
      const next = [...prev]
      const q = next[idx].quantity + item.quantity
      next[idx] = { ...next[idx], quantity: Math.min(99, Math.max(1, q)) }
      return next
    })
  }, [])

  const removeFromCart = useCallback((productId: string, variantId?: string | null) => {
    setCart((prev) => prev.filter((p) => cartLineKey(p.productId, p.variantId) !== cartLineKey(productId, variantId)))
  }, [])

  const updateQuantity = useCallback((productId: string, variantId: string | null | undefined, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId, variantId)
      return
    }
    setCart((prev) =>
      prev.map((p) =>
        cartLineKey(p.productId, p.variantId) === cartLineKey(productId, variantId)
          ? { ...p, quantity: Math.min(99, quantity) }
          : p,
      ),
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => setCart([]), [])

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart])
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart])

  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
