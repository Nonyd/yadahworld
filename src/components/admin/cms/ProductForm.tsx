'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Product } from '@prisma/client'
import { slugify } from '@/lib/slug'
import AdminImageUpload from '@/components/admin/AdminImageUpload'

type Mode = 'create' | 'edit'

function padImages(images: string[]): string[] {
  const a = [...images]
  while (a.length < 5) a.push('')
  return a.slice(0, 5)
}

export default function ProductForm({ mode, initial }: { mode: Mode; initial?: Product }) {
  const router = useRouter()
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial != null ? (initial.price / 100).toFixed(2) : '')
  const [currency, setCurrency] = useState<'NGN' | 'USD'>((initial?.currency as 'NGN' | 'USD') ?? 'NGN')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [inStock, setInStock] = useState(initial?.inStock ?? true)
  const [images, setImages] = useState(() => padImages(initial?.images ?? []))
  const [stripeId, setStripeId] = useState(initial?.stripeId ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
    setSaving(true)
    setError('')
    const imageList = images.map((u) => u.trim()).filter(Boolean)
    const payload = {
      name,
      slug: slug.trim() || null,
      description: description.trim() || null,
      price: priceInt,
      currency,
      category: category.trim() || null,
      inStock,
      images: imageList,
      stripeId: stripeId.trim() || null,
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
    <form onSubmit={onSubmit} className="admin-card max-w-2xl space-y-6 p-6 sm:p-8">
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
          <textarea className="admin-input min-h-[100px] resize-y" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="admin-label">Price ({currency})</label>
          <input
            className="admin-input"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={currency === 'NGN' ? 'e.g. 24999.99' : 'e.g. 49.99'}
            required
          />
          <p className="mt-1 text-xs text-admin-muted">Major units; saved as the smallest currency unit (×100).</p>
        </div>
        <div>
          <label className="admin-label">Currency</label>
          <select className="admin-input" value={currency} onChange={(e) => setCurrency(e.target.value as 'NGN' | 'USD')}>
            <option value="NGN">NGN</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Category</label>
          <input className="admin-input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Merch, Music, Digital…" />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <input id="inStock" type="checkbox" className="h-4 w-4 rounded border-admin-border" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          <label htmlFor="inStock" className="text-sm text-admin-text">
            In stock
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Stripe product ID (optional)</label>
          <input className="admin-input font-mono text-sm" value={stripeId} onChange={(e) => setStripeId(e.target.value)} />
        </div>
      </div>

      <div>
        <p className="admin-label mb-3">Images (up to 5)</p>
        <div className="space-y-6">
          {images.map((url, i) => (
            <AdminImageUpload
              key={i}
              label={`Image ${i + 1}`}
              value={url}
              onChange={(v) => setImageAt(i, v)}
              folder="products"
            />
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
