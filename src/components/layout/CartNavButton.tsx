'use client'

import Link from 'next/link'
import { useCart } from '@/components/shop/CartProvider'

export default function CartNavButton({ onDarkHero }: { onDarkHero: boolean }) {
  const { cartCount } = useCart()
  const color = onDarkHero ? 'rgba(253,250,245,0.75)' : 'var(--muted)'

  return (
    <Link
      href="/shop/cart"
      className="ui-label relative inline-flex items-center gap-1.5 link-underline"
      style={{ color }}
      aria-label={`Shopping cart${cartCount ? `, ${cartCount} items` : ', empty'}`}
    >
      <span className="sr-only">Cart</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="20" r="1" fill="currentColor" />
        <circle cx="18" cy="20" r="1" fill="currentColor" />
      </svg>
      {cartCount > 0 ? (
        <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 font-jost text-[10px] font-medium text-white">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      ) : null}
    </Link>
  )
}
