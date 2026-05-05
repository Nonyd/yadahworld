import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ProductForm from '@/components/admin/cms/ProductForm'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  let product = null
  try {
    product = await prisma.product.findUnique({ where: { id: params.id }, include: { variants: true } })
  } catch {
    product = null
  }
  if (!product) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products" className="text-[10px] font-medium uppercase tracking-[0.16em] text-admin-muted hover:text-admin-accent">
          ← Products
        </Link>
      </div>
      <AdminPageHeader title="Edit product" description={product.name} />
      <ProductForm mode="edit" initial={product} />
    </div>
  )
}
