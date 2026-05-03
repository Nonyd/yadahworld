import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ShopGrid from '@/components/shop/ShopGrid'

export const metadata: Metadata = { title: 'Shop' }

export default async function ShopPage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = []
  try {
    products = await prisma.product.findMany({
      where: { inStock: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    products = []
  }

  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-xl mx-auto">
        <p className="eyebrow mb-6">The Store</p>
        <h1 className="display-2 text-[var(--body)] mb-20">
          Shop
          <br />
          <em className="font-playfair italic text-[var(--accent)]">Yadah.</em>
        </h1>
        <ShopGrid products={products} />
      </div>
    </div>
  )
}
