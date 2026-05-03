import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ShopGrid from '@/components/shop/ShopGrid'
import { getCopyString } from '@/lib/site-copy'
import { getSiteCopy } from '@/lib/site-settings'

export const metadata: Metadata = { title: 'Shop' }

export default async function ShopPage() {
  const copy = await getSiteCopy()
  const s = (k: string) => getCopyString(copy, `shop.${k}`)

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = []
  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    products = []
  }

  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-xl mx-auto">
        <p className="eyebrow mb-6">{s('eyebrow')}</p>
        <h1 className="display-2 text-[var(--body)] mb-20">
          {s('heading1')}
          <br />
          <em className="font-playfair italic text-[var(--accent)]">{s('heading2')}</em>
        </h1>
        <ShopGrid products={products} copy={copy} />
      </div>
    </div>
  )
}
