import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import ShopCheckoutClient from '@/components/shop/ShopCheckoutClient'
import { getPayazaConfig, getSiteSettingsRow } from '@/lib/site-settings'

export const metadata: Metadata = { title: 'Checkout' }

export default async function ShopCheckoutPage() {
  const settings = await getSiteSettingsRow()
  const payazaCfg = await getPayazaConfig()
  const paystackPk = settings?.paystackPublicKey?.trim() || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim() || null
  const flutterwavePk =
    settings?.flutterwavePublicKey?.trim() || process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY?.trim() || null
  const payazaPk = payazaCfg.publicKey?.trim() || null

  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-xl mx-auto">
        <Link href="/shop/cart" className="ui-label text-muted hover:text-accent transition-colors">
          ← Cart
        </Link>
        <h1 className="display-3 text-body mt-8 mb-12">Checkout</h1>
        <Suspense fallback={<p className="body-sm text-muted">Loading checkout…</p>}>
          <ShopCheckoutClient paystackPk={paystackPk} flutterwavePk={flutterwavePk} payazaPk={payazaPk} />
        </Suspense>
      </div>
    </div>
  )
}
