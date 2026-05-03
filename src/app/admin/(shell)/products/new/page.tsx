import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ProductForm from '@/components/admin/cms/ProductForm'

export default function NewProductPage() {
  return (
    <div>
      <AdminPageHeader title="New product" description="Create a product for the public shop." />
      <ProductForm mode="create" />
    </div>
  )
}
