import type { Metadata } from 'next'
import Link from 'next/link'
import ShopCartView from '@/components/shop/ShopCartView'

export const metadata: Metadata = { title: 'Cart' }

export default function ShopCartPage() {
  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-lg mx-auto">
        <Link href="/shop" className="ui-label text-muted hover:text-accent transition-colors">
          ← Shop
        </Link>
        <h1 className="display-3 text-body mt-8 mb-12">Your cart</h1>
        <ShopCartView />
      </div>
    </div>
  )
}
