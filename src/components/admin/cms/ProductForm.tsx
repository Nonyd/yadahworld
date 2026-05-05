'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { Product, ProductVariant, ProductType } from '@prisma/client'
import { slugify } from '@/lib/slug'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
import RichTextEditor from '@/components/admin/RichTextEditor'

type Mode = 'create' | 'edit'

type VariantRow = { name: string; value: string; stock: string; price: string; sku: string }

function padImages(images: string[]): string[] {
  const a = [...images]
  while (a.length < 5) a.push('')
  return a.slice(0, 5)
}

function variantsFromInitial(v: ProductVariant[]): VariantRow[] {
  if (v.length) {
    return v.map((x) => ({
      name: x.name,
      value: x.value,
      stock: String(x.stock),
      price: x.price != null ? (x.price / 100).toFixed(2) : '',
      sku: x.sku ?? '',
    }))
  }
  return [{ name: 'Size', value: 'M', stock: '0', price: '', sku: '' }]
}

export default function ProductForm({
  mode,
  initial,
}: {
  mode: Mode
  initial?: Product & { variants: ProductVariant[] }
}) {
  const router = useRouter()
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial != null ? (initial.price / 100).toFixed(2) : '')
  const [comparePrice, setComparePrice] = useState(
    initial?.comparePrice != null ? (initial.comparePrice / 100).toFixed(2) : '',
  )
  const [type, setType] = useState<ProductType>(initial?.type ?? 'PHYSICAL')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '))
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false)
  const [digitalFile, setDigitalFile] = useState(initial?.digitalFile ?? '')
  const [images, setImages] = useState(() => padImages(initial?.images ?? []))
  const [variants, setVariants] = useState<VariantRow[]>(() => variantsFromInitial(initial?.variants ?? []))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const showDigitalFile = type === 'DIGITAL'

  const variantPayload = useMemo(() => {
    return variants
      .filter((v) => v.name.trim() && v.value.trim())
      .map((v) => {
        const stock = parseInt(v.stock, 10)
        const priceMajor = v.price.trim() ? parseFloat(v.price) : NaN
        return {
          name: v.name.trim(),
          value: v.value.trim(),
          stock: Number.isFinite(stock) ? stock : 0,
          price: Number.isFinite(priceMajor) ? Math.round(priceMajor * 100) : null,
          sku: v.sku.trim() || null,
        }
      })
  }, [variants])

  const generateSlug = () => setSlug(slugify(name))

  const setImageAt = (i: number, url: string) => {
    setImages((prev) => {
      const next = [...prev]
      next[i] = url
      return next
    })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const priceInt = Math.round(parseFloat(price) * 100)
    if (!Number.isFinite(priceInt) || priceInt < 0) {
      setError('Enter a valid price.')
      return
    }
    let compareInt: number | null = null
    if (comparePrice.trim()) {
      const c = Math.round(parseFloat(comparePrice) * 100)
      if (!Number.isFinite(c) || c < 0) {
        setError('Enter a valid compare-at price.')
        return
      }
      compareInt = c
    }
    setSaving(true)
    setError('')
    const imageList = images.map((u) => u.trim()).filter(Boolean)
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const payload = {
      name,
      slug: slug.trim() || null,
      description: description.trim() || null,
      price: priceInt,
      comparePrice: compareInt,
      type,
      category: category.trim() || null,
      tags: tagList,
      isActive,
      isFeatured,
      digitalFile: showDigitalFile ? digitalFile.trim() || null : null,
      images: imageList,
      variants: type === 'DIGITAL' && variantPayload.length === 0 ? [] : variantPayload,
    }
    try {
      if (mode === 'create') {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || 'Failed to create')
        }
        router.push('/admin/products')
        router.refresh()
        return
      }
      if (!initial?.id) return
      const res = await fetch(`/api/admin/products/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save')
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-card max-w-3xl space-y-6 p-6 sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="admin-label">Name</label>
          <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="sm:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="admin-label">Slug</label>
            <input className="admin-input font-mono text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <button type="button" className="admin-btn admin-btn-secondary shrink-0 text-[10px]" onClick={generateSlug}>
            Generate from name
          </button>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Description</label>
          <RichTextEditor value={description} onChange={setDescription} placeholder="Product story, sizing, etc." minHeight="220px" />
        </div>
        <div>
          <label className="admin-label">Type</label>
          <select className="admin-input" value={type} onChange={(e) => setType(e.target.value as ProductType)}>
            <option value="PHYSICAL">Physical</option>
            <option value="DIGITAL">Digital</option>
            <option value="BOOK">Book</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Category</label>
          <input className="admin-input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Merch, Books…" />
        </div>
        <div>
          <label className="admin-label">Price (NGN)</label>
          <input
            className="admin-input"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 24999.99"
            required
          />
          <p className="mt-1 text-xs text-admin-muted">Major units; stored in kobo (×100).</p>
        </div>
        <div>
          <label className="admin-label">Compare-at (optional)</label>
          <input className="admin-input" inputMode="decimal" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="Strike price" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Tags (comma-separated)</label>
          <input className="admin-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="new, merch, shirt" />
        </div>
        {showDigitalFile && (
          <div className="sm:col-span-2">
            <label className="admin-label">Digital file URL</label>
            <input className="admin-input font-mono text-sm" value={digitalFile} onChange={(e) => setDigitalFile(e.target.value)} placeholder="https://…" />
          </div>
        )}
        <div className="sm:col-span-2 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-admin-text">
            <input type="checkbox" className="h-4 w-4 rounded border-admin-border" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active (visible in shop)
          </label>
          <label className="flex items-center gap-2 text-sm text-admin-text">
            <input type="checkbox" className="h-4 w-4 rounded border-admin-border" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Featured
          </label>
        </div>
      </div>

      <div>
        <p className="admin-label mb-3">Variants (stock per line). Digital products may leave empty.</p>
        <div className="space-y-3">
          {variants.map((row, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-admin-border p-3 sm:grid-cols-5">
              <input className="admin-input text-xs" placeholder="Name (Size)" value={row.name} onChange={(e) => setVariants((v) => v.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
              <input className="admin-input text-xs" placeholder="Value (M)" value={row.value} onChange={(e) => setVariants((v) => v.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
              <input className="admin-input text-xs" placeholder="Stock" inputMode="numeric" value={row.stock} onChange={(e) => setVariants((v) => v.map((x, j) => (j === i ? { ...x, stock: e.target.value } : x)))} />
              <input className="admin-input text-xs" placeholder="Price override" value={row.price} onChange={(e) => setVariants((v) => v.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} />
              <input className="admin-input text-xs" placeholder="SKU" value={row.sku} onChange={(e) => setVariants((v) => v.map((x, j) => (j === i ? { ...x, sku: e.target.value } : x)))} />
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn-secondary text-[10px]"
            onClick={() => setVariants((v) => [...v, { name: 'Size', value: '', stock: '0', price: '', sku: '' }])}
          >
            Add variant row
          </button>
        </div>
      </div>

      <div>
        <p className="admin-label mb-3">Images (up to 5)</p>
        <div className="space-y-6">
          {images.map((url, i) => (
            <AdminImageUpload key={i} label={`Image ${i + 1}`} value={url} onChange={(v) => setImageAt(i, v)} folder="products" />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
          {saving ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
