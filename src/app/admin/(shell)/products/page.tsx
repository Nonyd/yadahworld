import Link from 'next/link'
import Image from 'next/image'
import type { Product, ProductVariant } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DeleteProductButton from '@/components/admin/cms/DeleteProductButton'
import { formatNgnKobo } from '@/lib/shop-money'

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
        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border text-[10px] font-medium uppercase tracking-wider text-admin-muted">
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const img = p.images[0]
                const stock = p.variants.length ? p.variants.reduce((s, v) => s + v.stock, 0) : p.type === 'DIGITAL' ? '—' : 0
                return (
                  <tr key={p.id} className="border-b border-admin-border/80 last:border-0">
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded border border-admin-border bg-admin-bg">
                        {img ? <Image src={img} alt="" fill className="object-cover" sizes="48px" /> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-admin-text">{p.name}</td>
                    <td className="px-4 py-3 text-admin-muted">{p.type}</td>
                    <td className="px-4 py-3 text-admin-muted">{formatNgnKobo(p.price)}</td>
                    <td className="px-4 py-3 text-admin-muted">{stock}</td>
                    <td className="px-4 py-3">{p.isActive ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${p.id}`} className="admin-btn admin-btn-secondary text-[10px]">
                          Edit
                        </Link>
                        <DeleteProductButton id={p.id} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
