import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import ShopProductGrid from '@/components/shop/ShopProductGrid'
import { getCopyString } from '@/lib/site-copy'
import { getSiteCopy } from '@/lib/site-settings'

export const metadata: Metadata = { title: 'Shop' }

export default async function ShopPage() {
  const copy = await getSiteCopy()
  const s = (k: string) => getCopyString(copy, `shop.${k}`)

  type ShopRow = Prisma.ProductGetPayload<{ include: { variants: true } }>
  let products: ShopRow[] = []
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      include: { variants: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
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
        <ShopProductGrid products={products} copy={copy} />
      </div>
    </div>
  )
}
