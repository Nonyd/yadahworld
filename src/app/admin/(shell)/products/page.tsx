import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DeleteProductButton from '@/components/admin/cms/DeleteProductButton'

function formatMoney(currency: string, amountMinor: number) {
  const major = amountMinor / 100
  const c = (currency || 'NGN').toUpperCase()
  if (c === 'NGN') return `₦${major.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
  if (c === 'USD') return `$${major.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `${c} ${major.toFixed(2)}`
}

export default async function AdminProductsPage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = []
  try {
    products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  } catch {
    products = []
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <AdminPageHeader title="Products" description="Merch, music, and digital items shown on the public shop." />
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary text-[10px]">
          New product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-admin-muted">No products yet. Add your first product.</p>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border text-[10px] font-medium uppercase tracking-wider text-admin-muted">
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">In stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const img = p.images[0]
                return (
                  <tr key={p.id} className="border-b border-admin-border/80 last:border-0">
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded border border-admin-border bg-admin-bg">
                        {img ? <Image src={img} alt="" fill className="object-cover" sizes="48px" /> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-admin-text">{p.name}</td>
                    <td className="px-4 py-3 text-admin-muted">{formatMoney(p.currency, p.price)}</td>
                    <td className="px-4 py-3 text-admin-muted">{p.category || '—'}</td>
                    <td className="px-4 py-3">{p.inStock ? 'Yes' : 'No'}</td>
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
