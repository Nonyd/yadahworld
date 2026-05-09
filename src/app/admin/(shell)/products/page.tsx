import Link from 'next/link'
import type { Product, ProductVariant } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminProductsTable from '@/components/admin/cms/AdminProductsTable'

export default async function AdminProductsPage() {
  let products: (Product & { variants: ProductVariant[] })[] = []
  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { variants: true },
    })
  } catch {
    products = []
  }

  const tableRows = products.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    price: p.price,
    images: p.images,
    isActive: p.isActive,
    variants: p.variants.map((v) => ({ stock: v.stock })),
  }))

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <AdminPageHeader title="Products" description="Merch, books, and digital items for the public shop." />
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary text-[10px]">
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-admin-muted">No products yet. Add your first product.</p>
      ) : (
        <AdminProductsTable products={tableRows} />
      )}
    </div>
  )
}
